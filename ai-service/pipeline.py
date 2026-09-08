import os
from pathlib import Path
from typing import Any, Dict, Optional

from preprocessing.preprocessing import preprocess_image
from preprocessing.quality_check import assess_image_quality

from ocr.ocr_engine import OCREngine
from ocr.postprocess import build_normalized_ocr_output
from ocr.confidence import build_ocr_evidence
from ocr.visualizer import draw_ocr_results
from ocr.declaration_extractor import extract_declarations


class METRAVisionPipeline:

    def __init__(self, ocr_engine: Optional[OCREngine] = None):
        self.ocr_engine = ocr_engine if ocr_engine is not None else OCREngine()

    def process_package(
        self,
        image_path: str,
        generate_visualization: bool = True,
        visualization_output_path: Optional[str] = None
    ) -> Dict[str, Any]:

        image_path = str(Path(image_path))

        # =====================================================
        # PHASE 1 — IMAGE PREPROCESSING & VALIDATION
        # =====================================================

        processed_image, preprocessing = preprocess_image(
            image_path
        )

        # If Phase 1 validation failed
        if not preprocessing["valid"]:
            return {
                "status": "INVALID_IMAGE",
                "message": preprocessing["message"],
                "preprocessing": preprocessing,
            }

        target_image_path = preprocessing.get("output_path", image_path)

        # =====================================================
        # PHASE 2 — IMAGE QUALITY GATE
        # =====================================================

        quality = assess_image_quality(
            target_image_path
        )

        # Poor quality → stop pipeline with INSUFFICIENT EVIDENCE
        if not quality["usable"]:
            return {
                "status": "INSUFFICIENT_EVIDENCE",
                "message": quality["message"],
                "preprocessing": preprocessing,
                "quality": quality,
            }

        # =====================================================
        # PHASE 3 — OCR ENGINE
        # =====================================================

        ocr_results = self.ocr_engine.extract_text(
            target_image_path
        )

        # =====================================================
        # PHASE 4 — OCR POST-PROCESSING & NORMALIZATION
        # =====================================================

        normalized_ocr = build_normalized_ocr_output(
            ocr_results
        )

        # =====================================================
        # PHASE 5 — OCR CONFIDENCE, EVIDENCE & VISUALIZATION
        # =====================================================

        evidence = [
            build_ocr_evidence(result)
            for result in ocr_results
        ]

        # =====================================================
        # PHASE 6 — DECLARATION INTELLIGENCE
        # =====================================================

        declarations = extract_declarations(
            ocr_results
        )

        # Generate visualization overlay with bounding boxes & field tags
        annotated_image_path = None
        if generate_visualization and ocr_results:
            if visualization_output_path is None:
                output_dir = Path(preprocessing.get("output_path", "output")).parent
                visualization_output_path = str(output_dir / "ocr_visualized.jpg")

            try:
                annotated_image_path = draw_ocr_results(
                    image_path=target_image_path,
                    results=ocr_results,
                    output_path=visualization_output_path,
                    declarations=declarations
                )
            except Exception as e:
                annotated_image_path = None

        # =====================================================
        # FINAL UNIFIED RESULT
        # =====================================================

        return {
            "status": "SUCCESS",

            "input": {
                "image_path": image_path
            },

            "preprocessing": preprocessing,

            "quality": quality,

            "ocr": {
                "total_regions": len(ocr_results),
                "results": [r.to_dict() for r in ocr_results]
            },

            "normalized": normalized_ocr,

            "evidence": evidence,

            "declarations": declarations,

            "visualization": {
                "annotated_image_path": annotated_image_path
            }
        }


# =========================================================
# Module-level instance and convenience helper
# =========================================================

_pipeline_instance: Optional[METRAVisionPipeline] = None


def get_pipeline() -> METRAVisionPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = METRAVisionPipeline()
    return _pipeline_instance


def process_package(
    image_path: str,
    generate_visualization: bool = True,
    visualization_output_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Run the complete METRAVISION AI pipeline across all 6 phases.
    """
    pipeline = get_pipeline()
    return pipeline.process_package(
        image_path=image_path,
        generate_visualization=generate_visualization,
        visualization_output_path=visualization_output_path
    )