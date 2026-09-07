from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models.rule import Rule

class RuleEngineService:
    def evaluate_declarations(
        self,
        db: Session,
        category: str,
        declarations: Dict[str, Any],
        origin: str = None,
        product_ref: Any = None
    ) -> dict:
        """
        Database-backed rule engine evaluating legal metrology compliance rules.
        """
        active_rules = db.query(Rule).filter(Rule.is_active == True).all()
        
        passed = []
        warnings = []
        violations = []

        # Default standard mandatory fields
        mandatory_fields = [
            ("mrp", "Maximum Retail Price (MRP) declaration"),
            ("net_quantity", "Net Quantity declaration"),
            ("country_of_origin", "Country of Origin declaration"),
            ("manufacturer_name", "Manufacturer Name and Address"),
            ("consumer_care", "Consumer Care details")
        ]

        if origin and origin.lower() == "imported":
            mandatory_fields.append(("importer_name", "Importer Details for imported goods"))

        for field_key, field_desc in mandatory_fields:
            decl = declarations.get(field_key)
            matching_rule = next((r for r in active_rules if r.field_name == field_key), None)
            rule_id = matching_rule.id if matching_rule else None
            severity = matching_rule.severity if matching_rule else "HIGH"

            # Compare against product_ref expected values if provided
            expected_val = getattr(product_ref, field_key, None) if product_ref else None

            if not decl or not decl.get("value") or decl.get("value") == "MISSING":
                violations.append({
                    "field": field_key,
                    "expected_value": expected_val or f"Valid {field_desc}",
                    "observed_value": "MISSING / UNREADABLE",
                    "rule_id": rule_id,
                    "severity": severity,
                    "confidence": decl.get("confidence", 0.9) if decl else 0.9,
                    "message": f"Missing mandatory declaration: {field_desc}"
                })
            else:
                obs_val = str(decl.get("value"))
                # If expected value exists and differs, create a mismatch violation
                if expected_val and str(expected_val).strip() != obs_val.strip():
                    violations.append({
                        "field": field_key,
                        "expected_value": str(expected_val),
                        "observed_value": obs_val,
                        "rule_id": rule_id,
                        "severity": severity,
                        "confidence": decl.get("confidence", 0.95),
                        "message": f"Mismatch in {field_key}: Expected '{expected_val}', observed '{obs_val}'"
                    })
                else:
                    passed.append({
                        "field": field_key,
                        "value": obs_val,
                        "confidence": decl.get("confidence", 0.95),
                        "message": f"Compliant: {field_desc}"
                    })

        overall_status = "NON_COMPLIANT" if violations else "COMPLIANT"

        return {
            "status": overall_status,
            "passed": passed,
            "warnings": warnings,
            "violations": violations
        }

rule_service = RuleEngineService()
