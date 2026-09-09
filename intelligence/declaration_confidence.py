"""
Phase 10 - Declaration Confidence

Assigns confidence scores and confidence levels
to extracted declaration fields.
"""


def get_confidence_level(confidence: float) -> str:
    """
    Convert confidence score into a confidence level.

    > 0.85  -> HIGH
    0.70-0.85 -> MEDIUM
    < 0.70 -> MANUAL_REVIEW
    """

    if confidence > 0.85:
        return "HIGH"

    if confidence >= 0.70:
        return "MEDIUM"

    return "MANUAL_REVIEW"


def calculate_confidence(
    ocr_confidence: float,
    extraction_confidence: float = 1.0
) -> float:
    """
    Calculate final declaration confidence.

    For the prototype, combine OCR confidence
    and extraction confidence.
    """

    ocr_confidence = max(0.0, min(1.0, ocr_confidence))
    extraction_confidence = max(
        0.0,
        min(1.0, extraction_confidence)
    )

    confidence = ocr_confidence * extraction_confidence

    return round(confidence, 2)


def add_confidence(
    field: str,
    value: str,
    ocr_confidence: float,
    extraction_confidence: float = 1.0
) -> dict:
    """
    Create confidence-enriched declaration result.
    """

    confidence = calculate_confidence(
        ocr_confidence,
        extraction_confidence
    )

    return {
        "field": field,
        "value": value,
        "confidence": confidence,
        "level": get_confidence_level(confidence),
        "manual_review": confidence < 0.70
    }


def process_declarations(declarations: dict) -> dict:
    """
    Add confidence information to extracted declarations.

    Expected input:

    {
        "mrp": {
            "value": "₹499",
            "confidence": 0.97
        },
        "manufacturer": {
            "value": "ABC Pvt Ltd",
            "confidence": 0.63
        }
    }
    """

    result = {}

    for field, data in declarations.items():

        value = data.get("value", "")
        confidence = data.get("confidence", 0.0)

        level = get_confidence_level(confidence)

        result[field] = {
            "value": value,
            "confidence": confidence,
            "level": level,
            "manual_review": confidence < 0.70
        }

    return result