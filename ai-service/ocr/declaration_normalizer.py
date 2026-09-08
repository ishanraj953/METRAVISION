from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
import re
from datetime import datetime

from .spatial_association import FieldValueAssociation


@dataclass
class NormalizedDeclaration:
    field: str
    value: Optional[str]
    normalized_value: Optional[str]
    raw_text: str
    confidence: float
    bbox: List[int]
    source: str = "declaration_normalizer"


# ---------------------------------------------------------
# Generic text cleanup
# ---------------------------------------------------------

def _clean_text(text: str) -> str:
    text = str(text or "").strip()

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ---------------------------------------------------------
# MRP
# ---------------------------------------------------------

def _normalize_mrp(text: str) -> Optional[str]:
    text = _clean_text(text)

    # Remove common currency symbols / labels
    text_upper = text.upper()

    match = re.search(
        r"(?:RS\.?|₹|INR)?\s*"
        r"(\d+(?:\.\d{1,2})?)",
        text_upper,
        re.IGNORECASE
    )

    if not match:
        return None

    try:
        amount = float(match.group(1))
    except ValueError:
        return None

    return f"{amount:.2f}"


def aggregate_consumer_care(
    declarations: List[NormalizedDeclaration]
) -> Optional[Dict[str, str]]:

    phone = None
    email = None

    for declaration in declarations:

        if declaration.field != "consumer_care":
            continue

        raw_text = declaration.raw_text

        detected_phone = _extract_phone(
            raw_text
        )

        detected_email = _extract_email(
            raw_text
        )

        if detected_phone:
            phone = detected_phone

        if detected_email:
            email = detected_email

    if phone is None and email is None:
        return None

    result = {}

    if phone:
        result["phone"] = phone

    if email:
        result["email"] = email

    return result


def build_structured_declarations(
    declarations: List[NormalizedDeclaration]
) -> Dict[str, object]:

    result = {}

    # --------------------------------------------------
    # Group normal declarations
    # --------------------------------------------------

    for declaration in declarations:

        field = declaration.field

        if field == "consumer_care":
            continue

        # Keep strongest declaration if duplicates exist
        existing = result.get(field)

        if existing is None:
            result[field] = asdict(
                declaration
            )

        elif (
            declaration.confidence
            > existing["confidence"]
        ):
            result[field] = asdict(
                declaration
            )

    # --------------------------------------------------
    # Aggregate consumer care
    # --------------------------------------------------

    consumer_care = aggregate_consumer_care(
        declarations
    )

    if consumer_care:

        result["consumer_care"] = {
            "value": consumer_care,
            "source": "aggregated_ocr_regions",
        }

    return result


# ---------------------------------------------------------
# Net Quantity
# ---------------------------------------------------------

def _normalize_net_quantity(text: str) -> Dict[str, Optional[str]]:
    text = _clean_text(text)

    match = re.search(
        r"(\d+(?:\.\d+)?)\s*"
        r"(KG|G|MG|ML|L|CL)\b",
        text,
        re.IGNORECASE
    )

    if not match:
        return {
            "value": None,
            "unit": None,
            "additional_quantity": None,
        }

    value = match.group(1)
    unit = match.group(2).lower()

    # Standardize unit capitalization
    unit_map = {
        "kg": "kg",
        "g": "g",
        "mg": "mg",
        "ml": "ml",
        "l": "L",
        "cl": "cl",
    }

    unit = unit_map.get(unit.lower(), unit)

    # Look for additional quantity
    additional_quantity = None

    extra_match = re.search(
        r"\((.*?)\)",
        text
    )

    if extra_match:
        extra_text = extra_match.group(1).strip()

        if (
            "extra" in extra_text.lower()
            or "+" in extra_text
        ):
            additional_quantity = extra_text

    return {
        "value": value,
        "unit": unit,
        "additional_quantity": additional_quantity,
    }


# ---------------------------------------------------------
# Manufacturing Date
# ---------------------------------------------------------

def _normalize_date(text: str) -> Optional[str]:
    text = _clean_text(text)

    # Convert separators to /
    normalized = re.sub(
        r"[.\-]",
        "/",
        text
    )

    # DD/MM/YYYY
    match = re.search(
        r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b",
        normalized
    )

    if match:
        day, month, year = match.groups()

        try:
            date_obj = datetime(
                int(year),
                int(month),
                int(day)
            )

            return date_obj.strftime("%Y-%m-%d")

        except ValueError:
            return None

    # DD/MM/YY
    match = re.search(
        r"\b(\d{1,2})/(\d{1,2})/(\d{2})\b",
        normalized
    )

    if match:
        day, month, year = match.groups()

        try:
            year_int = int(year)

            # Packaged-product dates such as 22 → 2022
            if year_int <= 69:
                year_int += 2000
            else:
                year_int += 1900

            date_obj = datetime(
                year_int,
                int(month),
                int(day)
            )

            return date_obj.strftime("%Y-%m-%d")

        except ValueError:
            return None

    # MM/YYYY
    match = re.search(
        r"\b(\d{1,2})/(\d{4})\b",
        normalized
    )

    if match:
        month, year = match.groups()

        try:
            datetime(
                int(year),
                int(month),
                1
            )

            return f"{int(year):04d}-{int(month):02d}"

        except ValueError:
            return None

    return None


