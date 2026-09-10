import os
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models.rule import Rule

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RULES_FILE = os.path.join(PROJECT_ROOT, "rules", "rules.json")

class RuleEngineService:
    def __init__(self):
        self._cached_rules = None

    def _load_json_rules(self) -> List[Dict[str, Any]]:
        if self._cached_rules is None:
            if os.path.exists(RULES_FILE):
                try:
                    with open(RULES_FILE, "r", encoding="utf-8") as f:
                        self._cached_rules = json.load(f)
                except Exception:
                    self._cached_rules = []
            else:
                self._cached_rules = []
        return self._cached_rules

    def get_applicable_rules(
        self,
        db: Session,
        category: str,
        origin: Optional[str] = "domestic",
        sales_channel: Optional[str] = "retail"
    ) -> List[Dict[str, Any]]:
        """
        Dynamically determine applicable PCR 2011 and Legal Metrology rules
        based on product category, country of origin, and sales channel.
        """
        json_rules = self._load_json_rules()
        db_rules = db.query(Rule).filter(Rule.is_active == True).all()
        db_rule_map = {r.rule_code: r for r in db_rules}
        db_field_map = {r.field_name: r for r in db_rules}

        categories_to_match = ["GENERAL"]
        if category:
            cat_upper = category.upper().replace(" ", "_")
            categories_to_match.append(cat_upper)
            if "FOOD" in cat_upper:
                categories_to_match.append("FOOD")
            if "ELEC" in cat_upper:
                categories_to_match.append("ELECTRONICS")
            if any(w in cat_upper for w in ["COSMETIC", "PERSONAL", "HAIR", "OIL", "SOAP", "BEAUTY"]):
                categories_to_match.append("COSMETICS")
            if "EDIBLE" in cat_upper:
                categories_to_match.append("EDIBLE_OIL")
            if "AGRI" in cat_upper or "FARM" in cat_upper:
                categories_to_match.append("AGRICULTURE")
            if "MEDIC" in cat_upper or "HEALTH" in cat_upper:
                categories_to_match.append("MEDICAL_DEVICES")

        is_imported = bool(origin and any(w in origin.lower() for w in ["imported", "import", "china", "usa", "germany", "japan", "switzerland", "uk"]))
        if is_imported:
            categories_to_match.append("IMPORTED")

        if sales_channel and "E_COMMERCE" in sales_channel.upper():
            categories_to_match.append("E_COMMERCE")
        else:
            categories_to_match.append("RETAIL")

        applicable = []
        for r in json_rules:
            rule_cats = [c.upper() for c in r.get("category", [])]
            if any(c in rule_cats for c in categories_to_match):
                # Enrich with db id if present
                field = r.get("field")
                matching_db = db_rule_map.get(r.get("rule_id")) or db_field_map.get(field)
                r_copy = dict(r)
                if matching_db:
                    r_copy["db_rule_id"] = matching_db.id
                    r_copy["db_rule_code"] = matching_db.rule_code
                applicable.append(r_copy)

        return applicable

    def evaluate_declarations(
        self,
        db: Session,
        category: str,
        declarations: Dict[str, Any],
        origin: Optional[str] = "domestic",
        sales_channel: Optional[str] = "retail",
        product_ref: Any = None,
        image_quality_usable: bool = True
    ) -> dict:
        """
        Dynamic Rule Engine evaluating extracted declarations against applicable PCR 2011 statutory provisions.
        """
        if not image_quality_usable:
            return {
                "status": "INSUFFICIENT_EVIDENCE",
                "message": "Image quality is insufficient to ascertain legal compliance.",
                "passed": [],
                "warnings": [{
                    "field": "image_quality",
                    "message": "Image quality gate failed. Requesting clearer package photograph."
                }],
                "violations": []
            }

        applicable_rules = self.get_applicable_rules(db, category, origin, sales_channel)

        passed = []
        warnings = []
        violations = []

        # Fallback defaults if no rules found
        if not applicable_rules:
            applicable_rules = [
                {"field": "mrp", "rule_id": "LM-PC-001", "requirement": "MRP declaration required inclusive of all taxes", "rule_reference": "Rule 6(1)(e) PCR 2011", "act_section": "Section 36(1) LM Act, 2009", "severity": "HIGH"},
                {"field": "net_quantity", "rule_id": "LM-PC-003", "requirement": "Net quantity declaration in standard units required", "rule_reference": "Rule 6(1)(c) PCR 2011", "act_section": "Section 36(1) LM Act, 2009", "severity": "HIGH"},
                {"field": "manufacturer_name", "rule_id": "LM-PC-002", "requirement": "Manufacturer name & complete address required", "rule_reference": "Rule 6(1)(a) PCR 2011", "act_section": "Section 36(1) LM Act, 2009", "severity": "HIGH"},
                {"field": "consumer_care", "rule_id": "LM-PC-004", "requirement": "Consumer care email / helpline required", "rule_reference": "Rule 6(1)(h) PCR 2011", "act_section": "Section 36(1) LM Act, 2009", "severity": "MEDIUM"}
            ]

        for rule in applicable_rules:
            field_key = rule.get("field")
            req = rule.get("requirement", f"Mandatory declaration for {field_key}")
            severity = rule.get("severity", "HIGH")
            rule_id = rule.get("db_rule_id")
            rule_code = rule.get("rule_id", "LM-PC-001")
            rule_ref = rule.get("rule_reference", "PCR 2011 Rule 6(1)")
            act_sec = rule.get("act_section", "Section 36(1) Legal Metrology Act, 2009")
            penalty_rng = rule.get("penalty_range", "₹25,000 (Jan Vishwas Act, 2023)")
            source_reg = rule.get("source", "Legal Metrology (Packaged Commodities) Rules, 2011")

            decl = declarations.get(field_key)
            if not decl:
                aliases = {
                    "manufacturer_name": ["manufacturer", "marketer", "packer"],
                    "importer_name": ["importer"],
                    "importer_address": ["importer", "importer_name"],
                    "importer_registration": ["importer", "importer_name"],
                    "manufacturing_packing_date": ["manufacturing_date", "mfg_date", "mfd"],
                    "manufacturing_date": ["manufacturing_packing_date", "mfg_date", "mfd"],
                    "net_quantity": ["net_weight", "net_volume"],
                    "consumer_care": ["customer_care", "helpline"],
                    "unit_sale_price": ["usp"],
                    "country_of_origin": ["origin"],
                    "batch_number": ["batch_number", "batch_no", "batch", "lot_number", "lot_no"],
                    "product_name": ["product_name", "name", "commodity"],
                    "expiry_date": ["use_by_date", "best_before", "expiry", "mfg_date", "manufacturing_date", "manufacturing_packing_date"],
                    "numeral_height": ["net_quantity", "mrp"],
                    "visual_prominence": ["product_name", "mrp", "net_quantity"],
                    "anti_profiteering_mrp": ["mrp"],
                    "dual_mrp_prohibition": ["mrp"],
                    "standard_pack_size": ["net_quantity"],
                    "edible_oil_sop": ["net_quantity"],
                    "qr_code_compliance": ["product_name", "mrp"],
                    "ecom_digital_display": ["product_name", "mrp"],
                    "ecom_coo_filter": ["country_of_origin"],
                    "farm_produce_packaging": ["net_quantity"],
                    "medical_device_declaration": ["mrp", "net_quantity"]
                }.get(field_key, [])
                for a in aliases:
                    if declarations.get(a):
                        decl = declarations.get(a)
                        break

            expected_val = getattr(product_ref, field_key, None) if product_ref else None

            if not decl:
                decl_status = "NOT_DETECTED"
                obs_val = None
                conf = 0.85
            elif isinstance(decl, dict):
                decl_status = decl.get("status", "DETECTED")
                obs_val = decl.get("value")
                conf = decl.get("confidence", 0.95)
            else:
                decl_status = "DETECTED"
                obs_val = str(decl)
                conf = 0.95

            # Evaluation logic
            if decl_status == "INSUFFICIENT_EVIDENCE":
                warnings.append({
                    "field": field_key,
                    "rule_code": rule_code,
                    "rule_reference": rule_ref,
                    "act_section": act_sec,
                    "rule_id": rule_id,
                    "message": f"Insufficient visual evidence to evaluate {field_key} [{rule_ref}]"
                })
            elif not obs_val or str(obs_val).upper() in ["NONE", "MISSING", "UNREADABLE", "NOT_DETECTED"]:
                violations.append({
                    "field": field_key,
                    "rule_code": rule_code,
                    "rule_reference": rule_ref,
                    "act_section": act_sec,
                    "penalty_range": penalty_rng,
                    "source": source_reg,
                    "rule_id": rule_id,
                    "requirement": req,
                    "expected_value": expected_val or f"Mandatory {field_key} declaration",
                    "observed_value": "NOT DETECTED / MISSING",
                    "severity": severity,
                    "confidence": conf,
                    "message": f"Mandatory declaration missing: {req} ({rule_ref} / {act_sec})"
                })
            else:
                # Value is present, check for mismatches if product_ref has a registered value
                obs_clean = str(obs_val).strip()
                if expected_val and str(expected_val).strip():
                    exp_clean = str(expected_val).strip()
                    # Mismatch check (case-insensitive for text fields, relaxed for currency/numbers)
                    if exp_clean.lower() != obs_clean.lower() and exp_clean.replace("₹", "").strip() != obs_clean.replace("₹", "").strip():
                        violations.append({
                            "field": field_key,
                            "rule_code": rule_code,
                            "rule_reference": rule_ref,
                            "act_section": act_sec,
                            "penalty_range": penalty_rng,
                            "source": source_reg,
                            "rule_id": rule_id,
                            "requirement": req,
                            "expected_value": exp_clean,
                            "observed_value": obs_clean,
                            "severity": severity,
                            "confidence": conf,
                            "message": f"Declaration mismatch on {field_key}: Expected '{exp_clean}', observed '{obs_clean}' ({rule_ref} / {act_sec})"
                        })
                        continue

                passed.append({
                    "field": field_key,
                    "rule_code": rule_code,
                    "rule_reference": rule_ref,
                    "act_section": act_sec,
                    "penalty_range": penalty_rng,
                    "source": source_reg,
                    "rule_id": rule_id,
                    "requirement": req,
                    "value": obs_clean,
                    "confidence": conf,
                    "message": f"Compliant with {rule_ref}: {req}"
                })

        overall_status = "NON_COMPLIANT" if violations else "COMPLIANT"
        liability = self.calculate_statutory_liability(violations)

        return {
            "status": overall_status,
            "applicable_rules_count": len(applicable_rules),
            "passed": passed,
            "warnings": warnings,
            "violations": violations,
            "liability": liability
        }

    def calculate_statutory_liability(
        self,
        violations: List[Dict[str, Any]],
        is_repeat_offender: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate statutory fine liability under Jan Vishwas (Amendment of Provisions) Act, 2023
        and Sections 36(1), 36(2) of the Legal Metrology Act, 2009.
        """
        if not violations:
            return {
                "liability_status": "NO_VIOLATION",
                "act_section": "Compliant with Legal Metrology Act, 2009 & PCR 2011",
                "recommended_action": "NO_ACTION",
                "penalty_min": 0,
                "penalty_max": 0,
                "compounding_eligible": True,
                "summary": "All statutory declarations verified and fully compliant."
            }

        # Check for short quantity under Section 36(2)
        has_short_qty = any(v.get("field") == "net_quantity" and "short" in str(v.get("message", "")).lower() for v in violations)
        # Check for overcharging / dual MRP under Rule 18 & Section 36(1)
        has_profiteering = any(v.get("field") in ["anti_profiteering_mrp", "dual_mrp_prohibition"] for v in violations)

        if is_repeat_offender:
            penalty_min = 50000
            penalty_max = 100000
            act_sec = "Section 36(1) second/subsequent offence read with Section 48 LM Act, 2009"
            action = "PROSECUTION_OR_COMPOUNDING"
            summary = "Repeat statutory non-compliance. Compoundable up to ₹1,00,000 under Jan Vishwas Act, 2023 or prosecution before Court of Law."
        elif has_short_qty:
            penalty_min = 10000
            penalty_max = 50000
            act_sec = "Section 36(2) Legal Metrology Act, 2009 (Short Quantity Offence)"
            action = "SEIZURE_AND_NOTICE"
            summary = "Short delivery / non-standard quantity offence under Section 36(2). Statutory fine between ₹10,000 and ₹50,000."
        elif has_profiteering:
            penalty_min = 25000
            penalty_max = 50000
            act_sec = "Section 36(1) read with Rule 18 PCR 2011 (Overcharging above MRP)"
            action = "ISSUE_NOTICE"
            summary = "Commercial sale exceeding declared Maximum Retail Price or dual pricing sticker offence. Penalty up to ₹50,000."
        else:
            penalty_min = 10000
            penalty_max = 25000
            act_sec = "Section 36(1) Legal Metrology Act, 2009 (1st Offence Labelling Defect)"
            action = "ISSUE_NOTICE"
            summary = "First offence for pre-packaged commodity declaration lapse. Compoundable up to ₹25,000 under Jan Vishwas Act, 2023."

        return {
            "liability_status": "LIABLE",
            "act_section": act_sec,
            "recommended_action": action,
            "penalty_min": penalty_min,
            "penalty_max": penalty_max,
            "compounding_eligible": True,
            "summary": summary
        }

rule_service = RuleEngineService()

