import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User, UserRole
from models.inspection import Inspection
from models.product import Product
from models.risk import RiskScore
from schemas.inspection import InspectionCreate, InspectionResponse
from auth.dependencies import get_current_user, require_role
from utils.audit_logger import log_audit

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.get("/", response_model=List[InspectionResponse])
def get_inspections(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CHECKER, UserRole.ADMIN]))
):
    if current_user.role == UserRole.CHECKER:
        return db.query(Inspection).filter(
            (Inspection.checker_id == current_user.id) | (Inspection.checker_id == None)
        ).all()
    return db.query(Inspection).all()

@router.get("/priority", response_model=List[InspectionResponse])
def get_priority_inspections(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CHECKER, UserRole.ADMIN]))
):
    return db.query(Inspection).order_by(Inspection.priority_score.desc()).all()

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection_by_id(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CHECKER, UserRole.ADMIN]))
):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return insp

@router.post("/", response_model=InspectionResponse)
def create_inspection(
    insp_in: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CHECKER, UserRole.ADMIN]))
):
    product = db.query(Product).filter(Product.id == insp_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    code = f"INSP-{str(uuid.uuid4())[:8].upper()}"
    inspection = Inspection(
        inspection_code=code,
        product_id=product.id,
        checker_id=insp_in.checker_id or (current_user.id if current_user.role == UserRole.CHECKER else None),
        status="ASSIGNED",
        priority_score=insp_in.priority_score or 50.0,
        remarks=insp_in.remarks
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    log_audit(db, action="CREATE_INSPECTION", entity="Inspection", entity_id=str(inspection.id), user=current_user)

    return inspection
