from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from database.connection import get_db
from models.user import User
from auth.dependencies import get_current_user
from services.intelligence_service import intelligence_service
from engine import validate_values, apply_conditional_rules, get_applicable_rules
from intelligence import analyze_product

router = APIRouter(prefix="/intelligence", tags=["Intelligence & Rule Engine"])


class IssuesPayload(BaseModel):
    issues: List[Dict[str, Any]]
    violation_history: Optional[int] = 0
    manufacturer_history: Optional[int] = 0
    repeat_violation: Optional[bool] = False
    violation_frequency: Optional[int] = 0


class ProductDataPayload(BaseModel):
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    date: Optional[str] = None


class ConditionalRulesPayload(BaseModel):
    origin: Optional[str] = None
    channel: Optional[str] = None
    category: Optional[List[str]] = None


@router.post("/analyze")
def analyze_intelligence(
    payload: IssuesPayload,
    current_user: User = Depends(get_current_user)
):
    """
    Run complete METRAVISION intelligence analysis on product issues payload.
    Includes Risk Score, Evidence Chain, Inspection Priority, Officer Decision & Recommendations.
    """
    try:
        result = analyze_product(
            issues=payload.issues,
            violation_history=payload.violation_history or 0,
            manufacturer_history=payload.manufacturer_history or 0,
            repeat_violation=payload.repeat_violation or False,
            violation_frequency=payload.violation_frequency or 0
        )
        return {"success": True, "intelligence": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Intelligence analysis failed: {str(e)}"
        )


@router.post("/validate-values")
def validate_field_values(
    payload: ProductDataPayload,
    current_user: User = Depends(get_current_user)
):
    """
    Validate declaration formats (MRP, Net Quantity regex, Date regex) using engine.value_validator.
    """
    data = payload.dict()
    results = intelligence_service.validate_extracted_values(data)
    return {"success": True, "validation": results}


@router.post("/conditional-rules")
def get_conditional_rules(
    payload: ConditionalRulesPayload,
    current_user: User = Depends(get_current_user)
):
    """
    Get applicable PCR 2011 rules based on product origin (e.g. IMPORTED) and channel (e.g. E_COMMERCE).
    """
    data = payload.dict()
    applicable_rule_ids = intelligence_service.determine_conditional_rules(data)
    
    full_rules = []
    if payload.category:
        try:
            full_rules = get_applicable_rules({"category": payload.category})
        except Exception:
            full_rules = []

    return {
        "success": True,
        "applicable_rule_ids": applicable_rule_ids,
        "category_rules": full_rules
    }


@router.get("/scans/{scan_id}")
def get_scan_intelligence(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve or compute intelligence report for a specific scan.
    """
    try:
        report = intelligence_service.analyze_scan_intelligence(db=db, scan_id=scan_id)
        return {"success": True, "scan_id": scan_id, "intelligence_report": report}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
