from dataclasses import dataclass, asdict
from typing import List, Optional, Dict
import math
import re

from .ocr_result import OCRResult
from .field_detector import FieldDetection


@dataclass
class FieldValueAssociation:
    field: str
    label_text: str
    label_bbox: List[int]

    value_text: str
    value_bbox: List[int]
    value_confidence: float

    association_confidence: float
    evidence: str


def _center(bbox):
    x1, y1, x2, y2 = bbox
    return (
        (x1 + x2) / 2,
        (y1 + y2) / 2
    )


def _vertical_overlap(a, b):
    ay1, ay2 = a[1], a[3]
    by1, by2 = b[1], b[3]

    overlap = max(
        0,
        min(ay2, by2) - max(ay1, by1)
    )

    min_height = max(
        1,
        min(ay2 - ay1, by2 - by1)
    )

    return overlap / min_height


def _horizontal_gap(label_bbox, value_bbox):
    """
    Distance between label and value horizontally.
    Returns 0 when they overlap.
    """

    lx1, _, lx2, _ = label_bbox
    vx1, _, vx2, _ = value_bbox

    if vx1 >= lx2:
        return vx1 - lx2

    if lx1 >= vx2:
        return lx1 - vx2

    return 0


def _vertical_gap(label_bbox, value_bbox):
    """
    Distance between label and value vertically.
    """

    _, ly1, _, ly2 = label_bbox
    _, vy1, _, vy2 = value_bbox

    if vy1 >= ly2:
        return vy1 - ly2

    if ly1 >= vy2:
        return ly1 - vy2

    return 0


def _is_likely_label(result: OCRResult):
    text = result.text.strip().upper()

    return (
        text.endswith(":")
        or len(text) <= 25
    )


def _value_type_compatible(field: str, text: str) -> bool:

    text_upper = text.upper()

    if field == "net_quantity":
        return bool(
            re.search(
                r"\b\d+(?:\.\d+)?\s*(?:G|KG|MG|ML|L|CL)\b",
                text_upper
            )
        )

    if field == "mrp":
        return bool(
            re.search(
                r"(?:₹|RS\.?|INR)?\s*\d+(?:\.\d{1,2})?",
                text_upper
            )
        )

    if field == "manufacturing_date":
        return bool(
            re.search(
                r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
                text
            )
            or
            re.search(
                r"\b\d{1,2}[/-]\d{2,4}\b",
                text
            )
        )

    if field == "consumer_care":
        return bool(
            re.search(
                r"\b\d{7,15}\b",
                text
            )
            or
            re.search(
                r"[\w.+-]+@[\w.-]+\.\w+",
                text
            )
            or
            "CALL" in text_upper
            or
            "EMAIL" in text_upper
        )

    if field == "country_of_origin":
        return bool(
            re.search(
                r"\b(?:INDIA|CHINA|USA|UNITED STATES|UAE|JAPAN|"
                r"THAILAND|INDONESIA|VIETNAM|GERMANY|FRANCE)\b",
                text_upper
            )
        )

    if field == "unit_sale_price":
        return bool(
            re.search(
                r"(?:₹|RS\.?|INR)?\s*\d+(?:\.\d+)?\s*/?\s*"
                r"(?:KG|G|L|ML|UNIT)",
                text_upper
            )
        )

    # For free-text fields, spatial relationship is sufficient.
    return True


def _association_score(
    field: str,
    label: OCRResult,
    value: OCRResult,
    max_horizontal_gap: int = 500,
    max_vertical_gap: int = 180,
):
    """
    Calculate association confidence between a label and a candidate value.
    """

    h_gap = _horizontal_gap(label.bbox, value.bbox)
    v_gap = _vertical_gap(label.bbox, value.bbox)

    if h_gap > max_horizontal_gap:
        return None

    if v_gap > max_vertical_gap:
        return None

    overlap = _vertical_overlap(label.bbox, value.bbox)

    # Same-line relationship gets the strongest score.
    if overlap >= 0.5 and h_gap <= max_horizontal_gap:
        gap_score = max(
            0.0,
            1.0 - (h_gap / max_horizontal_gap)
        )

        score = (
            0.55
            + 0.25 * overlap
            + 0.20 * gap_score
        )

        return min(1.0, score), "same_line + horizontal_proximity"

    # Nearby vertically stacked value.
    distance = math.sqrt(
        h_gap ** 2 +
        v_gap ** 2
    )

    max_distance = math.sqrt(
        max_horizontal_gap ** 2 +
        max_vertical_gap ** 2
    )

    distance_score = max(
        0.0,
        1.0 - distance / max_distance
    )

    score = (
        0.35
        + 0.40 * distance_score
        + 0.25 * overlap
    )

    return min(1.0, score), "spatial_proximity"

