import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from models.scan import Scan
from models.product import Product
from models.violation import Violation
from models.case import Case
from models.audit import AuditLog

from engine import (
    validate_values,
    apply_conditional_rules,
    apply_officer_override,
    create_audit_log,
    link_evidence,
    generate_explanation as generate_engine_explanation,
)
from intelligence import analyze_product

logger = logging.getLogger(__name__)


class IntelligenceService:
    def analyze_scan_intelligence(self, db: Session, scan_id: int) -> Dict[str, Any]:
        """
        Orchestrates full METRAVISION intelligence analysis for a specific scan.
        Integrates risk evaluation, priority ranking, evidence chain validation,
        and officer recommendations.
        """
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            raise ValueError(f"Scan with ID {scan_id} not found.")

        product = db.query(Product).filter(Product.id == scan.product_id).first()
        violations = db.query(Violation).filter(Violation.scan_id == scan.id).all()

        # Build issues structure from database violations
        issues: List[Dict[str, Any]] = []
        for v in violations:
            violation_type = "missing_declaration"
            rule_code = v.rule_code or "LM-PCR-2011"
            if "mrp" in rule_code.lower() or "price" in rule_code.lower():
                violation_type = "mrp_violation"
            elif "font" in rule_code.lower():
                violation_type = "font_readability"
            elif "online" in rule_code.lower() or "ecommerce" in rule_code.lower():
                violation_type = "online_mismatch"

            confidence = float(v.confidence_score or 0.85)
            issues.append({
                "type": violation_type,
                "detected_text": v.detected_text or "",
                "bounding_box": [v.bbox_x, v.bbox_y, v.bbox_width, v.bbox_height] if v.bbox_x is not None else [100, 100, 200, 50],
                "rule_id": rule_code,
                "reason": v.description or f"Violation of rule {rule_code}",
                "confidence": confidence,
                "image_quality": float(scan.image_quality_score or 0.85),
                "rule_certainty": 1.0
            })

        # Calculate history and repeat violation status
        violation_history = 0
        manufacturer_history = 0
        repeat_violation = False

        if product:
            # Count past non-compliant scans for this product/shopkeeper
            past_scans_count = db.query(Scan).filter(
                Scan.product_id == product.id,
                Scan.id != scan.id,
                Scan.status == "NON_COMPLIANT"
            ).count()
            violation_history = past_scans_count
            manufacturer_history = past_scans_count
            repeat_violation = past_scans_count > 0

        # Execute Intelligence Engine Analysis
        analysis_result = analyze_product(
            issues=issues,
            violation_history=violation_history,
            manufacturer_history=manufacturer_history,
            repeat_violation=repeat_violation,
            violation_frequency=violation_history
        )

        # Value validation on detected fields if available
        if scan.extracted_declarations_json:
            try:
                extracted = json.loads(scan.extracted_declarations_json)
                if isinstance(extracted, dict):
                    analysis_result["value_validation"] = validate_values(extracted)
            except Exception as e:
                logger.warning(f"Could not parse extracted_declarations_json for value validation: {e}")

        # Store analysis report in scan record
        scan.intelligence_report = json.dumps(analysis_result)
        db.commit()
        db.refresh(scan)

        return analysis_result

    def validate_extracted_values(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates field formats (MRP, Net Quantity, Date) using engine.value_validator.
        """
        return validate_values(product_data)

    def determine_conditional_rules(self, product_metadata: Dict[str, Any]) -> List[str]:
        """
        Determines applicable rules using engine.conditional_rules.
        """
        return apply_conditional_rules(product_metadata)

    def record_officer_override(
        self,
        db: Session,
        case_id: int,
        officer_id: int,
        officer_email: str,
        override_decision: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        Applies an officer decision override to an enforcement case and records an audit log.
        """
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError(f"Enforcement case with ID {case_id} not found.")

        current_system_decision = case.status or "NON_COMPLIANT"
        override_result = apply_officer_override(
            violation_id=case.case_number,
            system_decision=current_system_decision,
            officer_override=override_decision,
            reason=reason
        )

        # Update case status based on officer override
        if override_decision.upper() in ["DISMISSED", "COMPLIANT", "RESOLVED"]:
            case.status = "DISMISSED"
        elif override_decision.upper() in ["ACTION_REQUIRED", "INSPECT", "NON_COMPLIANT"]:
            case.status = "NOTICE_ISSUED"

        case.officer_notes = f"[OFFICER OVERRIDE] {override_decision}: {reason}"

        # Record Audit Trail
        audit_dict = create_audit_log(
            rule_id=f"CASE-{case.id}",
            action=f"OFFICER_OVERRIDE_{override_decision}",
            status="SUCCESS"
        )
        audit_entry = AuditLog(
            user_id=officer_id,
            user_email=officer_email,
            action=f"OFFICER_OVERRIDE",
            entity="EnforcementCase",
            entity_id=str(case.id),
            metadata_json=json.dumps({
                "override_details": override_result,
                "audit_engine": audit_dict,
                "reason": reason
            })
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(case)

        return {
            "case_id": case.id,
            "case_number": case.case_number,
            "override_result": override_result,
            "new_status": case.status
        }


intelligence_service = IntelligenceService()