# ---------------------------------------------------------
# Consumer Care
# ---------------------------------------------------------

def _extract_phone(text: str) -> Optional[str]:
    """
    Extract an Indian-style consumer-care phone number.

    Supports formats such as:
        1800224020
        1800 22 4020
        1800-22-4020
        1800 224 020
    """

    text = str(text or "").strip()

    # Look for a number containing separators.
    match = re.search(
        r"(?<!\d)"
        r"(\d{3,5}(?:[\s\-]\d{2,5}){1,4})"
        r"(?!\d)",
        text
    )

    if match:
        raw_phone = match.group(1)

        # Remove spaces and hyphens
        phone = re.sub(
            r"[\s\-]",
            "",
            raw_phone
        )

        if 7 <= len(phone) <= 15:
            return phone

    # Also support a continuous number.
    match = re.search(
        r"(?<!\d)(\d{7,15})(?!\d)",
        text
    )

    if match:
        return match.group(1)

    return None

def _extract_email(text: str) -> Optional[str]:
    match = re.search(
        r"\b[A-Z0-9._%+-]+"
        r"@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        text,
        re.IGNORECASE
    )

    if not match:
        return None

    return match.group(0).lower()


# ---------------------------------------------------------
# Single association normalization
# ---------------------------------------------------------

def normalize_association(
    association: FieldValueAssociation
) -> Optional[NormalizedDeclaration]:

    field = association.field
    raw_text = _clean_text(
        association.value_text
    )

    if not raw_text:
        return None

    # -----------------------------------------------------
    # MRP
    # -----------------------------------------------------

    if field == "mrp":

        normalized = _normalize_mrp(raw_text)

        if normalized is None:
            return None

        return NormalizedDeclaration(
            field=field,
            value=f"₹{normalized}",
            normalized_value=normalized,
            raw_text=raw_text,
            confidence=association.association_confidence,
            bbox=association.value_bbox,
        )

    # -----------------------------------------------------
    # Net Quantity
    # -----------------------------------------------------

    if field == "net_quantity":

        quantity = _normalize_net_quantity(
            raw_text
        )

        if quantity["value"] is None:
            return None

        normalized = (
            f"{quantity['value']} "
            f"{quantity['unit']}"
        )

        if quantity["additional_quantity"]:
            normalized += (
                f" "
                f"({quantity['additional_quantity']})"
            )

        return NormalizedDeclaration(
            field=field,
            value=normalized,
            normalized_value=normalized,
            raw_text=raw_text,
            confidence=association.association_confidence,
            bbox=association.value_bbox,
        )

    # -----------------------------------------------------
    # Manufacturing Date
    # -----------------------------------------------------

    if field == "manufacturing_date":

        normalized = _normalize_date(
            raw_text
        )

        if normalized is None:
            return None

        return NormalizedDeclaration(
            field=field,
            value=raw_text,
            normalized_value=normalized,
            raw_text=raw_text,
            confidence=association.association_confidence,
            bbox=association.value_bbox,
        )

    # -----------------------------------------------------
    # Consumer Care
    # -----------------------------------------------------

    if field == "consumer_care":

        phone = _extract_phone(raw_text)
        email = _extract_email(raw_text)

        if phone is None and email is None:
            return None

        values = []

        if phone:
            values.append(
                f"phone={phone}"
            )

        if email:
            values.append(
                f"email={email}"
            )

        normalized = "; ".join(values)

        return NormalizedDeclaration(
            field=field,
            value=raw_text,
            normalized_value=normalized,
            raw_text=raw_text,
            confidence=association.association_confidence,
            bbox=association.value_bbox,
        )


# ---------------------------------------------------------
# Normalize all associations
# ---------------------------------------------------------

def normalize_declarations(
    associations: List[FieldValueAssociation]
) -> List[NormalizedDeclaration]:

    normalized = []

    for association in associations:

        declaration = normalize_association(
            association
        )

        if declaration is None:
            continue

        normalized.append(
            declaration
        )

    return normalized


# ---------------------------------------------------------
# Convert normalized declarations to field map
# ---------------------------------------------------------

def build_normalized_declaration_map(
    declarations: List[NormalizedDeclaration]
) -> Dict[str, List[Dict]]:

    result = {}

    for declaration in declarations:

        result.setdefault(
            declaration.field,
            []
        ).append(
            asdict(declaration)
        )

    return result


# ---------------------------------------------------------
# Serialization
# ---------------------------------------------------------

def serialize_normalized_declarations(
    declarations: List[NormalizedDeclaration]
) -> List[Dict]:

    return [
        asdict(declaration)
        for declaration in declarations
    ]