from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
import re

from .ocr_result import OCRResult


@dataclass
class FieldDetection:
    field: str
    text: str
    confidence: float
    bbox: List[int]
    polygon: List[List[int]]
    source: str = "field_detector"
    detection_type: str = "label"


FIELD_LABEL_PATTERNS = {
    "product_name": [
        r"\bPRODUCT\s*NAME\b",
        r"\bNAME\s+OF\s+(?:THE\s+)?PRODUCT\b",
        r"\bCOMMON\s+NAME\b",
        r"\bDESCRIPTION\b",
    ],

    "manufacturer": [
        r"\bMANUFACTURED\s+BY\b",
        r"\bMANUFACTURER\b",
        r"\bMFD\.?\s*BY\b",
        r"\bMFG\.?\s*BY\b",
    ],

    "packer": [
        r"\bPACKED\s+BY\b",
        r"\bPACKER\b",
        r"\bPACKING\s+BY\b",
    ],

    "importer": [
        r"\bIMPORTED\s+BY\b",
        r"\bIMPORTER\b",
    ],

    "net_quantity": [
        r"\bNET\s*(?:QTY|QUANTITY)\b",
        r"\bN\.?\s*QTY\b",
        r"\bNET\s*WT\b",
        r"\bNET\s*WEIGHT\b",
    ],

    "mrp": [
        r"\bM\.?\s*R\.?\s*P\.?\b",
        r"\bMAXIMUM\s+RETAIL\s+PRICE\b",
        r"\bRETAIL\s+PRICE\b",
    ],

    "manufacturing_date": [
        r"\bMFD\.?\b",
        r"\bMFG\.?\b",
        r"\bMANUFACTURING\s+DATE\b",
        r"\bDATE\s+OF\s+MANUFACTURE\b",
        r"\bPACKED\s+ON\b",
        r"\bPACKING\s+DATE\b",
    ],

    "consumer_care": [
        r"\bCONSUMER\s+CARE\b",
        r"\bCONSUMER\s+SERVICES\b",
        r"\bCUSTOMER\s+CARE\b",
        r"\bCUSTOMER\s+SERVICE\b",
        r"\bCALL\s+US\b",
        r"\bEMAIL\s+US\b",
        r"\bCONTACT\s+US\b",
    ],

    "country_of_origin": [
        r"\bCOUNTRY\s+OF\s+ORIGIN\b",
        r"\bMADE\s+IN\b",
        r"\bPRODUCT\s+OF\b",
    ],

    "unit_sale_price": [
        r"\bUNIT\s+SALE\s+PRICE\b",
        r"\bUNIT\s+PRICE\b",
        r"\bSALE\s+PRICE\s+PER\b",
        r"\bPRICE\s+PER\s+(?:KG|G|L|ML|UNIT)\b",
    ],
}


def _normalize_text(text: str) -> str:
    """
    Normalize OCR text before field matching.
    """
    text = str(text or "").upper()

    text = text.replace("₹", "RS")
    text = text.replace(":", " ")
    text = text.replace(".", " ")

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def _match_field(text: str) -> Optional[str]:
    """
    Identify a declaration field from explicit labels.
    """
    normalized = _normalize_text(text)

    for field, patterns in FIELD_LABEL_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, normalized, re.IGNORECASE):
                return field

    return None


def detect_fields(
    ocr_results: List[OCRResult],
) -> List[FieldDetection]:

    detections: List[FieldDetection] = []

    for result in ocr_results:

        field = _match_field(result.text)

        if field is None:
            continue

        detections.append(
            FieldDetection(
                field=field,
                text=result.text,
                confidence=result.confidence,
                bbox=result.bbox,
                polygon=result.polygon,
                source="field_detector",
                detection_type="label",
            )
        )

    return detections


def detect_field_map(
    ocr_results: List[OCRResult],
) -> Dict[str, List[FieldDetection]]:

    detections = detect_fields(ocr_results)

    field_map: Dict[str, List[FieldDetection]] = {}

    for detection in detections:
        field_map.setdefault(detection.field, []).append(detection)

    return field_map


def serialize_field_detections(
    detections: List[FieldDetection],
) -> List[Dict]:

    return [
        asdict(detection)
        for detection in detections
    ]