"""
Responsibility and Statutory Penalty Engine for METRAVISION Legal Metrology.
Determines likely responsible entities (Manufacturer, Packer, Importer, Brand Owner, Seller, E-Commerce)
and applicable provisions under Legal Metrology Act, 2009 & PCR, 2011.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models.responsible_party import ResponsibleParty, EntityType

class ResponsibilityEngine:
    @staticmethod
    def evaluate_responsibility(
        extracted_data: Dict[str, Any],
        violations: List[Dict[str, Any]],
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        # 1. Zero Violations Check: Fully Compliant
        if not violations:
            return {
                "entity_type": "NONE",
                "entity_name": "No Liable Party (Fully Compliant)",
                "responsible_party_id": None,
                "address": extracted_data.get("manufacturer_address") or extracted_data.get("address") or "",
                "statutory_section": "Legal Metrology Act, 2009 & PCR 2011 — Fully Compliant",
                "applicable_rule": "All Statutory Mandates Satisfied (Rule 6 PCR 2011)",
                "penalty_min": 0.0,
                "penalty_max": 0.0,
                "rationale": "Zero statutory violations detected. All packaging declarations conform to Legal Metrology Act, 2009 and PCR 2011. No show-cause notice or compounding penalty is applicable.",
                "officer_confirmation_required": False,
                "has_violations": False,
                "disclaimer": "Packaging conforms to Legal Metrology standards. Eligible for immediate Statutory Compliance Clearance."
            }

        manufacturer_name = extracted_data.get("manufacturer_name") or extracted_data.get("manufacturer")
        packer_name = extracted_data.get("packer_name") or extracted_data.get("packer")
        importer_name = extracted_data.get("importer_name") or extracted_data.get("importer")
        brand_name = extracted_data.get("brand_name") or extracted_data.get("brand")
        seller_name = extracted_data.get("seller_name") or extracted_data.get("seller")
        
        has_mrp_overcharge = False
        has_origin_missing = False
        has_ecommerce = False
        
        for v in violations:
            field = str(v.get("field", "")).lower()
            desc = str(v.get("message", "") or v.get("description", "")).lower()
            if "overcharge" in desc or "above mrp" in desc:
                has_mrp_overcharge = True
            if "origin" in field or "country" in field:
                has_origin_missing = True
            if "ecommerce" in field or "marketplace" in desc:
                has_ecommerce = True

        # Check whether commodity is domestic
        country_origin = str(extracted_data.get("country_of_origin") or "").lower()
        is_domestic = any(w in country_origin for w in ["india", "bharat", "domestic"])

        # Genuine importer check
        is_genuine_importer = False
        if importer_name:
            imp_clean = str(importer_name).strip().lower()
            if not any(w in imp_clean for w in ["n/a", "none", "domestic", "made in india", "not applicable", "india"]):
                is_genuine_importer = True

        entity_type = "MANUFACTURER"
        target_name = manufacturer_name or brand_name or "Unknown Manufacturer"
        statutory_section = "Section 36(1) LM Act, 2009 & Rule 6(1) PCR 2011"
        penalty_min = 10000.0
        penalty_max = 25000.0
        rationale = "Manufacturer bears primary statutory responsibility for mandatory package declarations."

        if is_genuine_importer or (has_origin_missing and not is_domestic):
            entity_type = "IMPORTER"
            target_name = importer_name if is_genuine_importer else "Registered Importer"
            statutory_section = "Section 36(1) & 39 LM Act, 2009 & Rule 6(1)(n)"
            rationale = "Importer strictly liable under Rule 27 and Rule 6(1)(n) for imported packaged commodities."
        elif packer_name and not manufacturer_name:
            entity_type = "PACKER"
            target_name = packer_name
            statutory_section = "Section 36(1) LM Act, 2009 & Rule 6(1)(a)"
            rationale = "Packer holds statutory liability as principal packager under Rule 6(1)(a)."
        elif has_ecommerce:
            entity_type = "ECOMMERCE_ENTITY"
            target_name = extracted_data.get("ecommerce_platform") or "E-Commerce Marketplace"
            statutory_section = "Rule 6(10) PCR 2011 read with Section 49 LM Act, 2009"
            penalty_min = 25000.0
            penalty_max = 50000.0
            rationale = "E-Commerce entity liable for digital disclosure omissions prior to sale."
        elif has_mrp_overcharge and seller_name:
            entity_type = "SELLER_DEALER"
            target_name = seller_name
            statutory_section = "Section 36(2) LM Act, 2009"
            penalty_min = 20000.0
            penalty_max = 50000.0
            rationale = "Retailer/Seller liable under Section 36(2) for selling above Maximum Retail Price."
        elif brand_name and not manufacturer_name:
            entity_type = "BRAND_OWNER"
            target_name = brand_name
            statutory_section = "Section 49 LM Act, 2009 & Rule 6(1)(a)"
            rationale = "Brand Owner holds statutory vicarious liability in absence of distinct manufacturer label."

        party_id = None
        if db and target_name:
            party = db.query(ResponsibleParty).filter(ResponsibleParty.name.ilike(f"%{target_name.strip()}%")).first()
            if party:
                party_id = party.id
                if party.total_violations > 0:
                    penalty_max = 50000.0
                    if party.total_violations >= 2:
                        penalty_max = 100000.0

        return {
            "entity_type": entity_type,
            "entity_name": target_name,
            "responsible_party_id": party_id,
            "address": extracted_data.get("manufacturer_address") or extracted_data.get("address"),
            "statutory_section": statutory_section,
            "applicable_rule": "PCR 2011 Rule 6(1)",
            "penalty_min": penalty_min,
            "penalty_max": penalty_max,
            "rationale": rationale,
            "officer_confirmation_required": True,
            "disclaimer": "AI Legal Assessment only. Final liability subject to Legal Metrology Officer confirmation."
        }

    @staticmethod
    def get_or_create_party(
        db: Session,
        name: str,
        entity_type: str = "MANUFACTURER",
        address: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None
    ) -> ResponsibleParty:
        clean_name = name.strip() if name else "Unknown Entity"
        party = db.query(ResponsibleParty).filter(ResponsibleParty.name.ilike(clean_name)).first()
        if not party:
            party = ResponsibleParty(
                name=clean_name,
                entity_type=entity_type,
                address=address,
                email=email,
                phone=phone,
                risk_score=15.0,
                total_inspections=1,
                total_violations=0,
                open_cases=1,
                notices_issued=0,
                total_penalties=0.0,
                status="ACTIVE"
            )
            db.add(party)
            db.commit()
            db.refresh(party)
        return party
