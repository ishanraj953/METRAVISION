from typing import Any, Dict, List

from .ocr_result import OCRResult
from .field_detector import detect_fields
from .spatial_association import associate_field_values
from .declaration_normalizer import (
    normalize_declarations,
    build_normalized_declaration_map,
    build_structured_declarations,
)
from .declaration_status import assess_all_declarations


class DeclarationPipeline:
    """
    Phase 8:
    Unified declaration intelligence pipeline.

    Combines:
        Phase 6 -> Declaration extraction
        Phase 7.1 -> Field detection
        Phase 7.2 -> Spatial association
        Phase 7.4 -> Normalization
        Phase 7.5 -> Declaration status
    """

    def __init__(self, low_confidence_threshold: float = 0.70):
        self.low_confidence_threshold = low_confidence_threshold

    def process(
        self,
        ocr_results: List[OCRResult],
        image_usable: bool = True,
        phase6_declarations: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """
        Run unified declaration intelligence.

        Parameters
        ----------
        ocr_results:
            OCR regions containing text, confidence and bounding boxes.

        image_usable:
            Result from Phase 2 image quality gate.

        phase6_declarations:
            Optional output from the Phase 6 declaration extractor.
        """

        # ---------------------------------------------------------
        # Phase 7.1 - Detect declaration labels
        # ---------------------------------------------------------
        field_detections = detect_fields(ocr_results)

        # ---------------------------------------------------------
        # Phase 7.2 - Associate labels with values
        # ---------------------------------------------------------
        associations = associate_field_values(
            field_detections,
            ocr_results,
        )

        # ---------------------------------------------------------
        # Phase 7.4 - Normalize associated declaration values
        # ---------------------------------------------------------
        normalized_declarations = normalize_declarations(
            associations
        )

        normalized_map = build_normalized_declaration_map(
            normalized_declarations
        )

        # ---------------------------------------------------------
        # Structured declarations
        # ---------------------------------------------------------
        structured_declarations = build_structured_declarations(
            normalized_declarations
        )

        # ---------------------------------------------------------
        # Phase 7.5 - Determine declaration status
        # ---------------------------------------------------------
        status = assess_all_declarations(
            normalized_map,
            image_usable=image_usable,
            low_confidence_threshold=self.low_confidence_threshold,
        )

        # ---------------------------------------------------------
        # Build unified result
        # ---------------------------------------------------------
        unified = self._build_unified_declarations(
            status=status,
            structured_declarations=structured_declarations,
            normalized_declarations=normalized_declarations,
            field_detections=field_detections,
            associations=associations,
            phase6_declarations=phase6_declarations,
        )

        return {
            "status": "SUCCESS",
            "field_detections": [
                self._serialize(item)
                for item in field_detections
            ],
            "associations": [
                self._serialize(item)
                for item in associations
            ],
            "normalized_declarations": [
                self._serialize(item)
                for item in normalized_declarations
            ],
            "declaration_status": status,
            "structured_declarations": structured_declarations,
            "declarations": unified,
        }

    # =============================================================
    # Unified declaration builder
    # =============================================================

    def _build_unified_declarations(
        self,
        status: Dict[str, Dict[str, Any]],
        structured_declarations: Dict[str, Any],
        normalized_declarations: List[Any],
        field_detections: List[Any],
        associations: List[Any],
        phase6_declarations: Dict[str, Any] | None,
    ) -> Dict[str, Dict[str, Any]]:

        unified = {}

        for field, assessment in status.items():

            field_items = [
                item
                for item in normalized_declarations
                if getattr(item, "field", None) == field
            ]

            field_associations = [
                item
                for item in associations
                if getattr(item, "field", None) == field
            ]

            field_detections_for_field = [
                item
                for item in field_detections
                if getattr(item, "field", None) == field
            ]

            evidence = []

            # -----------------------------------------------------
            # Evidence from normalized declarations
            # -----------------------------------------------------
            for item in field_items:
                evidence.append({
                    "raw_text": getattr(item, "raw_text", ""),
                    "normalized_value": getattr(
                        item,
                        "normalized_value",
                        None,
                    ),
                    "confidence": getattr(
                        item,
                        "confidence",
                        0.0,
                    ),
                    "bbox": getattr(item, "bbox", []),
                    "source": getattr(
                        item,
                        "source",
                        "declaration_normalizer",
                    ),
                })

            # -----------------------------------------------------
            # Evidence from field/value associations
            # -----------------------------------------------------
            for item in field_associations:
                evidence.append({
                    "label_text": getattr(
                        item,
                        "label_text",
                        "",
                    ),
                    "value_text": getattr(
                        item,
                        "value_text",
                        "",
                    ),
                    "label_bbox": getattr(
                        item,
                        "label_bbox",
                        [],
                    ),
                    "value_bbox": getattr(
                        item,
                        "value_bbox",
                        [],
                    ),
                    "value_confidence": getattr(
                        item,
                        "value_confidence",
                        0.0,
                    ),
                    "association_confidence": getattr(
                        item,
                        "association_confidence",
                        0.0,
                    ),
                    "association_evidence": getattr(
                        item,
                        "evidence",
                        "",
                    ),
                })

            # -----------------------------------------------------
            # Use structured consumer-care representation
            # -----------------------------------------------------
            structured_value = structured_declarations.get(field)

            if structured_value is not None:
                value = structured_value.get(
                    "value",
                    structured_value,
                )
            else:
                value = assessment.get("value")

            # -----------------------------------------------------
            # Prefer Phase 6 for fields where Phase 7 did not
            # detect an explicit label.
            #
            # Phase 6 is especially useful for product_name and
            # other heuristic/context-based detections.
            # -----------------------------------------------------
            phase6_value = self._get_phase6_value(
                phase6_declarations,
                field,
            )

            if (
                assessment.get("status") == "NOT_DETECTED"
                and phase6_value is not None
            ):
                value = phase6_value

            unified[field] = {
                "value": value,
                "normalized_value": self._get_normalized_value(
                    field_items,
                    value,
                ),
                "status": assessment.get("status"),
                "confidence": assessment.get(
                    "confidence",
                    0.0,
                ),
                "reason": assessment.get("reason"),
                "evidence_count": assessment.get(
                    "evidence_count",
                    0,
                ),
                "source": self._determine_source(
                    field,
                    field_items,
                    field_detections_for_field,
                    phase6_declarations,
                ),
                "evidence": evidence,
            }

        return unified

    # =============================================================
    # Helpers
    # =============================================================

    @staticmethod
    def _get_phase6_value(
        phase6_declarations: Dict[str, Any] | None,
        field: str,
    ):
        if not phase6_declarations:
            return None

        item = phase6_declarations.get(field)

        if item is None:
            return None

        if isinstance(item, dict):
            return item.get(
                "value",
                item.get("normalized_value"),
            )

        return getattr(
            item,
            "value",
            None,
        )

    @staticmethod
    def _get_normalized_value(
        field_items: List[Any],
        fallback: Any,
    ):
        if not field_items:
            return fallback

        best = max(
            field_items,
            key=lambda item: float(
                getattr(item, "confidence", 0.0)
            ),
        )

        normalized = getattr(
            best,
            "normalized_value",
            None,
        )

        return normalized if normalized is not None else fallback

    @staticmethod
    def _determine_source(
        field: str,
        field_items: List[Any],
        field_detections: List[Any],
        phase6_declarations: Dict[str, Any] | None,
    ) -> str:

        if field_items:
            return "ocr_field_association"

        if field == "product_name" and phase6_declarations:
            if field in phase6_declarations:
                return "declaration_extractor"

        if field_detections:
            return "field_detector"

        return "none"

    @staticmethod
    def _serialize(item: Any) -> Dict[str, Any]:
        if hasattr(item, "to_dict"):
            return item.to_dict()

        if hasattr(item, "__dataclass_fields__"):
            from dataclasses import asdict
            return asdict(item)

        if isinstance(item, dict):
            return item

        return {"value": str(item)}


# -----------------------------------------------------------------
# Convenience function
# -----------------------------------------------------------------

def run_declaration_pipeline(
    ocr_results: List[OCRResult],
    image_usable: bool = True,
    phase6_declarations: Dict[str, Any] | None = None,
) -> Dict[str, Any]:

    pipeline = DeclarationPipeline()

    return pipeline.process(
        ocr_results=ocr_results,
        image_usable=image_usable,
        phase6_declarations=phase6_declarations,
    )