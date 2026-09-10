import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional, List

# Ensure project root directory is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Phase 1 & 2 Modules
from preprocessing.preprocessing import preprocess_image
from preprocessing.quality_check import assess_image_quality

# Phase 3 - 7 Modules
from ocr.ocr_engine import OCREngine
from ocr.postprocess import build_normalized_ocr_output
from ocr.confidence import build_ocr_evidence
from ocr.visualizer import draw_ocr_results
from ocr.declaration_extractor import extract_declarations
from ocr.declaration_pipeline import run_declaration_pipeline

# Multilingual Module
try:
    from multilingual.multilingual_processor import get_multilingual_processor
except Exception:
    try:
        from ai_service.multilingual.multilingual_processor import get_multilingual_processor
    except Exception:
        get_multilingual_processor = None


# Phase 8 Engine Modules
try:
    from engine.rule_applicability import get_applicable_rules
    from engine.conditional_rules import apply_conditional_rules
    from engine.declaration_validator import validate_declarations
    from engine.value_validator import validate_values
    from engine.violation_generator import generate_violations
    from engine.explainable_violation import generate_explanation
    from engine.evidence_linker import link_evidence
except Exception:
    get_applicable_rules = None
    apply_conditional_rules = None
    validate_declarations = None
    validate_values = None
    generate_violations = None
    generate_explanation = None
    link_evidence = None

# Phase 9 Intelligence Modules
try:
    from intelligence.intelligence_engine import analyze_product
except Exception:
    analyze_product = None


