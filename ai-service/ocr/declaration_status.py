from dataclasses import dataclass, asdict
from typing import Dict, List, Optional
from enum import Enum


class DeclarationStatus(str, Enum):
    DETECTED = "DETECTED"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    NOT_DETECTED = "NOT_DETECTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


@dataclass
class DeclarationAssessment:
    field: str
    status: DeclarationStatus
    value: Optional[object]
    confidence: float
    reason: str
    evidence_count: int

    def to_dict(self) -> Dict:
        data = asdict(self)
        data["status"] = self.status.value
        return data


# Required declaration fields for the current prototype.
REQUIRED_FIELDS = [
    "product_name",
    "manufacturer",
    "packer",
    "importer",
    "net_quantity",
    "mrp",
    "manufacturing_date",
    "consumer_care",
    "country_of_origin",
    "unit_sale_price",
]


def _get_best_confidence(
    declarations: List[Dict]
) -> float:

    if not declarations:
        return 0.0

    return max(
        float(item.get("confidence", 0.0))
        for item in declarations
    )


def assess_declaration_status(
    field: str,
    declarations: List[Dict],
    image_usable: bool = True,
    low_confidence_threshold: float = 0.70,
) -> DeclarationAssessment:

    # --------------------------------------------------
    # No declaration found
    # --------------------------------------------------

    if not declarations:

        if not image_usable:
            return DeclarationAssessment(
                field=field,
                status=DeclarationStatus.INSUFFICIENT_EVIDENCE,
                value=None,
                confidence=0.0,
                reason=(
                    "Image quality is insufficient "
                    "to reliably assess this declaration."
                ),
                evidence_count=0,
            )

        return DeclarationAssessment(
            field=field,
            status=DeclarationStatus.NOT_DETECTED,
            value=None,
            confidence=0.0,
            reason=(
                "No reliable declaration evidence "
                "was detected."
            ),
            evidence_count=0,
        )

    # --------------------------------------------------
    # Select strongest evidence
    # --------------------------------------------------

    best = max(
        declarations,
        key=lambda item: float(
            item.get("confidence", 0.0)
        ),
    )

    confidence = float(
        best.get("confidence", 0.0)
    )

    value = best.get(
        "normalized_value",
        best.get("value")
    )

    # --------------------------------------------------
    # Low confidence
    # --------------------------------------------------

    if confidence < low_confidence_threshold:

        return DeclarationAssessment(
            field=field,
            status=DeclarationStatus.LOW_CONFIDENCE,
            value=value,
            confidence=confidence,
            reason=(
                "Declaration detected, but "
                "confidence is below the reliability threshold."
            ),
            evidence_count=len(declarations),
        )

    # --------------------------------------------------
    # Detected
    # --------------------------------------------------

    return DeclarationAssessment(
        field=field,
        status=DeclarationStatus.DETECTED,
        value=value,
        confidence=confidence,
        reason=(
            "Declaration detected with sufficient "
            "confidence."
        ),
        evidence_count=len(declarations),
    )


def assess_all_declarations(
    declaration_map: Dict[str, List[Dict]],
    image_usable: bool = True,
    low_confidence_threshold: float = 0.70,
) -> Dict[str, Dict]:

    assessments = {}

    for field in REQUIRED_FIELDS:

        field_declarations = declaration_map.get(
            field,
            []
        )

        assessment = assess_declaration_status(
            field=field,
            declarations=field_declarations,
            image_usable=image_usable,
            low_confidence_threshold=(
                low_confidence_threshold
            ),
        )

        assessments[field] = (
            assessment.to_dict()
        )

    return assessments