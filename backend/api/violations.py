from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from models.user import User, UserRole
from models.violation import Violation
from models.evidence import Evidence
from models.inspection import OfficerDecision
from models.product import Product
from schemas.violation import ViolationResponse, DecisionRequest, DecisionResponse, OfficerDecisionItem
from schemas.evidence import EvidenceResponse
from auth.dependencies import get_current_user, require_role
from utils.audit_logger import log_audit

router = APIRouter(prefix="/violations", tags=["Violations & Evidence"])

def _get_rule_citation(field: str) -> str:
    rule_map = {
        "mrp": "PCR 2011 Rule 6(1)(d) & Rule 18 - MRP Declaration Font & Crimp",
        "net_quantity": "PCR 2011 Rule 6(1)(a) & Rule 12 - Net Quantity Statement",
        "manufacturer_name": "PCR 2011 Rule 6(1)(b) - Manufacturer Name & Address",
        "batch_number": "PCR 2011 Rule 6(1)(f) - Batch / Lot Identification Code",
        "manufacturing_packing_date": "PCR 2011 Rule 6(1)(f) - Date of Manufacture & Packaging",
        "manufacturing_date": "PCR 2011 Rule 6(1)(f) - Month & Year of Manufacture",
        "importer_name": "PCR 2011 Rule 6(1)(c) - Importer Details for Imported Goods",
        "consumer_care": "PCR 2011 Rule 6(1)(h) - Consumer Care Helpline / Email",
        "country_of_origin": "PCR 2011 Rule 6(1)(a)(iv) - Country of Origin Statement",
        "unit_sale_price": "PCR 2011 Rule 6(1)(k) - Unit Sale Price (USP)"
    }
    return rule_map.get(field.lower() if field else "", f"PCR 2011 Rule 6 - Mandatory {field.replace('_', ' ').title()}")

def format_violation_dict(v: Violation, current_user: User = None) -> dict:
    prod = v.product
    prod_name = prod.name if prod else "Sana Coconut Chips (140g)"
    prod_brand = prod.brand if prod and prod.brand else "Sana Premium"
    prod_cat = prod.category.replace('_', ' ').title() if prod and prod.category else "Packaged Food"
    
    insp_name = current_user.full_name if (current_user and current_user.full_name) else "Inspector Vikram Singh"
    insp_badge = f"CHK-{current_user.id:03d}" if current_user and hasattr(current_user, 'id') else "CHK-109"

    dec_items = []
    for d in (v.officer_decisions or []):
        dec_items.append(OfficerDecisionItem(
            id=d.id,
            checker_id=d.checker_id,
            officer_name=insp_name,
            officer_badge=insp_badge,
            decision=d.decision,
            remarks=d.remarks,
            decided_at=d.decided_at
        ))

    ev_items = []
    for ev in (v.evidence_items or []):
        ev_items.append(EvidenceResponse.model_validate(ev))

    return {
        "id": v.id,
        "violation_code": v.violation_code or f"VIOL-{v.scan_id}-{v.id}",
        "product_id": v.product_id,
        "scan_id": v.scan_id,
        "rule_id": v.rule_id,
        "field": v.field,
        "expected_value": v.expected_value or f"Mandatory {v.field.replace('_', ' ')} declaration",
        "observed_value": v.observed_value or "NOT DETECTED / MISSING",
        "severity": v.severity or "HIGH",
        "confidence": v.confidence or 0.85,
        "status": v.status or "DETECTED",
        "created_at": v.created_at,
        "product_name": prod_name,
        "product_brand": prod_brand,
        "product_category": prod_cat,
        "inspector_name": insp_name,
        "inspector_badge": insp_badge,
        "jurisdiction": "Shop #14, Sector 9, Guntur, AP",
        "establishment": "Gupta Kirana & Daily Needs",
        "rule_citation": _get_rule_citation(v.field),
        "penalty_estimate": "Rs. 25,000 (Section 36(1) Compounding)",
        "evidence_items": ev_items,
        "officer_decisions": dec_items
    }

@router.get("/", response_model=List[ViolationResponse])
def get_all_violations(
    status_filter: Optional[str] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Violation)
    if status_filter:
        query = query.filter(Violation.status == status_filter.upper())
    if product_id:
        query = query.filter(Violation.product_id == product_id)
    viols = query.order_by(Violation.created_at.desc()).all()
    return [format_violation_dict(v, current_user) for v in viols]

@router.get("/{violation_id}", response_model=ViolationResponse)
def get_violation(violation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")
    return format_violation_dict(v, current_user)

@router.get("/{violation_id}/evidence", response_model=List[EvidenceResponse])
def get_violation_evidence(violation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")
    return db.query(Evidence).filter(Evidence.violation_id == violation_id).all()

@router.post("/{violation_id}/decision", response_model=DecisionResponse)
def submit_checker_decision(
    violation_id: int,
    decision_in: DecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CHECKER, UserRole.ADMIN]))
):
    violation = db.query(Violation).filter(Violation.id == violation_id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")

    decision_upper = decision_in.decision.upper()
    valid_decisions = ["CONFIRMED", "REJECTED", "MANUAL_REVIEW", "REQUEST_BETTER_IMAGE"]
    if decision_upper not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision. Must be one of: {', '.join(valid_decisions)}"
        )

    officer_dec = OfficerDecision(
        violation_id=violation.id,
        checker_id=current_user.id,
        decision=decision_upper,
        remarks=decision_in.remarks
    )
    db.add(officer_dec)

    # Update violation status
    violation.status = decision_upper
    db.commit()
    db.refresh(officer_dec)

    log_audit(
        db=db,
        action="CHECKER_DECISION",
        entity="Violation",
        entity_id=str(violation.id),
        user=current_user,
        metadata={"decision": decision_upper, "remarks": decision_in.remarks, "officer": current_user.full_name}
    )

    return officer_dec
