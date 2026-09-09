"""
Phase 11 - Declaration Bounding Boxes

Connects extracted declarations with OCR bounding boxes.
"""


def normalize_bbox(bbox):
    """
    Convert bbox into standard format:

    [x1, y1, x2, y2]
    """

    if not bbox or len(bbox) != 4:
        return None

    return [
        int(bbox[0]),
        int(bbox[1]),
        int(bbox[2]),
        int(bbox[3])
    ]


def create_declaration_bbox(
    field,
    value,
    bbox,
    confidence=0.0
):
    """
    Create a declaration object with image coordinates.
    """

    normalized_bbox = normalize_bbox(bbox)

    return {
        "field": field,
        "value": value,
        "bbox": normalized_bbox,
        "confidence": confidence
    }


def attach_bounding_boxes(declarations, ocr_results):
    """
    Connect declarations with OCR results.

    declarations example:

    {
        "mrp": {
            "value": "₹499"
        }
    }

    ocr_results example:

    [
        {
            "text": "MRP ₹499",
            "bbox": [420, 680, 690, 745],
            "confidence": 0.97
        }
    ]
    """

    result = {}

    for field, declaration in declarations.items():

        value = declaration.get("value", "")

        matched = None

        for ocr in ocr_results:

            text = ocr.get("text", "")

            if value and value.lower() in text.lower():
                matched = ocr
                break

        if matched:

            result[field] = {
                "value": value,
                "bbox": normalize_bbox(
                    matched.get("bbox")
                ),
                "confidence": declaration.get(
                    "confidence",
                    matched.get("confidence", 0.0)
                ),
                "evidence_text": matched.get("text", "")
            }

        else:

            result[field] = {
                "value": value,
                "bbox": None,
                "confidence": declaration.get(
                    "confidence",
                    0.0
                ),
                "evidence_text": None
            }

    return result