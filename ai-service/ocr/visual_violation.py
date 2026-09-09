from dataclasses import dataclass, asdict
from typing import List


@dataclass
class VisualViolation:
    violation_type: str
    field: str
    message: str
    severity: str
    confidence: float
    bbox: List[int]

    def to_dict(self):
        return asdict(self)


def detect_visual_violations(
    readability_result,
    font_size_result=None,
):
    violations = []

    # Poor readability
    if readability_result.status == "NOT_READABLE":
        violations.append(
            VisualViolation(
                violation_type="POOR_READABILITY",
                field=readability_result.field,
                message="Mandatory declaration is not visually readable.",
                severity="HIGH",
                confidence=1 - readability_result.readability_score,
                bbox=readability_result.bbox,
            )
        )

    elif readability_result.status == "LOW_READABILITY":
        violations.append(
            VisualViolation(
                violation_type="LOW_READABILITY",
                field=readability_result.field,
                message="Mandatory declaration has low visual readability.",
                severity="MEDIUM",
                confidence=1 - readability_result.readability_score,
                bbox=readability_result.bbox,
            )
        )

    # Low contrast
    if readability_result.contrast < 0.30:
        violations.append(
            VisualViolation(
                violation_type="LOW_CONTRAST",
                field=readability_result.field,
                message="Declaration has low visual contrast.",
                severity="MEDIUM",
                confidence=1 - readability_result.contrast,
                bbox=readability_result.bbox,
            )
        )

    # Obstruction
    if readability_result.obstruction > 0.50:
        violations.append(
            VisualViolation(
                violation_type="OBSTRUCTED_DECLARATION",
                field=readability_result.field,
                message="Declaration appears partially obstructed.",
                severity="HIGH",
                confidence=readability_result.obstruction,
                bbox=readability_result.bbox,
            )
        )

    # Possible font-size issue
    if (
        font_size_result
        and font_size_result.unit == "mm"
        and font_size_result.estimated_height < 1.0
    ):
        violations.append(
            VisualViolation(
                violation_type="POSSIBLE_FONT_SIZE_ISSUE",
                field=font_size_result.field,
                message="Estimated character height may be below the expected requirement.",
                severity="MEDIUM",
                confidence=font_size_result.confidence,
                bbox=font_size_result.bbox,
            )
        )

    return violations