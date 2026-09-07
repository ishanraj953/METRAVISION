from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.rule import Rule, ComplianceCheck
from models.user import User
from auth.dependencies import get_current_user

router = APIRouter(prefix="/compliance", tags=["Compliance"])

@router.get("/rules")
def get_compliance_rules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Rule).all()

@router.get("/checks/{product_id}")
def get_product_compliance_checks(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ComplianceCheck).filter(ComplianceCheck.product_id == product_id).all()