def _extract_embedded_value(field: str, text: str) -> Optional[str]:
    """
    Extract a field value when the label and value occur
    inside the same OCR region.
    """

    text = str(text or "").strip()

    if field == "mrp":
        # Examples:
        # MRP Rs. 10.00
        # MRP: ₹10
        # M.R.P 10.00
        # MRP Rs 10.00 (INCL. OF ALL TAXES)

        match = re.search(
            r"\bM\.?\s*R\.?\s*P\.?\s*[:\-]?\s*"
            r"(?:RS\.?|₹)?\s*"
            r"(\d+(?:\.\d{1,2})?)",
            text,
            re.IGNORECASE,
        )

        if match:
            return match.group(1)

    return None

def _is_invalid_consumer_care_value(
    text: str
) -> bool:

    text_upper = str(text or "").upper()

    invalid_patterns = [
        r"\bLIC\.?\s*NO\b",
        r"\bLICENSE\b",
        r"\bLICENCE\b",
        r"\bFSSAI\b",
        r"\bGST\b",
        r"\bREG\.?\s*NO\b",
        r"\bREGISTRATION\b",
    ]

    return any(
        re.search(
            pattern,
            text_upper
        )
        for pattern in invalid_patterns
    )

def associate_field_values(
    fields,
    ocr_results
):
    associations = []

    for field_detection in fields:

        # Convert FieldDetection into OCRResult
        label = OCRResult(
            text=field_detection.text,
            confidence=field_detection.confidence,
            bbox=field_detection.bbox,
            polygon=field_detection.polygon,
            source=field_detection.source,
        )

        # --------------------------------------------------
        # 1. Check whether label and value are in the SAME
        #    OCR region.
        # --------------------------------------------------

        embedded_value = _extract_embedded_value(
            field_detection.field,
            field_detection.text
        )

        if embedded_value is not None:

            associations.append(
                FieldValueAssociation(
                    field=field_detection.field,
                    label_text=field_detection.text,
                    label_bbox=field_detection.bbox,
                    value_text=embedded_value,
                    value_bbox=field_detection.bbox,
                    value_confidence=field_detection.confidence,
                    association_confidence=round(
                        field_detection.confidence,
                        4
                    ),
                    evidence="embedded_value_in_label_region",
                )
            )

            continue

        # --------------------------------------------------
        # 2. Find nearby OCR regions that could be the value
        # --------------------------------------------------

        candidates = []

        for result in ocr_results:

            # Never associate a label with itself.
            if result.bbox == label.bbox:
                continue

            # Ignore empty OCR regions.
            if not result.text.strip():
                continue

            # --------------------------------------------------
            # Consumer-care specific filtering
            # --------------------------------------------------

            if field_detection.field == "consumer_care":

                if _is_invalid_consumer_care_value(
                    result.text
                ):
                    continue

            # --------------------------------------------------
            # Field-specific value compatibility
            # --------------------------------------------------

            if not _value_type_compatible(
                field_detection.field,
                result.text
            ):
                continue

            # --------------------------------------------------
            # Spatial scoring
            # --------------------------------------------------

            scored = _association_score(
                field_detection.field,
                label,
                result,
            )

            if scored is None:
                continue

            score, evidence = scored

            # Combine spatial association + OCR confidence
            final_score = (
                0.75 * score
                + 0.25 * result.confidence
            )

            candidates.append(
                (
                    final_score,
                    result,
                    evidence,
                )
            )

        # --------------------------------------------------
        # 3. No valid candidate
        # --------------------------------------------------

        if not candidates:
            continue

        # --------------------------------------------------
        # 4. Select best candidate
        # --------------------------------------------------

        candidates.sort(
            key=lambda item: item[0],
            reverse=True
        )

        best_score, best_value, evidence = candidates[0]

        # --------------------------------------------------
        # 5. Store association
        # --------------------------------------------------

        associations.append(
            FieldValueAssociation(
                field=field_detection.field,
                label_text=field_detection.text,
                label_bbox=field_detection.bbox,
                value_text=best_value.text,
                value_bbox=best_value.bbox,
                value_confidence=best_value.confidence,
                association_confidence=round(
                    best_score,
                    4
                ),
                evidence=evidence,
            )
        )

    return associations

def serialize_associations(
    associations: List[FieldValueAssociation],
) -> List[Dict]:

    return [
        asdict(association)
        for association in associations
    ]