import re
from typing import Optional, Dict, Any, List

from .ocr_result import OCRResult


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


def make_result(
    field: str,
    value: str,
    raw_text: str,
    confidence: float,
    bbox,
    unit: Optional[str] = None,
    currency: Optional[str] = None
) -> Dict[str, Any]:

    result = {
        "field": field,
        "value": value,
        "raw_text": raw_text,
        "confidence": confidence,
        "bbox": bbox,
        "source": "ocr"
    }

    if unit:
        result["unit"] = unit

    if currency:
        result["currency"] = currency

    return result


# ============================================================
# MRP
# ============================================================

def extract_mrp(
    text: str,
    confidence: float,
    bbox
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    patterns = [

        # MRP ₹20
        r"\bMRP\s*[:.\-]?\s*(?:RS\.?|₹)?\s*(\d+(?:\.\d+)?)",

        # OCR:
        # MRPR.20
        # MRP R.20
        # MRP20
        r"\bMRP\s*R?\.?\s*(?:RS\.?|₹)?\s*(\d+(?:\.\d+)?)",

        # Maximum Retail Price
        r"MAXIMUM\s+RETAIL\s+PRICE\s*[:.\-]?"
        r"\s*(?:RS\.?|₹)?\s*(\d+(?:\.\d+)?)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            cleaned,
            flags=re.IGNORECASE
        )

        if match:

            return make_result(
                field="mrp",
                value=match.group(1),
                raw_text=text,
                confidence=confidence,
                bbox=bbox,
                currency="INR"
            )

    return None


# ============================================================
# NET QUANTITY WITH LABEL
# ============================================================

def extract_net_quantity(
    text: str,
    confidence: float,
    bbox
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    pattern = (
        r"(?:NET\s*QTY|NET\s*QUANTITY)"
        r"\s*[:.\-]?\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*"
        r"(KG|KGS|G|GM|GMS|GRAM|GRAMS|ML|L|LTR|"
        r"LITRE|LITRES)"
    )

    match = re.search(
        pattern,
        cleaned,
        flags=re.IGNORECASE
    )

    if not match:
        return None

    return make_result(
        field="net_quantity",
        value=match.group(1),
        unit=match.group(2).lower(),
        raw_text=text,
        confidence=confidence,
        bbox=bbox
    )


# ============================================================
# STANDALONE NET WEIGHT
#
# Example:
# Net. Wt. 74.9 gm./2.64 oz
# ============================================================

def extract_net_weight(
    text: str,
    confidence: float,
    bbox
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    pattern = (
        r"(?:NET\s*\.?\s*WT|NET\s*\.?\s*WEIGHT)"
        r"\s*[:.\-]?\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*"
        r"(KG|KGS|G|GM|GMS|GRAM|GRAMS|ML|L|LTR|"
        r"LITRE|LITRES)"
    )

    match = re.search(
        pattern,
        cleaned,
        flags=re.IGNORECASE
    )

    if not match:
        return None

    unit = match.group(2).lower()

    # Normalize gm/gms/gram/grams to g
    if unit in {"gm", "gms", "gram", "grams"}:
        unit = "g"

    # Normalize kg variants
    elif unit == "kgs":
        unit = "kg"

    # Normalize litre variants
    elif unit in {"ltr", "litre", "litres"}:
        unit = "l"

    return make_result(
        field="net_quantity",
        value=match.group(1),
        unit=unit,
        raw_text=text,
        confidence=confidence,
        bbox=bbox
    )


# ============================================================
# UNIT SALE PRICE
# ============================================================

def extract_unit_sale_price(
    text: str,
    confidence: float,
    bbox
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    pattern = (
        r"UNIT\s*SALE\s*PRICE"
        r"\s*[:.\-]?\s*"
        r"(?:RS\.?|₹)?\s*"
        r"(\d+(?:\.\d+)?)"
    )

    match = re.search(
        pattern,
        cleaned,
        flags=re.IGNORECASE
    )

    if not match:
        return None

    return make_result(
        field="unit_sale_price",
        value=match.group(1),
        currency="INR",
        raw_text=text,
        confidence=confidence,
        bbox=bbox
    )


# ============================================================
# STANDALONE UNIT SALE PRICE
#
# Example:
# Rs.0.25/- PER g
# ============================================================

def extract_standalone_unit_price(
    text: str,
    confidence: float,
    bbox
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    pattern = (
        r"(?:RS\.?|₹)\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*/?-?\s*"
        r"PER\s*"
        r"(KG|KGS|G|GM|GMS|ML|L|LTR)"
    )

    match = re.search(
        pattern,
        cleaned,
        flags=re.IGNORECASE
    )

    if not match:
        return None

    unit = match.group(2).lower()

    if unit in {"gm", "gms"}:
        unit = "g"

    elif unit == "kgs":
        unit = "kg"

    elif unit == "ltr":
        unit = "l"

    return make_result(
        field="unit_sale_price",
        value=match.group(1),
        unit=unit,
        currency="INR",
        raw_text=text,
        confidence=confidence,
        bbox=bbox
    )


# ============================================================
# DATES
# ============================================================

def extract_dates(
    text: str,
    confidence: float,
    bbox
) -> List[Dict[str, Any]]:

    dates = re.findall(
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
        text
    )

    results = []

    for date in dates:

        results.append(
            make_result(
                field="date",
                value=date,
                raw_text=text,
                confidence=confidence,
                bbox=bbox
            )
        )

    return results


# ============================================================
# LICENSE NUMBER
# ============================================================

def extract_license_number(
    text: str,
    confidence: float,
    bbox
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    patterns = [

        r"LIC\.?\s*NO\.?\s*[:.\-]?\s*(\d{8,20})",

        r"LICENSE\s*NO\.?\s*[:.\-]?\s*(\d{8,20})",

        r"LIC\s+NO\s*[:.\-]?\s*(\d{8,20})",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            cleaned,
            flags=re.IGNORECASE
        )

        if match:

            return make_result(
                field="license_number",
                value=match.group(1),
                raw_text=text,
                confidence=confidence,
                bbox=bbox
            )

    return None


# ============================================================
# COUNTRY OF ORIGIN
# ============================================================

def extract_country_of_origin(
    text: str,
    confidence: float,
    bbox
) -> Optional[Dict[str, Any]]:

    cleaned = clean_ocr_text(text)

    if "PRODUCT OF INDIA" in cleaned:

        return make_result(
            field="country_of_origin",
            value="INDIA",
            raw_text=text,
            confidence=confidence,
            bbox=bbox
        )

    if "MADE IN INDIA" in cleaned:

        return make_result(
            field="country_of_origin",
            value="INDIA",
            raw_text=text,
            confidence=confidence,
            bbox=bbox
        )

    return None


# ============================================================
# DATE CLASSIFICATION
# ============================================================

def classify_mfd_use_by_dates(
    results: List[OCRResult]
) -> List[Dict[str, Any]]:

    classified = []

    # Find the MFD / USE BY label
    date_label_result = None

    for result in results:

        text = clean_ocr_text(result.text)

        if (
            "MFD&USEBY" in text
            or "MFD & USE BY" in text
            or "MFD" in text and "USE BY" in text
        ):
            date_label_result = result
            break

    # Find OCR region containing dates
    for result in results:

        dates = re.findall(
            r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
            result.text
        )

        if not dates:
            continue

        # If there are two dates, classify:
        # first = manufacturing
        # second = use-by
        if len(dates) >= 2:

            classified.append(
                make_result(
                    field="manufacturing_date",
                    value=dates[0],
                    raw_text=result.text,
                    confidence=result.confidence,
                    bbox=result.bbox
                )
            )

            classified.append(
                make_result(
                    field="use_by",
                    value=dates[1],
                    raw_text=result.text,
                    confidence=result.confidence,
                    bbox=result.bbox
                )
            )

        else:

            # If we have MFD/USE BY context but only one
            # date is visible, mark it as a date candidate.
            classified.append(
                make_result(
                    field="date",
                    value=dates[0],
                    raw_text=result.text,
                    confidence=result.confidence,
                    bbox=result.bbox
                )
            )

    return classified


# ============================================================
# SINGLE OCR RESULT EXTRACTION
# ============================================================

def extract_declaration_value(
    result: OCRResult
) -> List[Dict[str, Any]]:

    text = result.text

    extracted = []

    # MRP
    mrp = extract_mrp(
        text,
        result.confidence,
        result.bbox
    )

    if mrp:
        extracted.append(mrp)

    # NET QTY
    net_quantity = extract_net_quantity(
        text,
        result.confidence,
        result.bbox
    )

    if net_quantity:
        extracted.append(net_quantity)

    # NET WT
    net_weight = extract_net_weight(
        text,
        result.confidence,
        result.bbox
    )

    if net_weight:

        # Avoid duplicate net quantity
        if not any(
            item["field"] == "net_quantity"
            for item in extracted
        ):
            extracted.append(net_weight)

    # UNIT SALE PRICE
    unit_price = extract_unit_sale_price(
        text,
        result.confidence,
        result.bbox
    )

    if unit_price:
        extracted.append(unit_price)

    # STANDALONE UNIT SALE PRICE
    standalone_price = extract_standalone_unit_price(
        text,
        result.confidence,
        result.bbox
    )

    if standalone_price:

        if not any(
            item["field"] == "unit_sale_price"
            and item["value"] == standalone_price["value"]
            for item in extracted
        ):
            extracted.append(standalone_price)

    # DATES
    dates = extract_dates(
        text,
        result.confidence,
        result.bbox
    )

    extracted.extend(dates)

    # LICENSE
    license_number = extract_license_number(
        text,
        result.confidence,
        result.bbox
    )

    if license_number:
        extracted.append(license_number)

    # COUNTRY
    country = extract_country_of_origin(
        text,
        result.confidence,
        result.bbox
    )

    if country:
        extracted.append(country)

    return extracted