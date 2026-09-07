from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User
from models.violation import Violation
from models.evidence import Evidence
from models.inspection import OfficerDecision
from schemas.violation import ViolationResponse, DecisionRequest, DecisionResponse
from schemas.evidence import EvidenceResponse
from auth.dependencies import get_current_user, require_checker, require_role
from models.user import UserRole
from utils.audit_logger import log_audit

router = APIRouter(prefix="/violations", tags=["Violations & Evidence"])

@router.get("/{violation_id}", response_model=ViolationResponse)
def get_violation(violation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")
    return v

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
    if decision_upper not in ["CONFIRMED", "REJECTED", "MANUAL_REVIEW"]:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be CONFIRMED, REJECTED, or MANUAL_REVIEW")

    # CRITICAL: Preserve original AI finding, store Checker decision separately!
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
        metadata={"decision": decision_upper, "remarks": decision_in.remarks}
    )

    return officer_dec
