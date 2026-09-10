import sys
import json
from pathlib import Path
from sqlalchemy.orm import Session
from models.product import Product
from models.violation import Violation
from models.risk import RiskScore

# Ensure intelligence module is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
INTELLIGENCE_DIR = PROJECT_ROOT / "intelligence"
if str(INTELLIGENCE_DIR) not in sys.path:
    sys.path.insert(0, str(INTELLIGENCE_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from intelligence_engine import analyze_product
except Exception:
    analyze_product = None


class RiskService:

    def calculate_risk(
        self,
        db: Session,
        product_id: int,
        scan_id: int = None,
        violations: list = None
    ) -> dict:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {
                "risk_score": 0.0,
                "risk_level": "LOW",
                "inspection_priority": 3,
                "repeat_offender": False,
                "factors": []
            }

        # Check total violations for product and manufacturer
        total_prod_violations = db.query(Violation).filter(Violation.product_id == product_id).count()

        mfg_name = product.manufacturer_name
        mfg_violations_count = 0
        if mfg_name:
            mfg_violations_count = db.query(Violation).join(Product).filter(Product.manufacturer_name == mfg_name).count()

        current_violations = violations or []
        repeat_offender = total_prod_violations > 2 or mfg_violations_count > 5

        factors = []
        for v in current_violations:
            sev = v.get("severity", "HIGH")
            f_field = v.get("field", "declaration")
            factors.append(f"Current violation in field '{f_field}' with severity '{sev}'")

        if repeat_offender:
            factors.append(f"Repeat offender flag: Product has {total_prod_violations} prior violations, Manufacturer has {mfg_violations_count} total violations")

        # Run Phase 9 Intelligence Analysis if available
        if analyze_product and current_violations:
            try:
                intel_res = analyze_product(
                    issues=current_violations,
                    violation_history=total_prod_violations,
                    manufacturer_history=mfg_violations_count,
                    repeat_violation=repeat_offender
                )
                final_score = float(intel_res["risk"]["risk_score"])
                risk_level = intel_res["risk"]["risk_level"]
                priority = int(intel_res["inspection"]["inspection_priority"])
            except Exception:
                intel_res = None
        else:
            intel_res = None

        if intel_res is None:
            severity_weights = {"CRITICAL": 40, "HIGH": 25, "MEDIUM": 15, "LOW": 5}
            base_score = sum([severity_weights.get(v.get("severity", "HIGH"), 15) for v in current_violations])
            if repeat_offender:
                base_score += 30
            final_score = min(100.0, float(base_score))

            if final_score >= 75:
                risk_level = "CRITICAL"
                priority = 1
            elif final_score >= 50:
                risk_level = "HIGH"
                priority = 1
            elif final_score >= 25:
                risk_level = "MEDIUM"
                priority = 2
            else:
                risk_level = "LOW"
                priority = 3

        # Save to RiskScore DB table
        risk_entry = RiskScore(
            product_id=product_id,
            scan_id=scan_id,
            risk_score=final_score,
            risk_level=risk_level,
            inspection_priority=priority,
            repeat_offender=repeat_offender,
            factors=json.dumps(factors, default=str)
        )
        db.add(risk_entry)
        db.commit()

        return {
            "risk_score": final_score,
            "risk_level": risk_level,
            "inspection_priority": priority,
            "repeat_offender": repeat_offender,
            "factors": factors
        }


risk_service = RiskService()
