from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database.connection import get_db
from models.rule import Rule, ComplianceCheck
from models.user import User
from auth.dependencies import get_current_user
from services.rule_service import rule_service
from services.responsibility_service import ResponsibilityEngine

router = APIRouter(prefix="/compliance", tags=["Compliance"])

@router.get("/rules")
def get_compliance_rules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return rule_service._load_json_rules()

@router.get("/checks/{product_id}")
def get_product_compliance_checks(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ComplianceCheck).filter(ComplianceCheck.product_id == product_id).all()

@router.post("/evaluate")
def evaluate_compliance_endpoint(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Evaluates packaging declarations directly against the 24 statutory Legal Metrology rules
    and computes responsibility & liability.
    """
    extracted = payload.get("declarations") or payload.get("extracted_data") or {}
    category = payload.get("category") or extracted.get("category") or "Cosmetics / Personal Care"
    origin = payload.get("origin") or extracted.get("country_of_origin") or ("domestic" if "india" in str(extracted).lower() else "imported")
    sales_channel = payload.get("sales_channel") or "retail"

    # Normalize dict format for rule_service
    decls_dict = {}
    for k, v in extracted.items():
        if isinstance(v, dict):
            decls_dict[k] = v
        else:
            decls_dict[k] = {"value": str(v) if v is not None else "", "confidence": 0.95}

    rule_result = rule_service.evaluate_declarations(
        db=db,
        category=category,
        declarations=decls_dict,
        origin=origin,
        sales_channel=sales_channel
    )

    resp = ResponsibilityEngine.evaluate_responsibility(
        extracted_data=extracted,
        violations=rule_result["violations"],
        db=db
    )

    return {
        "status": rule_result["status"],
        "violations": rule_result["violations"],
        "passed": rule_result["passed"],
        "warnings": rule_result["warnings"],
        "applicable_rules_count": rule_result["applicable_rules_count"],
        "responsibility": resp
    }
