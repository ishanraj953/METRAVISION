import re
from typing import List, Dict, Any

from .ocr_result import OCRResult


# ============================================================
# BASIC TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalize common OCR variations without changing meaning.
    """

    text = text.strip()

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Normalize dashes
    text = text.replace("—", "-")
    text = text.replace("–", "-")

    # --------------------------------------------------------
    # MRP
    # --------------------------------------------------------

    text = re.sub(
        r"\bM\s*\.?\s*R\s*\.?\s*P\s*\.?\b",
        "MRP",
        text,
        flags=re.IGNORECASE
    )

    # Handle MRP attached directly to value
    text = re.sub(
    r"\bMRP(?=\d)",
    "MRP ",
    text,
    flags=re.IGNORECASE
    )

    # Ensure separation between MRP and currency
    text = re.sub(
        r"\bMRP(?=Rs\b)",
        "MRP ",
        text,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # NET QUANTITY
    # --------------------------------------------------------

    text = re.sub(
        r"\bNET\s*\.?\s*(?:QTY|QUANTITY)\b",
        "NET QUANTITY",
        text,
        flags=re.IGNORECASE
    )

    # Net Wt / Net. Wt. / Net Weight
    text = re.sub(
    r"\bNET\s*\.?\s*WT\.?\s*",
    "NET WEIGHT ",
    text,
    flags=re.IGNORECASE
    )

    # Remove punctuation/colons accidentally left immediately
    # after normalized declaration labels
    text = re.sub(
        r"\b(NET WEIGHT|MRP|NET QUANTITY|UNIT SALE PRICE)\s*[:.\-–—]\s*",
        r"\1 ",
        text,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # UNIT SALE PRICE
    # --------------------------------------------------------

    text = re.sub(
        r"\bUNIT\s*SALE\s*PRICE\b",
        "UNIT SALE PRICE",
        text,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # MANUFACTURING / USE BY
    # --------------------------------------------------------

    text = re.sub(
        r"\bMFD\s*&?\s*USE\s*BY\b",
        "MFD & USE BY",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\bMFG\s*&?\s*DATE\b",
        "MFG DATE",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\bMFD\s*&?\s*DATE\b",
        "MFD DATE",
        text,
        flags=re.IGNORECASE
    )

        # --------------------------------------------------------
    # CURRENCY
    # --------------------------------------------------------

    # ₹ -> Rs
    text = text.replace("₹", "Rs")

    # Rs / Rs. / RS / R.S. -> Rs
    text = re.sub(
        r"\bR\.?\s*S\.?\s*\.?",
        "Rs",
        text,
        flags=re.IGNORECASE
    )

    # INR -> Rs
    text = re.sub(
        r"\bINR\b",
        "Rs",
        text,
        flags=re.IGNORECASE
    )

    # Ensure spacing between Rs and amount
    text = re.sub(
        r"\bRs(?=\d)",
        "Rs ",
        text
    )
    # --------------------------------------------------------
    # COMMON UNIT SPELLINGS
    # --------------------------------------------------------

    text = re.sub(
        r"\b(?:gms?|grams?)\b",
        "g",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\b(?:kgs?|kilograms?)\b",
        "kg",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\b(?:mls?|millilit(?:er|re)s?)\b",
        "ml",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\b(?:lit(?:er|re)s?|ltrs?)\b",
        "L",
        text,
        flags=re.IGNORECASE
    )

    return text.strip()


# ============================================================
# UNIT NORMALIZATION
# ============================================================

UNIT_PATTERNS = {
    "kg": [
        r"\bkg\b",
        r"\bKG\b",
        r"\bKg\b",
        r"\bkgs\b",
        r"\bkilogram(?:s)?\b",
    ],
    "g": [
        r"\bg\b",
        r"\bG\b",
        r"\bgm\b",
        r"\bgms\b",
        r"\bgram(?:s)?\b",
    ],
    "mg": [
        r"\bmg\b",
        r"\bMG\b",
        r"\bmilligram(?:s)?\b",
    ],
    "ml": [
        r"\bml\b",
        r"\bML\b",
        r"\bmL\b",
        r"\bmilliliter(?:s)?\b",
        r"\bmillilitre(?:s)?\b",
    ],
    "L": [
        r"\bL\b",
        r"\bl\b",
        r"\bltr\b",
        r"\bltrs\b",
        r"\bliter(?:s)?\b",
        r"\blitre(?:s)?\b",
    ],
}


def normalize_unit(unit: str) -> str:
    """
    Convert different unit spellings into one canonical form.
    """

    if not unit:
        return unit

    cleaned = unit.strip()

    for canonical, patterns in UNIT_PATTERNS.items():
        for pattern in patterns:
            if re.fullmatch(pattern, cleaned, flags=re.IGNORECASE):
                return canonical

    return cleaned


def normalize_units_in_text(text: str) -> str:
    """
    Normalize units appearing inside OCR text.
    """

    text = re.sub(
        r"\b(?:kgs?|kilograms?)\b",
        "kg",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\b(?:gms?|grams?)\b",
        "g",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\b(?:mgs?|milligrams?)\b",
        "mg",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\b(?:mls?|milliliters?|millilitres?)\b",
        "ml",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\b(?:ltrs?|liters?|litres?)\b",
        "L",
        text,
        flags=re.IGNORECASE
    )

    return text


# ============================================================
# CURRENCY NORMALIZATION
# ============================================================

def normalize_currency(text: str) -> str:
    """
    Normalize Indian currency representations.
    """

    # ₹ → Rs
    text = text.replace("₹", "Rs")

    # Rs. / R.S. / RS → Rs
    text = re.sub(
        r"\bR\.?\s*S\.?\b\.?",
        "Rs",
        text,
        flags=re.IGNORECASE
    )

    # INR → Rs
    text = re.sub(
        r"\bINR\b",
        "Rs",
        text,
        flags=re.IGNORECASE
    )

    return text


def extract_currency(text: str) -> str | None:
    """
    Detect currency from OCR text.
    """

    if re.search(r"₹", text):
        return "INR"

    if re.search(r"\b(?:Rs|INR)\b", text, flags=re.IGNORECASE):
        return "INR"

    return None


# ============================================================
# DATE NORMALIZATION
# ============================================================

DATE_PATTERNS = [
    # DD/MM/YYYY
    r"\b\d{1,2}/\d{1,2}/\d{4}\b",

    # DD/MM/YY
    r"\b\d{1,2}/\d{1,2}/\d{2}\b",

    # DD-MM-YYYY
    r"\b\d{1,2}-\d{1,2}-\d{4}\b",

    # DD-MM-YY
    r"\b\d{1,2}-\d{1,2}-\d{2}\b",

    # DD.MM.YYYY
    r"\b\d{1,2}\.\d{1,2}\.\d{4}\b",

    # DD.MM.YY
    r"\b\d{1,2}\.\d{1,2}\.\d{2}\b",
]


def normalize_date(date_text: str) -> str:
    """
    Normalize date separators to DD/MM/YYYY or DD/MM/YY style.
    """

    date_text = date_text.strip()

    # Convert - and . to /
    date_text = date_text.replace("-", "/")
    date_text = date_text.replace(".", "/")

    return date_text


def extract_dates_from_text(text: str) -> List[str]:
    """
    Extract all recognizable dates from OCR text.
    """

    dates = []

    for pattern in DATE_PATTERNS:
        matches = re.findall(pattern, text)

        for match in matches:
            normalized = normalize_date(match)

            if normalized not in dates:
                dates.append(normalized)

    return dates


# ============================================================
# PHONE NUMBER NORMALIZATION
# ============================================================

PHONE_PATTERNS = [
    # Toll-free 1800 / 1860
    r"\b18[06]0[\s-]*\d{3,4}[\s-]*\d{3,4}\b",

    # +91 98765 43210
    r"\+91[\s-]*\d{5}[\s-]*\d{5}",

    # +919876543210
    r"\+91\d{10}",

    # 98765 43210
    r"\b\d{5}[\s-]\d{5}\b",

    # 9876543210
    r"\b[6-9]\d{9}\b",
]


def normalize_phone(phone: str) -> str:
    """
    Normalize Indian phone number.
    """
    digits = re.sub(r"\D", "", phone)

    if digits.startswith("1800") or digits.startswith("1860"):
        return digits

    if digits.startswith("91") and len(digits) == 12:
        return "+" + digits

    if len(digits) == 10:
        return "+91" + digits

    return phone.strip()


def extract_phone_numbers(text: str) -> List[str]:
    """
    Extract and normalize phone numbers.
    """

    found = []

    for pattern in PHONE_PATTERNS:
        matches = re.findall(pattern, text)

        for match in matches:
            normalized = normalize_phone(match)

            if normalized not in found:
                found.append(normalized)

    return found


# ============================================================
# EMAIL NORMALIZATION
# ============================================================

EMAIL_PATTERN = (
    r"\b[A-Za-z0-9._%+-]+"
    r"@[A-Za-z0-9.-]+\."
    r"[A-Za-z]{2,}\b"
)


def normalize_email(email: str) -> str:
    """
    Normalize email address.
    """

    return email.strip().lower()


def extract_emails(text: str) -> List[str]:
    """
    Extract email addresses from OCR text.
    """

    matches = re.findall(
        EMAIL_PATTERN,
        text,
        flags=re.IGNORECASE
    )

    return list(
        dict.fromkeys(
            normalize_email(email)
            for email in matches
        )
    )


# ============================================================
# ADDRESS NORMALIZATION
# ============================================================

ADDRESS_LABELS = [
    "address",
    "registered office",
    "manufactured at",
    "manufactured by",
    "marketed by",
    "packed at",
    "packed by",
    "corporate office",
]


def normalize_address(text: str) -> str:
    """
    Basic address cleanup.

    Important:
    This does NOT attempt to invent or rewrite addresses.
    It only cleans OCR formatting.
    """

    text = text.strip()

    text = re.sub(r"\s+", " ", text)

    # Normalize common punctuation spacing
    text = re.sub(r"\s*,\s*", ", ", text)
    text = re.sub(r"\s*-\s*", " - ", text)

    return text.strip()


def looks_like_address(text: str) -> bool:
    """
    Conservative address detector.
    """

    lowered = text.lower()

    has_label = any(
        label in lowered
        for label in ADDRESS_LABELS
    )

    has_number = bool(
        re.search(r"\b\d{1,6}\b", text)
    )

    has_pin = bool(
        re.search(r"\b\d{6}\b", text)
    )

    has_address_keyword = any(
        keyword in lowered
        for keyword in [
            "road",
            "street",
            "st.",
            "lane",
            "nagar",
            "colony",
            "industrial",
            "estate",
            "sector",
            "plot",
            "district",
            "india",
        ]
    )

    return (
        has_label
        or has_pin
        or (has_number and has_address_keyword)
    )


# ============================================================
# SPATIAL SORTING
# ============================================================

def sort_ocr_results(
    results: List[OCRResult]
) -> List[OCRResult]:
    """
    Sort OCR regions top-to-bottom and left-to-right.

    Raw OCR regions remain authoritative.
    """

    return sorted(
        results,
        key=lambda r: (
            r.bbox[1],
            r.bbox[0]
        )
    )


# ============================================================
# LINE GROUPING
# ============================================================

def same_line(
    a: OCRResult,
    b: OCRResult,
    tolerance: int = 15
) -> bool:

    ay = (a.bbox[1] + a.bbox[3]) / 2
    by = (b.bbox[1] + b.bbox[3]) / 2

    return abs(ay - by) <= tolerance


def group_into_lines(
    results: List[OCRResult]
) -> List[List[OCRResult]]:
    """
    Conservative grouping of OCR regions into lines.
    """

    if not results:
        return []

    sorted_results = sort_ocr_results(results)

    lines = []

    for result in sorted_results:

        cy = (result.bbox[1] + result.bbox[3]) / 2

        best_line = None
        best_distance = float("inf")

        for line in lines:

            line_center = sum(
                (r.bbox[1] + r.bbox[3]) / 2
                for r in line
            ) / len(line)

            distance = abs(cy - line_center)

            if distance <= 15 and distance < best_distance:
                best_distance = distance
                best_line = line

        if best_line is None:
            lines.append([result])
        else:
            best_line.append(result)

    # Sort each line left-to-right
    for line in lines:
        line.sort(key=lambda r: r.bbox[0])

    return lines


def line_to_text(
    line: List[OCRResult]
) -> str:

    return " ".join(
        result.text
        for result in sorted(
            line,
            key=lambda r: r.bbox[0]
        )
    )


def build_text_lines(
    results: List[OCRResult]
) -> List[str]:

    lines = group_into_lines(results)

    return [
        line_to_text(line)
        for line in lines
    ]


# ============================================================
# DECLARATION LABEL DETECTION
# ============================================================

DECLARATION_LABELS = {
    "mrp": [
        r"\bMRP\b",
    ],

    "net_quantity": [
        r"\bNET\s+QUANTITY\b",
        r"\bNET\s+WEIGHT\b",
        r"\bNET\s*\.?\s*WT\b",
    ],

    "unit_sale_price": [
        r"\bUNIT\s+SALE\s+PRICE\b",
    ],

    "manufacturing_date": [
        r"\bMFD\s+DATE\b",
        r"\bMFG\s+DATE\b",
        r"\bMANUFACTURED\b",
        r"\bPACKED\s+ON\b",
    ],

    "use_by": [
        r"\bUSE\s+BY\b",
        r"\bBEST\s+BEFORE\b",
        r"\bEXPIRY\b",
        r"\bEXPIRATION\b",
    ],

    "consumer_care": [
        r"\bCONSUMER\s+CARE\b",
        r"\bCUSTOMER\s+CARE\b",
        r"\bHELPLINE\b",
        r"\bTOLL\s+FREE\b",
    ],

    "country_of_origin": [
        r"\bCOUNTRY\s+OF\s+ORIGIN\b",
        r"\bPRODUCT\s+OF\b",
    ],

    "manufacturer": [
        r"\bMANUFACTURED\s+BY\b",
        r"\bMANUFACTURER\b",
    ],

    "importer": [
        r"\bIMPORTED\s+BY\b",
        r"\bIMPORTER\b",
    ],

    "license_number": [
        r"\bLIC\.?\s*NO\.?\b",
        r"\bLICENSE\s+NO\.?\b",
    ],
}


def detect_declaration_labels(
    text: str
) -> List[str]:

    normalized = normalize_text(text)

    detected = []

    for field, patterns in DECLARATION_LABELS.items():

        for pattern in patterns:

            if re.search(
                pattern,
                normalized,
                flags=re.IGNORECASE
            ):
                detected.append(field)
                break

    return detected


# ============================================================
# MASTER OCR NORMALIZATION
# ============================================================

def normalize_ocr_result(
    result: OCRResult
) -> Dict[str, Any]:
    """
    Convert one raw OCR result into normalized structured data.
    """

    raw_text = result.text

    normalized = normalize_text(raw_text)

    normalized = normalize_units_in_text(normalized)

    normalized = normalize_currency(normalized)

    dates = extract_dates_from_text(normalized)

    phones = extract_phone_numbers(normalized)

    emails = extract_emails(normalized)

    declaration_fields = detect_declaration_labels(
        normalized
    )

    address = None

    if looks_like_address(normalized):
        address = normalize_address(normalized)

    return {
        "raw_text": raw_text,
        "normalized_text": normalized,
        "confidence": result.confidence,
        "bbox": result.bbox,
        "polygon": result.polygon,
        "source": result.source,
        "declaration_fields": declaration_fields,
        "currency": extract_currency(raw_text),
        "dates": dates,
        "phones": phones,
        "emails": emails,
        "address": address,
    }


def build_normalized_ocr_output(
    results: List[OCRResult]
) -> Dict[str, Any]:
    """
    Final Phase 4 deliverable.

    Produces one unified normalized OCR object.
    """

    sorted_results = sort_ocr_results(results)

    normalized_results = [
        normalize_ocr_result(result)
        for result in sorted_results
    ]

    all_text = " ".join(
        item["normalized_text"]
        for item in normalized_results
    )

    all_dates = []
    all_phones = []
    all_emails = []
    all_addresses = []

    for item in normalized_results:

        for date in item["dates"]:
            if date not in all_dates:
                all_dates.append(date)

        for phone in item["phones"]:
            if phone not in all_phones:
                all_phones.append(phone)

        for email in item["emails"]:
            if email not in all_emails:
                all_emails.append(email)

        if item["address"]:
            if item["address"] not in all_addresses:
                all_addresses.append(item["address"])

    return {
        "results": normalized_results,

        "full_text": all_text,

        "dates": all_dates,

        "phone_numbers": all_phones,

        "emails": all_emails,

        "addresses": all_addresses,

        "total_regions": len(normalized_results),
    }