from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database.connection import get_db
from models.user import User, UserRole
from models.product import Product
from models.scan import Scan
from models.violation import Violation
from models.inspection import Inspection
from models.risk import RiskScore
from models.audit import AuditLog
from schemas.user import UserResponse
from schemas.audit import AuditLogResponse
from schemas.admin import DashboardStats, ComplianceStats, ViolationStats, RiskStats, ManufacturerStats
from auth.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Admin & Analytics"])

@router.get("/dashboard", response_model=DashboardStats)
def get_admin_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    u_count = db.query(User).count()
    p_count = db.query(Product).count()
    s_count = db.query(Scan).count()
    v_count = db.query(Violation).count()
    i_count = db.query(Inspection).count()
    comp_rate = round(100.0 * (1.0 - (v_count / max(1, s_count))), 2)

    return DashboardStats(
        total_users=u_count,
        total_products=p_count,
        total_scans=s_count,
        total_violations=v_count,
        total_inspections=i_count,
        overall_compliance_rate=max(0.0, comp_rate)
    )

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).all()

@router.get("/statistics")
@router.get("/compliance-statistics", response_model=ComplianceStats)
def get_compliance_statistics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_scans = db.query(Scan).count()
    compliant = db.query(Scan).filter(Scan.status == "COMPLIANT").count()
    non_compliant = total_scans - compliant
    rate = round((compliant / max(1, total_scans)) * 100.0, 2)

    categories = db.query(Product.category).distinct().all()
    by_cat = {}
    for (cat,) in categories:
        cat_scans = db.query(Scan).join(Product).filter(Product.category == cat).count()
        cat_comp = db.query(Scan).join(Product).filter(Product.category == cat, Scan.status == "COMPLIANT").count()
        by_cat[cat] = round((cat_comp / max(1, cat_scans)) * 100.0, 2)

    return ComplianceStats(
        total_scans=total_scans,
        compliant_scans=compliant,
        non_compliant_scans=non_compliant,
        compliance_rate=rate,
        by_category=by_cat
    )

@router.get("/violation-statistics", response_model=ViolationStats)
def get_violation_statistics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total = db.query(Violation).count()
    open_v = db.query(Violation).filter(Violation.status == "OPEN").count()
    conf_v = db.query(Violation).filter(Violation.status == "CONFIRMED").count()
    rej_v = db.query(Violation).filter(Violation.status == "REJECTED").count()

    sev_list = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    by_sev = {s: db.query(Violation).filter(Violation.severity == s).count() for s in sev_list}

    fields = db.query(Violation.field).distinct().all()
    by_field = {f[0]: db.query(Violation).filter(Violation.field == f[0]).count() for f in fields}

    return ViolationStats(
        total_violations=total,
        open_violations=open_v,
        confirmed_violations=conf_v,
        rejected_violations=rej_v,
        by_severity=by_sev,
        by_field=by_field
    )

@router.get("/risk-statistics", response_model=RiskStats)
def get_risk_statistics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    high_risk = db.query(RiskScore).filter(RiskScore.risk_level.in_(["HIGH", "CRITICAL"])).count()
    repeat = db.query(RiskScore).filter(RiskScore.repeat_offender == True).count()
    
    levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    by_level = {l: db.query(RiskScore).filter(RiskScore.risk_level == l).count() for l in levels}

    return RiskStats(
        high_risk_products_count=high_risk,
        repeat_offenders_count=repeat,
        risk_distribution=by_level
    )

@router.get("/manufacturer-statistics", response_model=ManufacturerStats)
def get_manufacturer_statistics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_mfg = db.query(Product.manufacturer_name).distinct().count()
    
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
                "repeat_offender": True
            })

    return ManufacturerStats(
        total_manufacturers=total_mfg,
        repeat_offenders=repeat_list
    )

@router.get("/inspection-statistics")
def get_inspection_statistics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total = db.query(Inspection).count()
    assigned = db.query(Inspection).filter(Inspection.status == "ASSIGNED").count()
    in_prog = db.query(Inspection).filter(Inspection.status == "IN_PROGRESS").count()
    completed = db.query(Inspection).filter(Inspection.status == "COMPLETED").count()

    return {
        "total_inspections": total,
        "assigned": assigned,
        "in_progress": in_prog,
        "completed": completed
    }

@router.get("/repeat-offenders")
def get_admin_repeat_offenders(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return get_manufacturer_statistics(db, current_user).repeat_offenders

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