class METRAVisionPipeline:

    def __init__(self, ocr_engine: Optional[OCREngine] = None):
        self.ocr_engine = ocr_engine if ocr_engine is not None else OCREngine()

    def process_package(
        self,
        image_path: str,
        generate_visualization: bool = True,
        visualization_output_path: Optional[str] = None,
        product_category: Optional[str] = None,
        origin: str = "DOMESTIC",
        channel: str = "OFFLINE",
        violation_history: int = 0,
        repeat_violation: bool = False
    ) -> Dict[str, Any]:

        image_path = str(Path(image_path))

        # =====================================================
        # PHASE 1 — IMAGE PREPROCESSING & VALIDATION
        # =====================================================

        processed_image, preprocessing = preprocess_image(
            image_path
        )

        if not preprocessing["valid"]:
            return {
                "status": "INVALID_IMAGE",
                "message": preprocessing.get("message", "Invalid image input"),
                "preprocessing": preprocessing,
            }

        target_image_path = preprocessing.get("output_path", image_path)

        # =====================================================
        # PHASE 2 — IMAGE QUALITY GATE
        # =====================================================

        quality = assess_image_quality(
            target_image_path
        )

        # Log quality metrics but do not block OCR extraction
        if not quality.get("usable"):
            quality["quality_warning"] = "Image quality is low, but proceeding with OCR extraction."

        # =====================================================
        # PHASE 3 — OCR ENGINE & MULTILINGUAL OCR PROCESSING
        # =====================================================

        # Run OCR on the original high-resolution image first for maximum fidelity
        ocr_results = self.ocr_engine.extract_text(
            image_path
        )
        if not ocr_results and target_image_path != image_path:
            ocr_results = self.ocr_engine.extract_text(
                target_image_path
            )

        # Apply Multilingual OCR Module (Script detection, Indic numerals & term translations)
        multilingual_info = {}
        if get_multilingual_processor is not None:
            try:
                mp = get_multilingual_processor()
                ocr_results = mp.process_ocr_results(ocr_results)
                scripts_found = list(set(getattr(r, "script", "UNKNOWN") for r in ocr_results if hasattr(r, "script")))
                languages_found = list(set(getattr(r, "language", "en") for r in ocr_results if hasattr(r, "language")))
                multilingual_info = {
                    "scripts": scripts_found,
                    "languages": languages_found,
                    "multilingual_active": True
                }
            except Exception as e:
                multilingual_info = {"multilingual_active": False, "error": str(e)}

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
        # PHASE 6 — DECLARATION EXTRACTION (10 LEGAL FIELDS)
        # =====================================================

        phase6_declarations = extract_declarations(
            ocr_results
        )

        # Enrich missing declarations with multilingual regional translations
        if get_multilingual_processor is not None:
            try:
                mp = get_multilingual_processor()
                phase6_declarations = mp.enrich_declarations(phase6_declarations, ocr_results)
            except Exception:
                pass


        # =====================================================
        # PHASE 7 — FIELD DETECTION, SPATIAL ASSOCIATION & STATUS
        # =====================================================

        phase7_output = run_declaration_pipeline(
            ocr_results=ocr_results,
            image_usable=quality["usable"],
            phase6_declarations=phase6_declarations.get("fields", phase6_declarations)
        )

        # Generate visualization overlay with bounding boxes & field tags
        annotated_image_path = None
        if generate_visualization and ocr_results:
            if visualization_output_path is None:
                output_dir = Path(preprocessing.get("output_path", "output")).parent
                visualization_output_path = str(output_dir / "ocr_visualized.jpg")

            try:
                annotated_image_path = draw_ocr_results(
                    image_path=image_path,
                    results=ocr_results,
                    output_path=visualization_output_path,
                    declarations=phase6_declarations
                )
            except Exception:
                annotated_image_path = None

        # =====================================================
        # PHASE 8 — LEGAL METROLOGY RULE ENGINE & VERIFICATION
        # =====================================================

        rule_engine_res = {}
        detected_fields_list = []
        fields_dict = phase6_declarations.get("fields", {})
        
        for k, v in fields_dict.items():
            if v and isinstance(v, dict) and v.get("value"):
                detected_fields_list.append(k)

        required_declarations = [
            "product_name",
            "manufacturer",
            "net_quantity",
            "mrp",
            "consumer_care",
            "country_of_origin"
        ]

        if origin.upper() == "IMPORTED":
            required_declarations.append("importer")

        if validate_declarations:
            validation_res = validate_declarations(required_declarations, detected_fields_list)
            missing_fields = validation_res["violations"]
            passed_fields = validation_res["passed"]
        else:
            missing_fields = [f for f in required_declarations if f not in detected_fields_list]
            passed_fields = [f for f in required_declarations if f in detected_fields_list]
            validation_res = {
                "status": "COMPLIANT" if not missing_fields else "NON_COMPLIANT",
                "passed": passed_fields,
                "violations": missing_fields
            }

        # Generate rule violation records
        generated_violations = []
        if generate_violations:
            generated_violations = generate_violations(missing_fields)
        else:
            for idx, f_missing in enumerate(missing_fields, start=1):
                generated_violations.append({
                    "violation_id": f"V-{1000 + idx}",
                    "field": f_missing,
                    "observed": "Not detected",
                    "severity": "HIGH",
                    "type": "missing_declaration"
                })

        # Value format validation
        extracted_values = {}
        for f_name, f_data in fields_dict.items():
            if f_data and isinstance(f_data, dict):
                extracted_values[f_name] = f_data.get("value", "")

        value_val_res = {}
        if validate_values:
            value_val_res = validate_values(extracted_values)

        # Build explainable violations & link evidence
        explained_violations = []
        for viol in generated_violations:
            rule_id = viol.get("rule_id", f"LM-RULE-{viol['field'].upper()}")
            viol_obj = {
                "field": viol["field"],
                "rule_id": rule_id,
                "type": viol.get("type", "missing_declaration"),
                "confidence": 0.95,
                "detected_text": viol.get("observed", "MISSING"),
                "bounding_box": [50, 50, 200, 100],
                "reason": f"Required declaration '{viol['field']}' is missing or unreadable on package."
            }

            if generate_explanation:
                exp = generate_explanation(viol_obj)
            else:
                exp = {
                    "what": f"{viol['field'].upper()} not detected",
                    "why": "Applicable Legal Metrology requirement was not satisfied",
                    "rule": rule_id,
                    "evidence": "OCR field missing",
                    "confidence": "95%"
                }
            viol_obj["explanation"] = exp

            if link_evidence:
                linked_ev = link_evidence(viol_obj, {"field": viol["field"], "ocr_text": "", "image_region": "package_label"})
                viol_obj["evidence_link"] = linked_ev

            explained_violations.append(viol_obj)

        rule_engine_res = {
            "compliance_status": validation_res["status"],
            "passed_fields": passed_fields,
            "missing_fields": missing_fields,
            "violations": explained_violations,
            "value_validations": value_val_res
        }

        # =====================================================
        # PHASE 9 — RISK SCORING & INTELLIGENCE ENGINE
        # =====================================================

        intelligence_res = {}
        if analyze_product and explained_violations:
            intelligence_res = analyze_product(
                issues=explained_violations,
                violation_history=violation_history,
                repeat_violation=repeat_violation
            )
        else:
            # Fallback inline intelligence logic if intelligence module isn't loaded
            risk_score = min(len(missing_fields) * 25 + (30 if repeat_violation else 0), 100)
            if risk_score >= 75:
                risk_level = "CRITICAL"
                priority = 1
                decision = "INSPECT"
            elif risk_score >= 50:
                risk_level = "HIGH"
                priority = 1
                decision = "INSPECT"
            elif risk_score >= 25:
                risk_level = "MEDIUM"
                priority = 2
                decision = "VERIFY"
            else:
                risk_level = "LOW"
                priority = 3
                decision = "MONITOR"

            intelligence_res = {
                "risk": {
                    "risk_score": risk_score,
                    "risk_level": risk_level
                },
                "inspection": {
                    "inspection_priority": priority
                },
                "decision": {
                    "officer_decision": decision,
                    "decision_reason": f"Product flagged with {risk_level} risk level based on {len(missing_fields)} missing legal declarations."
                },
                "officer_recommendation": f"Perform physical label inspection for {product_category or 'product'} to verify compliance."
            }

        # =====================================================
        # FINAL UNIFIED RESULT (PHASES 1 - 9)
        # =====================================================

        return {
            "status": "SUCCESS",

            "input": {
                "image_path": image_path,
                "origin": origin,
                "channel": channel
            },

            "preprocessing": preprocessing,             # Phase 1

            "quality": quality,                         # Phase 2

            "ocr": {                                    # Phase 3
                "total_regions": len(ocr_results),
                "results": [r.to_dict() for r in ocr_results]
            },

            "normalized": normalized_ocr,               # Phase 4

            "evidence": evidence,                       # Phase 5

            "declarations": phase6_declarations,         # Phase 6 & 7 Unified

            "phase7_declaration_pipeline": phase7_output, # Phase 7 details

            "rule_engine": rule_engine_res,             # Phase 8

            "intelligence": intelligence_res,           # Phase 9

            "multilingual": multilingual_info,           # Multilingual OCR metadata

            "visualization": {                          # Phase 5 Visual Overlay
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
    visualization_output_path: Optional[str] = None,
    product_category: Optional[str] = None,
    origin: str = "DOMESTIC",
    channel: str = "OFFLINE",
    violation_history: int = 0,
    repeat_violation: bool = False
) -> Dict[str, Any]:
    """
    Run the complete METRAVISION AI pipeline across all phases (Phases 1 to 9).
    """
    pipeline = get_pipeline()
    return pipeline.process_package(
        image_path=image_path,
        generate_visualization=generate_visualization,
        visualization_output_path=visualization_output_path,
        product_category=product_category,
        origin=origin,
        channel=channel,
        violation_history=violation_history,
        repeat_violation=repeat_violation
    )