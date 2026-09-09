from dataclasses import dataclass, asdict
from typing import List
import cv2
import numpy as np

from .ocr_result import OCRResult


@dataclass
class ReadabilityResult:
    field: str
    text: str
    bbox: List[int]
    character_height_px: float
    contrast: float
    visibility: float
    obstruction: float
    position: str
    ocr_confidence: float
    readability_score: float
    status: str

    def to_dict(self):
        return asdict(self)


def _contrast(gray):
    if gray.size == 0:
        return 0.0

    p5, p95 = np.percentile(gray, [5, 95])
    return min(1.0, max(0.0, (p95 - p5) / 255.0))


def _character_height(bbox, text):
    x1, y1, x2, y2 = bbox
    height = max(1, y2 - y1)

    # Approximate character height from OCR region height.
    chars = max(1, len(str(text).strip()))
    return round(height / max(1, min(chars, 20)) * 1.8, 2)


def _position(bbox, width, height):
    x1, y1, x2, y2 = bbox

    if x1 < 0 or y1 < 0 or x2 > width or y2 > height:
        return "partially_outside"

    if x2 <= x1 or y2 <= y1:
        return "invalid"

    return "visible"


def analyze_readability(
    image_path: str,
    field: str,
    result: OCRResult,
) -> ReadabilityResult:

    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(image_path)

    height, width = image.shape[:2]
    x1, y1, x2, y2 = result.bbox

    # Clamp crop to image boundaries.
    x1c, y1c = max(0, x1), max(0, y1)
    x2c, y2c = min(width, x2), min(height, y2)

    crop = image[y1c:y2c, x1c:x2c]

    if crop.size == 0:
        return ReadabilityResult(
            field=field,
            text=result.text,
            bbox=result.bbox,
            character_height_px=0.0,
            contrast=0.0,
            visibility=0.0,
            obstruction=1.0,
            position="invalid",
            ocr_confidence=result.confidence,
            readability_score=0.0,
            status="NOT_READABLE",
        )

    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)

    contrast = _contrast(gray)
    position = _position(result.bbox, width, height)

    visibility = 1.0 if position == "visible" else 0.5
    obstruction = 0.0 if position == "visible" else 0.5

    character_height = _character_height(
        result.bbox,
        result.text,
    )

    # Weighted, explainable score.
    score = (
        0.25 * min(1.0, character_height / 15.0)
        + 0.25 * contrast
        + 0.20 * visibility
        + 0.10 * (1.0 - obstruction)
        + 0.20 * result.confidence
    )

    score = round(min(1.0, max(0.0, score)), 4)

    if score >= 0.75:
        status = "READABLE"
    elif score >= 0.50:
        status = "LOW_READABILITY"
    else:
        status = "NOT_READABLE"

    return ReadabilityResult(
        field=field,
        text=result.text,
        bbox=result.bbox,
        character_height_px=round(character_height, 2),
        contrast=round(contrast, 4),
        visibility=round(visibility, 4),
        obstruction=round(obstruction, 4),
        position=position,
        ocr_confidence=round(result.confidence, 4),
        readability_score=score,
        status=status,
    )