import re
from typing import Optional, Dict, Any, List

from .ocr_result import OCRResult
from .postprocess import group_into_lines, line_to_text, normalize_unit


# ============================================================
# HELPERS
# ============================================================

def clean_ocr_text(text: str) -> str:
    """
    Clean OCR text for matching.
    Original OCR text is always preserved separately.
    """
    text = text.upper().strip()
    text = re.sub(r"\s+", " ", text)
    return text


def normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def clean_value(text: str) -> str:
    """
    Clean a declaration value while preserving meaningful text.
    """
    text = normalize_spaces(text)
    text = re.sub(r"^[\s:.\-–—]+", "", text)
    text = re.sub(r"[\s:.\-–—]+$", "", text)
    return text.strip()


def make_result(
    field: str,
    value: str,
    raw_text: str,
    confidence: float,
    bbox: Optional[List[int]] = None,
    polygon: Optional[List[List[int]]] = None,
    unit: Optional[str] = None,
    currency: Optional[str] = None,
    status: str = "detected"
) -> Dict[str, Any]:

    result = {
        "field": field,
        "value": clean_value(value),
        "raw_text": raw_text,
        "confidence": round(float(confidence), 4),
        "bbox": bbox if bbox is not None else [0, 0, 0, 0],
        "polygon": polygon if polygon is not None else [],
        "source": "ocr",
        "status": status
    }

    if unit:
        result["unit"] = normalize_unit(unit)

    if currency:
        result["currency"] = currency

    return result


def make_field_candidate(
    field: str,
    value: str,
    result: OCRResult,
    unit: Optional[str] = None,
    currency: Optional[str] = None,
    status: str = "detected"
) -> Dict[str, Any]:

    return make_result(
        field=field,
        value=value,
        raw_text=result.text,
        confidence=result.confidence,
        bbox=result.bbox,
        polygon=result.polygon,
        unit=unit,
        currency=currency,
        status=status
    )


# ============================================================
# 1. MRP (MAXIMUM RETAIL PRICE)
# ============================================================

