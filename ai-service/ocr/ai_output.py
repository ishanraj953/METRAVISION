from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional


@dataclass
class AIFinalOutput:
    product_type: str
    quality: Dict[str, Any]
    declarations: Dict[str, Any]
    visual_analysis: Dict[str, Any]
    confidence: Dict[str, Any]
    violations: List[Dict[str, Any]]
    annotated_image: Optional[str]

    def to_dict(self):
        return asdict(self)


def build_ai_output(
    product_type: str,
    quality: Dict[str, Any],
    declarations: Dict[str, Any],
    visual_analysis: Dict[str, Any],
    confidence: Dict[str, Any],
    violations: List[Any],
    annotated_image: Optional[str] = None,
) -> Dict[str, Any]:

    serialized_violations = []

    for violation in violations:
        if hasattr(violation, "to_dict"):
            serialized_violations.append(violation.to_dict())
        elif hasattr(violation, "__dict__"):
            serialized_violations.append(vars(violation))
        else:
            serialized_violations.append(violation)

    output = AIFinalOutput(
        product_type=product_type,
        quality=quality,
        declarations=declarations,
        visual_analysis=visual_analysis,
        confidence=confidence,
        violations=serialized_violations,
        annotated_image=annotated_image,
    )

    return output.to_dict()