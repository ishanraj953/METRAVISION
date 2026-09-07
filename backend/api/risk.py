from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database.connection import get_db
from models.user import User, UserRole
from models.product import Product
from models.risk import RiskScore
from models.violation import Violation
from schemas.risk import RiskResponse
from auth.dependencies import get_current_user, require_role

router = APIRouter(tags=["Risk & Intelligence"])

@router.get("/risk/products/{product_id}", response_model=RiskResponse)
def get_product_risk(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    risk = db.query(RiskScore).filter(RiskScore.product_id == product_id).order_by(RiskScore.id.desc()).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk assessment not found for product")
    return risk

@router.get("/risk/high-risk", response_model=List[RiskResponse])
def get_high_risk_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CHECKER, UserRole.ADMIN]))
):
    return db.query(RiskScore).filter(RiskScore.risk_level.in_(["HIGH", "CRITICAL"])).all()

@router.get("/manufacturers/repeat-offenders")
def get_repeat_offenders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CHECKER, UserRole.ADMIN]))
):
    # Query manufacturers with high violation counts
    results = (
        db.query(Product.manufacturer_name)
        .join(Violation, Violation.product_id == Product.id)
        .filter(Product.manufacturer_name != None)
        .group_by(Product.manufacturer_name)
        .all()
    )
    
    repeat_list = []
    for (mfg_name,) in results:
        v_count = db.query(Violation).join(Product).filter(Product.manufacturer_name == mfg_name).count()
        p_count = db.query(Product).filter(Product.manufacturer_name == mfg_name).count()
        if v_count >= 2:
            repeat_list.append({
                "manufacturer_name": mfg_name,
                "total_products": p_count,
                "total_violations": v_count,
                "repeat_offender": True,
                "risk_level": "HIGH" if v_count < 5 else "CRITICAL"
            })

    return repeat_list