def extract_mrp(
    text: str,
    confidence: float,
    bbox,
    polygon=None
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    patterns = [
        # MRP ₹499 / MRP Rs. 499 / MRP 499.00
        r"\bMRP\s*[:.\-]?\s*(?:RS\.?|₹|INR)?\s*(\d+(?:[.,]\d+)?)(?:\s*/-)?",
        # MRPR.499 / MRP499
        r"\bMRP\s*R?\.?\s*(?:RS\.?|₹)?\s*(\d+(?:[.,]\d+)?)(?:\s*/-)?",
        # Maximum Retail Price
        r"MAXIMUM\s+RETAIL\s+PRICE\s*[:.\-]?\s*(?:RS\.?|₹|INR)?\s*(\d+(?:[.,]\d+)?)(?:\s*/-)?",
        # Incl of all taxes
        r"(?:INCL\.?|INCLUSIVE)\s+OF\s+ALL\s+TAXES.*?(\d+(?:[.,]\d+)?)",
    ]

    for pattern in patterns:
        match = re.search(pattern, cleaned, flags=re.IGNORECASE)
        if match:
            raw_val = match.group(1).replace(",", "")
            return make_result(
                field="mrp",
                value=f"₹{raw_val}",
                raw_text=text,
                confidence=confidence,
                bbox=bbox,
                polygon=polygon,
                currency="INR"
            )

    return None


# ============================================================
# 2. NET QUANTITY / NET WEIGHT
# ============================================================

def extract_net_quantity(
    text: str,
    confidence: float,
    bbox,
    polygon=None
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    # Net Quantity / Net Qty / Net Content
    pattern = (
        r"(?:N\.?\s*QTY|NET\s*QTY|NET\s*QUANTITY|NET\s*CONTENT|NET\s*VOL(?:UME)?)"
        r"\s*[:.\-]?\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*"
        r"(KG|KGS|G|GM|GMS|GRAM|GRAMS|ML|L|LTR|LITRE|LITRES|MG|PCS|PIECES|N|UNITS?)\b"
    )

    match = re.search(pattern, cleaned, flags=re.IGNORECASE)
    if match:
        val = match.group(1)
        raw_unit = match.group(2).lower()
        norm_unit = normalize_unit(raw_unit)
        return make_result(
            field="net_quantity",
            value=f"{val} {norm_unit}",
            raw_text=text,
            confidence=confidence,
            bbox=bbox,
            polygon=polygon,
            unit=norm_unit
        )

    return None


def extract_net_weight(
    text: str,
    confidence: float,
    bbox,
    polygon=None
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    # Net Wt / Net Weight
    pattern = (
        r"(?:NET\s*\.?\s*WT|NET\s*\.?\s*WEIGHT)"
        r"\s*[:.\-]?\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*"
        r"(KG|KGS|G|GM|GMS|GRAM|GRAMS|ML|L|LTR|LITRE|LITRES|MG)\b"
    )

    match = re.search(pattern, cleaned, flags=re.IGNORECASE)
    if match:
        val = match.group(1)
        raw_unit = match.group(2).lower()
        norm_unit = normalize_unit(raw_unit)
        return make_result(
            field="net_quantity",
            value=f"{val} {norm_unit}",
            raw_text=text,
            confidence=confidence,
            bbox=bbox,
            polygon=polygon,
            unit=norm_unit
        )

    return None


# ============================================================
# 3. UNIT SALE PRICE (USP)
# ============================================================

def extract_unit_sale_price(
    text: str,
    confidence: float,
    bbox,
    polygon=None
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    # Unit Sale Price / USP: Rs. 0.50 / g
    pattern = (
        r"(?:UNIT\s*SALE\s*PRICE|USP)"
        r"\s*[:.\-]?\s*"
        r"(?:RS\.?|₹|INR)?\s*"
        r"(\d+(?:\.\d+)?)"
        r"(?:\s*/?\s*(?:PER|\/)\s*(KG|KGS|G|GM|GMS|ML|L|LTR|MG|PC|PIECE|UNIT|N))?"
    )

    match = re.search(pattern, cleaned, flags=re.IGNORECASE)
    if match:
        val = match.group(1)
        raw_unit = match.group(2).lower() if match.group(2) else ""
        norm_unit = normalize_unit(raw_unit) if raw_unit else ""
        disp_val = f"₹{val}/{norm_unit}" if norm_unit else f"₹{val}"
        return make_result(
            field="unit_sale_price",
            value=disp_val,
            raw_text=text,
            confidence=confidence,
            bbox=bbox,
            polygon=polygon,
            unit=norm_unit if norm_unit else None,
            currency="INR"
        )

    return None


def extract_standalone_unit_price(
    text: str,
    confidence: float,
    bbox,
    polygon=None
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    # e.g., Rs.0.25/- PER g, ₹1.50/g
    pattern = (
        r"(?:RS\.?|₹)\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*/?-?\s*"
        r"(?:PER|\/)\s*"
        r"(KG|KGS|G|GM|GMS|ML|L|LTR|MG|PC|PIECE|UNIT|N)\b"
    )

    match = re.search(pattern, cleaned, flags=re.IGNORECASE)
    if match:
        val = match.group(1)
        raw_unit = match.group(2).lower()
        norm_unit = normalize_unit(raw_unit)
        return make_result(
            field="unit_sale_price",
            value=f"₹{val}/{norm_unit}",
            raw_text=text,
            confidence=confidence,
            bbox=bbox,
            polygon=polygon,
            unit=norm_unit,
            currency="INR"
        )

    return None


# ============================================================
# 4. MANUFACTURER
# ============================================================

def extract_manufacturer(
    result: OCRResult
) -> Optional[Dict[str, Any]]:

    text = normalize_spaces(result.text)

    patterns = [
        r"MANUFACTURED\s+BY\s*[:\-]?\s*(.+)",
        r"MANUFACTURED\s*&\s*MARKETED\s+BY\s*[:\-]?\s*(.+)",
        r"MANUFACTURED\s+AND\s+MARKETED\s+BY\s*[:\-]?\s*(.+)",
        r"MFD\.?\s*BY\s*[:\-]?\s*(.+)",
        r"MFG\.?\s*BY\s*[:\-]?\s*(.+)",
        r"MANUF(?:ACTURED)?\.?\s*BY\s*[:\-]?\s*(.+)",
        r"MANUFACTURER\s*[:\-]?\s*(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = clean_value(match.group(1))
            if value and len(value) >= 3:
                return make_field_candidate(
                    field="manufacturer",
                    value=value,
                    result=result
                )

    # IMPORTANT:
    # Do not infer manufacturer merely from a corporate suffix such as
    # "PVT. LTD." A company name is a manufacturer only when explicit
    # manufacturing context is present (e.g. MANUFACTURED BY / MFD BY).
    # This prevents consumer-service/marketing addresses from becoming
    # false manufacturer declarations.
    return None


# ============================================================
# 5. PACKER
# ============================================================

def extract_packer(
    result: OCRResult
) -> Optional[Dict[str, Any]]:

    text = normalize_spaces(result.text)

    patterns = [
        r"PACKED\s+BY\s*[:\-]?\s*(.+)",
        r"PACKER\s*[:\-]?\s*(.+)",
        r"PACKED\s+AND\s+MARKETED\s+BY\s*[:\-]?\s*(.+)",
        r"PKD\.?\s*BY\s*[:\-]?\s*(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = clean_value(match.group(1))
            if value and len(value) >= 3:
                return make_field_candidate(
                    field="packer",
                    value=value,
                    result=result
                )

    return None


# ============================================================
# 6. IMPORTER
# ============================================================

def extract_importer(
    result: OCRResult
) -> Optional[Dict[str, Any]]:

    text = normalize_spaces(result.text)

    patterns = [
        r"IMPORTED\s+BY\s*[:\-]?\s*(.+)",
        r"IMPORTER\s*[:\-]?\s*(.+)",
        r"IMPORTED\s+AND\s+MARKETED\s+BY\s*[:\-]?\s*(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = clean_value(match.group(1))
            if value and len(value) >= 3:
                return make_field_candidate(
                    field="importer",
                    value=value,
                    result=result
                )

    return None


# ============================================================
# 7. CONSUMER CARE
# ============================================================

def extract_consumer_care(
    result: OCRResult
) -> Optional[Dict[str, Any]]:

    text = normalize_spaces(result.text)

    patterns = [
        r"CONSUMER\s+CARE\s*(?:NO\.?|NUMBER|CELL)?\s*[:\-]?\s*(.+)",
        r"CUSTOMER\s+CARE\s*(?:NO\.?|NUMBER|CELL)?\s*[:\-]?\s*(.+)",
        r"FOR\s+(?:CONSUMER|CUSTOMER)\s+FEEDBACK\s*[:\-]?\s*(.+)",
        r"TOLL\s+FREE\s*(?:NO\.?|NUMBER)?\s*[:\-]?\s*(.+)",
        r"HELPLINE\s*(?:NO\.?|NUMBER)?\s*[:\-]?\s*(.+)",
        r"CONTACT\s*(?:US|NO\.?|NUMBER)?\s*[:\-]?\s*(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = clean_value(match.group(1))
            if value and len(value) >= 3:
                return make_field_candidate(
                    field="consumer_care",
                    value=value,
                    result=result
                )

    return None


# ============================================================
# 8. MANUFACTURING / PACKING DATE
# ============================================================

def extract_manufacturing_date(
    result: OCRResult
) -> Optional[Dict[str, Any]]:

    text = normalize_spaces(result.text)

    patterns = [
        r"(?:MFD|MFG|MANUFACTURED|MANUFACTURING\s+DATE|DATE\s+OF\s+MFG|DATE\s+OF\s+MANUFACTURE)\s*[:.\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}[/-]\d{4})",
        r"(?:PKD|PACKED|PACKING\s+DATE|DATE\s+OF\s+PKD|DATE\s+OF\s+PACKING)\s*[:.\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}[/-]\d{4})",
        r"(?:PACKED\s+ON|MFD\s+ON|MFG\s+ON)\s*[:.\-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}[/-]\d{4})",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return make_field_candidate(
                field="manufacturing_date",
                value=match.group(1),
                result=result
            )

    return None


# ============================================================
# 9. COUNTRY OF ORIGIN
# ============================================================

def extract_country_of_origin(
    text: str,
    confidence: float,
    bbox,
    polygon=None
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    # Direct label: COUNTRY OF ORIGIN: INDIA / USA / etc.
    label_match = re.search(
        r"COUNTRY\s+OF\s+ORIGIN\s*[:\-]?\s*([A-Z\s]{3,25})",
        cleaned,
        re.IGNORECASE
    )
    if label_match:
        val = clean_value(label_match.group(1))
        return make_result(
            field="country_of_origin",
            value=val,
            raw_text=text,
            confidence=confidence,
            bbox=bbox,
            polygon=polygon
        )

    if "PRODUCT OF INDIA" in cleaned or "MADE IN INDIA" in cleaned:
        return make_result(
            field="country_of_origin",
            value="INDIA",
            raw_text=text,
            confidence=confidence,
            bbox=bbox,
            polygon=polygon
        )

    # Generic Product of / Made in [Country]
    match = re.search(
        r"(?:PRODUCT\s+OF|MADE\s+IN)\s+([A-Z\s]{3,20})",
        cleaned,
        re.IGNORECASE
    )
    if match:
        val = clean_value(match.group(1))
        return make_result(
            field="country_of_origin",
            value=val,
            raw_text=text,
            confidence=confidence,
            bbox=bbox,
            polygon=polygon
        )

    return None


# ============================================================
# 10. PRODUCT NAME CANDIDATE
# ============================================================

# Context labels that indicate a company/address is NOT necessarily the manufacturer.
NON_MANUFACTURER_CONTEXT_LABELS = [
    "MARKETED BY",
    "MARKETED AND",
    "PACKED BY",
    "PACKER",
    "IMPORTED BY",
    "IMPORTER",
    "CONSUMER SERVICES",
    "CONSUMER SERVICE",
    "CUSTOMER CARE",
    "CONSUMER CARE",
    "FSSAI",
    "LIC NO",
    "LICENSE NO",
]

DECLARATION_LABELS = [
    "MRP",
    "NET QTY",
    "NET QUANTITY",
    "NET WT",
    "NET WEIGHT",
    "MANUFACTURED",
    "MANUFACTURER",
    "MANUFACTURED BY",
    "PACKED BY",
    "PACKER",
    "IMPORTED BY",
    "IMPORTER",
    "CONSUMER CARE",
    "CUSTOMER CARE",
    "PRODUCT OF",
    "MADE IN",
    "UNIT SALE PRICE",
    "MFD",
    "MFG",
    "PKD",
    "USE BY",
    "BEST BEFORE",
    "LIC NO",
    "LICENSE NO",
    "NUTRITIONAL",
    "INGREDIENTS",
    "BATCH NO",
    "LOT NO",
    "MARKETED BY",
    "CONSUMER SERVICES",
    "CUSTOMER CARE",
    "FSSAI"
]


def looks_like_declaration_label(text: str) -> bool:
    cleaned = clean_ocr_text(text)
    for label in DECLARATION_LABELS:
        if label in cleaned:
            return True
    return False


def extract_product_name_candidate(
    results: List[OCRResult]
) -> Optional[Dict[str, Any]]:
    """
    Find a plausible product/brand name without treating arbitrary
    corporate names, addresses, ingredients, license numbers, or offers
    as the product name.
    """
    candidates = []

    strong_product_words = {
        "KURKURE", "BISCUITS", "BISCUIT", "NAMKEEN", "SNACK",
        "CHIPS", "NOODLES", "RICE", "JUICE", "DRINK", "SOAP",
        "SHAMPOO", "CREAM", "MIXTURE", "COOKIES"
    }

    bad_patterns = [
        r"\bLIC(?:ENCE|ENSE)?\.?\s*NO\b",
        r"\b(?:PVT|PRIVATE|LTD|LIMITED)\b",
        r"\b(?:MANUFACTURED|MARKETED|PACKED|IMPORTED)\b",
        r"\b(?:INGREDIENTS|ALLERGEN|NUTRITION|FARMERS|OFFER)\b",
        r"\b(?:ADDRESS|GURUGRAM|MUMBAI|DELHI|HARYANA|INDIA)\b",
        r"\b(?:MRP|N\.?\s*QTY|MFD|MFG|PKD|USE\s+BY|BATCH|LOT)\b",
        r"@",
        r"\b(?:WWW|HTTP)\b",
    ]

    for result in results:
        raw = normalize_spaces(result.text)
        text = clean_ocr_text(raw)

        if len(text) < 3:
            continue
        if looks_like_declaration_label(text):
            continue
        if re.fullmatch(r"[\d\s./:%₹$€£\-–,()]+", raw):
            continue
        if any(re.search(pattern, text, re.IGNORECASE) for pattern in bad_patterns):
            continue

        score = float(result.confidence)

        # Strongly reward short/medium brand-like text.
        if 3 <= len(raw) <= 30:
            score += 0.08
        elif len(raw) > 80:
            score -= 0.15

        # Reward known product/brand vocabulary.
        if any(word in text.split() for word in strong_product_words):
            score += 0.35

        # Penalize sentences/long corporate-looking regions.
        if len(text.split()) > 8:
            score -= 0.15
        if "," in raw and len(raw) > 35:
            score -= 0.10

        # Prominent text is more likely to be a product/brand.
        x1, y1, x2, y2 = result.bbox
        if (y2 - y1) >= 45:
            score += 0.04

        score = max(0.0, score)
        has_product_word = any(word in text.split() for word in strong_product_words)
        candidates.append((score, float(result.confidence), has_product_word, result))

    if not candidates:
        return None

    candidates.sort(key=lambda item: (item[0], item[2], item[1]), reverse=True)
    score, _, _, best_result = candidates[0]

    return make_field_candidate(
        field="product_name",
        value=best_result.text,
        result=best_result,
        status="candidate"
    )


# ============================================================
# DATE CLASSIFICATION (MFD vs USE BY)
# ============================================================

def classify_mfd_use_by_dates(
    results: List[OCRResult]
) -> List[Dict[str, Any]]:

    classified = []

    for result in results:
        dates = re.findall(
            r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
            result.text
        )

        if not dates:
            continue

        if len(dates) >= 2:
            classified.append(
                make_result(
                    field="manufacturing_date",
                    value=dates[0],
                    raw_text=result.text,
                    confidence=result.confidence,
                    bbox=result.bbox,
                    polygon=result.polygon
                )
            )
        elif len(dates) == 1:
            classified.append(
                make_result(
                    field="manufacturing_date",
                    value=dates[0],
                    raw_text=result.text,
                    confidence=result.confidence,
                    bbox=result.bbox,
                    polygon=result.polygon
                )
            )

    return classified


# ============================================================
# MULTI-LINE / CONTEXTUAL EXTRACTIONS
# ============================================================

def extract_from_grouped_lines(
    results: List[OCRResult]
) -> List[Dict[str, Any]]:
    """
    Extract declaration fields when label is on one line and value spans next line.
    """
    lines = group_into_lines(results)
    candidates = []

    for idx, line in enumerate(lines):
        line_str = line_to_text(line)
        next_line_str = line_to_text(lines[idx + 1]) if idx + 1 < len(lines) else ""

        # Multi-line Manufacturer: "Manufactured by:" on line i, company on line i+1
        if re.search(r"\b(?:MANUFACTURED|MFD|MFG)\s+BY\b", line_str, re.IGNORECASE):
            inline_val = re.sub(r".*?\b(?:MANUFACTURED|MFD|MFG)\s+BY\s*[:\-]?\s*", "", line_str, flags=re.IGNORECASE).strip()
            if not inline_val and next_line_str:
                combined_bbox = [
                    min(r.bbox[0] for r in lines[idx + 1]),
                    min(r.bbox[1] for r in lines[idx + 1]),
                    max(r.bbox[2] for r in lines[idx + 1]),
                    max(r.bbox[3] for r in lines[idx + 1])
                ]
                candidates.append(
                    make_result(
                        field="manufacturer",
                        value=clean_value(next_line_str),
                        raw_text=f"{line_str} {next_line_str}",
                        confidence=sum(r.confidence for r in lines[idx + 1]) / len(lines[idx + 1]),
                        bbox=combined_bbox
                    )
                )

        # Multi-line Packer
        if re.search(r"\b(?:PACKED|PKD)\s+BY\b", line_str, re.IGNORECASE):
            inline_val = re.sub(r".*?\b(?:PACKED|PKD)\s+BY\s*[:\-]?\s*", "", line_str, flags=re.IGNORECASE).strip()
            if not inline_val and next_line_str:
                combined_bbox = [
                    min(r.bbox[0] for r in lines[idx + 1]),
                    min(r.bbox[1] for r in lines[idx + 1]),
                    max(r.bbox[2] for r in lines[idx + 1]),
                    max(r.bbox[3] for r in lines[idx + 1])
                ]
                candidates.append(
                    make_result(
                        field="packer",
                        value=clean_value(next_line_str),
                        raw_text=f"{line_str} {next_line_str}",
                        confidence=sum(r.confidence for r in lines[idx + 1]) / len(lines[idx + 1]),
                        bbox=combined_bbox
                    )
                )

        # Multi-line Consumer Care
        if re.search(r"\b(?:CONSUMER|CUSTOMER)\s+CARE\b", line_str, re.IGNORECASE):
            inline_val = re.sub(r".*?\b(?:CONSUMER|CUSTOMER)\s+CARE\s*[:\-]?\s*", "", line_str, flags=re.IGNORECASE).strip()
            if not inline_val and next_line_str:
                combined_bbox = [
                    min(r.bbox[0] for r in lines[idx + 1]),
                    min(r.bbox[1] for r in lines[idx + 1]),
                    max(r.bbox[2] for r in lines[idx + 1]),
                    max(r.bbox[3] for r in lines[idx + 1])
                ]
                candidates.append(
                    make_result(
                        field="consumer_care",
                        value=clean_value(next_line_str),
                        raw_text=f"{line_str} {next_line_str}",
                        confidence=sum(r.confidence for r in lines[idx + 1]) / len(lines[idx + 1]),
                        bbox=combined_bbox
                    )
                )

    return candidates


# ============================================================
# CONTEXTUAL / ADJACENT OCR EXTRACTION
# ============================================================

def _bbox_distance(a: List[int], b: List[int]) -> float:
    """Approximate horizontal/vertical distance between two OCR boxes."""
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b

    if ax2 < bx1:
        dx = bx1 - ax2
    elif bx2 < ax1:
        dx = ax1 - bx2
    else:
        dx = 0

    if ay2 < by1:
        dy = by1 - ay2
    elif by2 < ay1:
        dy = ay1 - by2
    else:
        dy = 0

    return (dx * dx + dy * dy) ** 0.5


def _combined_bbox(results: List[OCRResult]) -> List[int]:
    return [
        min(r.bbox[0] for r in results),
        min(r.bbox[1] for r in results),
        max(r.bbox[2] for r in results),
        max(r.bbox[3] for r in results),
    ]


def _avg_confidence(results: List[OCRResult]) -> float:
    return sum(float(r.confidence) for r in results) / len(results)


def _nearby_results(
    anchor: OCRResult,
    results: List[OCRResult],
    max_distance: float = 260
) -> List[OCRResult]:
    nearby = [
        r for r in results
        if r is not anchor and _bbox_distance(anchor.bbox, r.bbox) <= max_distance
    ]
    nearby.sort(key=lambda r: (_bbox_distance(anchor.bbox, r.bbox), r.bbox[1], r.bbox[0]))
    return nearby


def _find_after_label(
    results: List[OCRResult],
    label_pattern: str,
    max_distance: float = 280
) -> Optional[tuple]:
    """
    Find a label OCR region and a nearby value region.
    Supports both inline and split declarations.
    """
    flags = re.IGNORECASE

    for label_result in results:
        label_text = normalize_spaces(label_result.text)
        match = re.search(label_pattern, label_text, flags)
        if not match:
            continue

        # Inline value after the label.
        inline = label_text[match.end():].strip(" :.-")
        if inline:
            return label_result, label_result, inline

        nearby = _nearby_results(label_result, results, max_distance)
        for value_result in nearby:
            value_text = normalize_spaces(value_result.text)
            if not value_text:
                continue
            if looks_like_declaration_label(value_text):
                continue
            return label_result, value_result, value_text

    return None


def _find_adjacent_value(
    label_result: OCRResult,
    results: List[OCRResult],
    max_horizontal_gap: float = 350,
    max_vertical_gap: float = 100,
) -> Optional[OCRResult]:
    """Find the value immediately to the right of a declaration label."""
    lx1, ly1, lx2, ly2 = label_result.bbox
    label_mid_y = (ly1 + ly2) / 2
    candidates = []

    for r in results:
        if r is label_result:
            continue
        x1, y1, x2, y2 = r.bbox
        mid_y = (y1 + y2) / 2
        vertical_gap = abs(mid_y - label_mid_y)
        horizontal_gap = x1 - lx2

        # Value should normally start to the right of the label and overlap
        # its horizontal band reasonably closely.
        if horizontal_gap < -20 or horizontal_gap > max_horizontal_gap:
            continue
        if vertical_gap > max_vertical_gap:
            continue
        if looks_like_declaration_label(r.text):
            continue
        if re.search(r'\bLIC(?:ENCE|ENSE)?\.?\s*NO\b', r.text, re.I):
            continue

        candidates.append((horizontal_gap, vertical_gap, -float(r.confidence), r))

    if not candidates:
        return None
    candidates.sort(key=lambda item: (item[0], item[1], item[2]))
    return candidates[0][3]


def _extract_phone_from_text(text: str) -> Optional[str]:
    """Extract a consumer-care style Indian phone number, not a license number."""
    cleaned = normalize_spaces(text)
    # Strong contextual form: OR CALL US AT 1800 22 4020
    m = re.search(
        r'(?:CALL\s+US\s+AT|CALL|HELPLINE|TOLL\s*FREE)\s*[:\-]?\s*'
        r'((?:\+91[\s-]?)?\d[\d\s-]{8,14}\d)',
        cleaned,
        re.I,
    )
    if m:
        digits = re.sub(r'\D', '', m.group(1))
        if 10 <= len(digits) <= 12:
            return normalize_spaces(m.group(1))

    # Generic 1800/1800-style toll-free number.
    m = re.search(r'\b(1800[\s-]?\d{2,4}[\s-]?\d{3,4})\b', cleaned)
    if m:
        return m.group(1)
    return None


def extract_contextual_declarations(
    results: List[OCRResult]
) -> List[Dict[str, Any]]:
    """Extract declarations whose label and value are split across OCR regions."""
    candidates: List[Dict[str, Any]] = []

    # --------------------------------------------------------
    # Net quantity: N.QTY: -> 44 g (...)
    # --------------------------------------------------------
    for label_r in results:
        if not re.search(r'\b(?:N\.?\s*QTY|NET\s*QTY|NET\s*QUANTITY|NET\s*CONTENT|NET\s*VOL(?:UME)?)\b', label_r.text, re.I):
            continue
        value_r = _find_adjacent_value(label_r, results)
        if not value_r:
            continue
        qty = re.search(
            r'(\d+(?:\.\d+)?)\s*(KG|KGS|G|GM|GMS|GRAM|GRAMS|ML|L|LTR|LITRE|LITRES|MG|PCS|PIECES|N|UNITS?)\b',
            value_r.text,
            re.I,
        )
        if qty:
            unit = normalize_unit(qty.group(2))
            candidates.append(make_result(
                field='net_quantity',
                value=f'{qty.group(1)} {unit}',
                raw_text=f'{label_r.text} {value_r.text}',
                confidence=min(label_r.confidence, value_r.confidence),
                bbox=_combined_bbox([label_r, value_r]),
                polygon=[],
                unit=unit,
                status='detected',
            ))
            break

    # --------------------------------------------------------
    # Explicit marketer. Never classify this as manufacturer.
    # --------------------------------------------------------
    for label_r in results:
        if not re.search(r'\bMARKETED\s+BY\b', label_r.text, re.I):
            continue
        value_r = _find_adjacent_value(label_r, results)
        if value_r:
            candidates.append(make_result(
                field='marketer',
                value=value_r.text,
                raw_text=f'{label_r.text} {value_r.text}',
                confidence=min(label_r.confidence, value_r.confidence),
                bbox=_combined_bbox([label_r, value_r]),
                polygon=[],
                status='detected',
            ))
        break

    # --------------------------------------------------------
    # Consumer care: explicitly look for CALL US / email.
    # --------------------------------------------------------
    phone_result = None
    phone_value = None
    for r in results:
        phone = _extract_phone_from_text(r.text)
        if phone:
            phone_result = r
            phone_value = phone
            break

    email_result = None
    email_value = None
    for r in results:
        m = re.search(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', r.text, re.I)
        if m:
            email_result = r
            email_value = m.group(0)
            break

    if phone_value or email_value:
        evidence = [r for r in (phone_result, email_result) if r is not None]
        values = []
        if phone_value:
            values.append(f'Phone: {phone_value}')
        if email_value:
            values.append(f'Email: {email_value}')
        candidates.append(make_result(
            field='consumer_care',
            value='; '.join(values),
            raw_text=' | '.join(r.text for r in evidence),
            confidence=sum(float(r.confidence) for r in evidence) / len(evidence),
            bbox=_combined_bbox(evidence),
            polygon=[],
            status='detected',
        ))

    return candidates


# ============================================================
# SINGLE REGION EXTRACTION (FOR EACH OCR RESULT)
# ============================================================

def extract_declaration_value(
    result: OCRResult
) -> List[Dict[str, Any]]:

    text = result.text
    conf = result.confidence
    bbox = result.bbox
    poly = result.polygon

    extracted: List[Dict[str, Any]] = []

    # 1. MRP
    mrp = extract_mrp(text, conf, bbox, poly)
    if mrp:
        extracted.append(mrp)

    # 2. Net Quantity
    net_qty = extract_net_quantity(text, conf, bbox, poly)
    if net_qty:
        extracted.append(net_qty)

    # 3. Net Weight
    net_wt = extract_net_weight(text, conf, bbox, poly)
    if net_wt:
        if not any(item["field"] == "net_quantity" for item in extracted):
            extracted.append(net_wt)

    # 4. Unit Sale Price
    unit_price = extract_unit_sale_price(text, conf, bbox, poly)
    if unit_price:
        extracted.append(unit_price)

    # 5. Standalone Unit Price
    standalone_usp = extract_standalone_unit_price(text, conf, bbox, poly)
    if standalone_usp:
        if not any(item["field"] == "unit_sale_price" for item in extracted):
            extracted.append(standalone_usp)

    # 6. Manufacturer
    mfg = extract_manufacturer(result)
    if mfg:
        extracted.append(mfg)

    # 7. Packer
    packer = extract_packer(result)
    if packer:
        extracted.append(packer)

    # 8. Importer
    importer = extract_importer(result)
    if importer:
        extracted.append(importer)

    # 9. Consumer Care
    care = extract_consumer_care(result)
    if care:
        extracted.append(care)

    # 10. Manufacturing Date
    mfg_date = extract_manufacturing_date(result)
    if mfg_date:
        extracted.append(mfg_date)

    # 11. Country of Origin
    country = extract_country_of_origin(text, conf, bbox, poly)
    if country:
        extracted.append(country)

    return extracted


# ============================================================
# MASTER PHASE 6 DECLARATION INTELLIGENCE
# ============================================================

def extract_declarations(
    results: List[OCRResult]
) -> Dict[str, Any]:
    """
    Master Phase 6 extraction function.
    Converts raw OCR results into the 10 legally required Legal Metrology declaration fields.
    """

    fields: Dict[str, Optional[Dict[str, Any]]] = {
        "product_name": None,
        "manufacturer": None,
        "packer": None,
        "importer": None,
        "net_quantity": None,
        "mrp": None,
        "manufacturing_date": None,
        "consumer_care": None,
        "country_of_origin": None,
        "unit_sale_price": None
    }

    candidates: List[Dict[str, Any]] = []

    # --------------------------------------------------------
    # 1. Process individual OCR regions
    # --------------------------------------------------------
    for result in results:
        region_declarations = extract_declaration_value(result)
        candidates.extend(region_declarations)

    # --------------------------------------------------------
    # 2. Multi-line / grouped lines extraction
    # --------------------------------------------------------
    multi_line_candidates = extract_from_grouped_lines(results)
    candidates.extend(multi_line_candidates)

    # --------------------------------------------------------
    # 3. Contextual / adjacent-region extraction
    # --------------------------------------------------------
    contextual_candidates = extract_contextual_declarations(results)
    candidates.extend(contextual_candidates)

    # --------------------------------------------------------
    # 4. Date classification
    # --------------------------------------------------------
    classified_dates = classify_mfd_use_by_dates(results)
    candidates.extend(classified_dates)

    # --------------------------------------------------------
    # 4. Product name detection
    # --------------------------------------------------------
    product_name = extract_product_name_candidate(results)
    if product_name:
        candidates.append(product_name)

    # --------------------------------------------------------
    # 5. Group candidates and select highest confidence for each field
    # --------------------------------------------------------
    field_groups: Dict[str, List[Dict[str, Any]]] = {}

    for candidate in candidates:
        field_name = candidate["field"]
        field_groups.setdefault(field_name, []).append(candidate)

    for field_name, items in field_groups.items():
        if field_name in fields:
            # Sort by confidence descending
            items.sort(key=lambda x: x["confidence"], reverse=True)
            fields[field_name] = items[0]

    return {
        "fields": fields,
        "candidates": candidates,
        "detected_field_count": sum(1 for v in fields.values() if v is not None),
        "total_candidates": len(candidates)
    }
