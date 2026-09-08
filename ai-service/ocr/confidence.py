from typing import Literal


ConfidenceLevel = Literal[
    "high",
    "medium",
    "low"
]


def classify_confidence(score: float) -> ConfidenceLevel:
    """
    Classify OCR confidence.

    >= 0.90  -> high
    >= 0.70  -> medium
    < 0.70   -> low
    """

    score = max(0.0, min(1.0, float(score)))

    if score >= 0.90:
        return "high"

    if score >= 0.70:
        return "medium"

    return "low"

def filter_by_confidence(
    results,
    minimum_confidence: float = 0.50
):
    return [
        result
        for result in results
        if result.confidence >= minimum_confidence
    ]

def validate_bbox(
    bbox,
    image_width: int,
    image_height: int
) -> bool:

    if bbox is None or len(bbox) != 4:
        return False

    x1, y1, x2, y2 = bbox

    if x2 <= x1 or y2 <= y1:
        return False

    if x1 < 0 or y1 < 0:
        return False

    if x2 > image_width or y2 > image_height:
        return False

    return True

def build_ocr_evidence(result):
    return {
        "text": result.text,
        "confidence": round(float(result.confidence), 4),
        "confidence_level": classify_confidence(
            result.confidence
        ),
        "bbox": result.bbox,
        "polygon": result.polygon,
        "source": result.source,
        "page": getattr(result, "page", 1)
    }

