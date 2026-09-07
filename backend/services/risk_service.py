import json
from sqlalchemy.orm import Session
from models.product import Product
from models.violation import Violation
from models.risk import RiskScore

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
        severity_weights = {"CRITICAL": 40, "HIGH": 25, "MEDIUM": 15, "LOW": 5}
        
        base_score = 0
        factors = []

        for v in current_violations:
            sev = v.get("severity", "HIGH")
            weight = severity_weights.get(sev, 15)
            base_score += weight
            factors.append(f"Current violation in field '{v.get('field')}' with severity '{sev}'")

        # Repeat offender penalty
        repeat_offender = False
        if total_prod_violations > 2 or mfg_violations_count > 5:
            repeat_offender = True
            base_score += 30
            factors.append(f"Repeat offender flag: Product has {total_prod_violations} prior violations, Manufacturer has {mfg_violations_count} total violations")

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
            factors=json.dumps(factors)
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
