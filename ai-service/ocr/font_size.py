from dataclasses import dataclass, asdict
from typing import List, Optional


@dataclass
class FontSizeEstimate:
    field: str
    estimated_height: float
    unit: str
    confidence: float
    measurement_type: str
    bbox: List[int]

    def to_dict(self):
        return asdict(self)


def estimate_font_size(
    field: str,
    bbox: List[int],
    reference_mm_per_pixel: Optional[float] = None,
    confidence: float = 0.0,
) -> FontSizeEstimate:
    """
    Estimate character height from OCR bounding-box geometry.

    Without a known image scale, the result remains in pixels.
    A millimetre estimate is produced only when a reference scale
    is supplied.
    """

    if not bbox or len(bbox) != 4:
        raise ValueError("bbox must contain [x1, y1, x2, y2]")

    x1, y1, x2, y2 = bbox
    pixel_height = max(1.0, float(y2 - y1))

    if reference_mm_per_pixel is not None:
        if reference_mm_per_pixel <= 0:
            raise ValueError("reference_mm_per_pixel must be positive")

        height = pixel_height * reference_mm_per_pixel
        unit = "mm"
        measurement_type = "estimated"
    else:
        height = pixel_height
        unit = "px"
        measurement_type = "image_geometry_estimate"

    return FontSizeEstimate(
        field=field,
        estimated_height=round(height, 2),
        unit=unit,
        confidence=round(max(0.0, min(1.0, confidence)), 4),
        measurement_type=measurement_type,
        bbox=bbox,
    )