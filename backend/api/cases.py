from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database.connection import get_db
from models.case import Case
from models.responsible_party import ResponsibleParty
from models.product import Product
from models.notification import Notification
from models.user import User, UserRole
from schemas.case import (
    CaseCreate,
    CaseResponse,
    CaseListResponse,
    CaseConfirmResponsibilityRequest,
    CaseIssueNoticeRequest,
    CaseImposePenaltyRequest,
    CaseCloseRequest,
    DashboardKPIResponse
)
from pydantic import BaseModel
from auth.dependencies import get_current_user, get_optional_current_user
from services.case_service import CaseService
from services.responsibility_service import ResponsibilityEngine
from services.email_service import EmailService
from services.report_service import ReportService
from services.intelligence_service import intelligence_service

router = APIRouter(prefix="/cases", tags=["Enforcement Case Management"])

class OfficerOverrideRequest(BaseModel):
    override_decision: str
    reason: str

def format_case_response(case: Case) -> dict:
    prod_name = case.product.name if case.product else "Pre-Packaged Commodity"
    prod_brand = case.product.brand if case.product else "N/A"
    prod_cat = case.product.category if case.product else "Packaged Goods"
    party_name = case.responsible_party.name if case.responsible_party else "Unassigned Entity"
    
    # Violations summary if available
    v_summary = []
    if case.product and hasattr(case.product, "violations") and case.product.violations:
        for v in case.product.violations:
            v_summary.append({
                "rule_code": v.violation_type or "PCR-R6",
                "field": v.declaration_field or "mrp",
                "message": v.description or "Declaration Non-Compliance",
                "severity": v.severity or "HIGH"
            })

    return {
        "id": case.id,
        "case_number": case.case_number,
        "product_id": case.product_id,
        "inspection_id": case.inspection_id,
        "violation_id": case.violation_id,
        "responsible_party_id": case.responsible_party_id,
        "entity_type": case.entity_type or "MANUFACTURER",
        "applicable_rule": case.applicable_rule or "PCR 2011 Rule 6(1)",
        "applicable_act_section": case.applicable_act_section or "Section 36(1) LM Act, 2009",
        "severity": case.severity or "HIGH",
        "status": case.status or "UNDER_REVIEW",
        "potential_penalty_min": case.potential_penalty_min or 10000.0,
        "potential_penalty_max": case.potential_penalty_max or 25000.0,
        "imposed_penalty": case.imposed_penalty,
        "notice_number": case.notice_number,
        "notice_issued_at": case.notice_issued_at,
        "notice_deadline": case.notice_deadline,
        "officer_id": case.officer_id,
        "officer_name": case.officer_name or "Inspector Vikram Singh",
        "officer_badge": case.officer_badge or "CHK-109",
        "officer_remarks": case.officer_remarks,
        "pdf_report_path": case.pdf_report_path,
        "pdf_download_url": f"/cases/{case.id}/pdf",
        "email_status": case.email_status or "PENDING",
        "email_sent_at": case.email_sent_at,
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        "product_name": prod_name,
        "product_brand": prod_brand,
        "product_category": prod_cat,
        "responsible_party_name": party_name,
        "violations_summary": v_summary
    }

@router.get("/dashboard/kpi", response_model=DashboardKPIResponse)
def get_dashboard_kpis(
    officer_id: Optional[str] = Query(None),
    my_cases_only: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    parsed_officer_id = int(officer_id) if officer_id and str(officer_id).isdigit() else None
    target_officer_id = parsed_officer_id
    target_officer_name = None

    # Inspectors (CHECKER) only see KPIs for cases handled by them
    if current_user.role == UserRole.CHECKER:
        target_officer_id = current_user.id
        target_officer_name = current_user.full_name
    elif my_cases_only:
        target_officer_id = current_user.id
        target_officer_name = current_user.full_name

    stats = CaseService.get_dashboard_kpis(
        db,
        officer_id=target_officer_id,
        officer_name=target_officer_name
    )
    return stats

@router.get("", response_model=CaseListResponse)
def list_cases(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    entity_id: Optional[int] = None,
    officer_id: Optional[str] = Query(None),
    my_cases_only: Optional[bool] = Query(None),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    from sqlalchemy import or_
    query = db.query(Case)

    parsed_officer_id = int(officer_id) if officer_id and str(officer_id).isdigit() else None

    # Scoping cases: If user is an inspector (CHECKER) or requested my_cases_only,
    # strictly restrict to cases handled by this officer
    if current_user.role == UserRole.CHECKER:
        query = query.filter(
            or_(
                Case.officer_id == current_user.id,
                Case.officer_name.ilike(f"%{current_user.full_name}%")
            )
        )
    elif my_cases_only:
        query = query.filter(
            or_(
                Case.officer_id == current_user.id,
                Case.officer_name.ilike(f"%{current_user.full_name}%")
            )
        )
    elif parsed_officer_id is not None:
        query = query.filter(Case.officer_id == parsed_officer_id)

    if status:
        query = query.filter(Case.status == status)
    if severity:
        query = query.filter(Case.severity == severity)
    if entity_id:
        query = query.filter(Case.responsible_party_id == entity_id)
    if search:
        p = f"%{search.strip()}%"
        query = query.join(Case.product, isouter=True).join(Case.responsible_party, isouter=True).filter(
            (Case.case_number.ilike(p)) |
            (Product.name.ilike(p)) |
            (ResponsibleParty.name.ilike(p)) |
            (Case.officer_name.ilike(p))
        )

    total = query.count()
    cases = query.order_by(Case.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    formatted = [format_case_response(c) for c in cases]
    return {
        "items": formatted,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit else 1
    }


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return format_case_response(case)

@router.post("", response_model=CaseResponse)
def create_case(
    req: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new statutory enforcement case from inspection and dispatches notice email with generated fine PDF.
    """
    # 1. Product creation or lookup
    prod = None
    if req.product_id:
        prod = db.query(Product).filter(Product.id == req.product_id).first()
    if not prod:
        prod = Product(
            name=req.product_name or "Pre-Packaged Commodity",
            brand=req.product_brand or "N/A",
            category=req.product_category or "Packaged Goods",
            mrp=str(req.extracted_data.get("mrp", "")) if req.extracted_data else None,
            net_quantity=str(req.extracted_data.get("net_quantity", "")) if req.extracted_data else None,
            country_of_origin=str(req.extracted_data.get("country_of_origin", "")) if req.extracted_data else None,
            manufacturer_name=req.entity_name or (req.extracted_data.get("manufacturer") if req.extracted_data else None),
            importer_name=req.extracted_data.get("importer") if req.extracted_data else None,
            consumer_care=req.recipient_email or (req.extracted_data.get("consumer_care") if req.extracted_data else None),
            shopkeeper_id=current_user.id,
            status="NON_COMPLIANT" if req.violations else "COMPLIANT"
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)

    # 2. Responsible party lookup or creation
    party = None
    if req.responsible_party_id:
        party = db.query(ResponsibleParty).filter(ResponsibleParty.id == req.responsible_party_id).first()
    if not party and req.entity_name:
        party = ResponsibilityEngine.get_or_create_party(
            db=db,
            name=req.entity_name,
            entity_type=req.entity_type,
            email=req.recipient_email
        )
    elif not party:
        party = ResponsibilityEngine.get_or_create_party(
            db=db,
            name="Commercial Entity",
            entity_type=req.entity_type,
            email=req.recipient_email
        )

    # 3. Create Case
    case_num = CaseService.generate_case_number(db)
    officer_name = current_user.full_name or "Inspector Vikram Singh"
    officer_badge = f"CHK-{current_user.id:03d}" if hasattr(current_user, 'id') else "CHK-109"

    case = Case(
        case_number=case_num,
        product_id=prod.id,
        responsible_party_id=party.id,
        entity_type=req.entity_type,
        applicable_rule=req.applicable_rule,
        applicable_act_section=req.applicable_act_section,
        severity=req.severity,
        status=req.status,
        potential_penalty_min=req.potential_penalty_min or 10000.0,
        potential_penalty_max=req.potential_penalty_max or 25000.0,
        imposed_penalty=req.imposed_penalty,
        officer_id=current_user.id,
        officer_name=officer_name,
        officer_badge=officer_badge,
        officer_remarks=req.officer_remarks
    )

    # Notice logic
    if req.status == "NOTICE_ISSUED" or req.notice_type:
        case.notice_number = f"SCN/{datetime.utcnow().strftime('%Y%m%d')}/{case_num.split('-')[-1]}"
        case.notice_issued_at = datetime.utcnow()
        case.notice_deadline = datetime.utcnow() + timedelta(days=req.notice_deadline_days or 15)
        party.notices_issued = (party.notices_issued or 0) + 1

    if req.status == "PENALTY_IMPOSED" and req.imposed_penalty:
        case.imposed_penalty = req.imposed_penalty
        party.total_penalties = (party.total_penalties or 0.0) + req.imposed_penalty

    party.total_inspections = (party.total_inspections or 0) + 1
    party.open_cases = (party.open_cases or 0) + 1
    if req.violations:
        party.total_violations = (party.total_violations or 0) + len(req.violations)
        party.risk_score = min(100.0, (party.risk_score or 15.0) + (len(req.violations) * 10))

    db.add(case)
    db.commit()
    db.refresh(case)

    # 4. Generate Statutory Inspection Memo PDF
    pdf_bytes = None
    try:
        pdf_bytes = ReportService.generate_statutory_inspection_memo(
            product_data={
                "name": prod.name,
                "brand": prod.brand or "N/A",
                "category": prod.category or "Packaged Goods",
                "barcode": req.barcode or "",
                "extracted_data": req.extracted_data or {}
            },
            violations=req.violations or [
                {
                    "rule_id": req.applicable_rule or "PCR-R6",
                    "field": "Packaging Declaration",
                    "message": req.officer_remarks or "Statutory declaration non-compliance under PCR 2011",
                    "severity": req.severity
                }
            ],
            officer_name=officer_name,
            officer_badge=officer_badge,
            station="Legal Metrology Enforcement Headquarters"
        )
    except Exception as pdf_err:
        print(f"Error generating PDF memo: {pdf_err}")

    # 5. Dispatch Auto Email with Generated PDF Report Attached (default: rajishan950@gmail.com)
    target_email = req.recipient_email or party.email or "rajishan950@gmail.com"
    should_send = req.send_email if req.send_email is not None else True

    if should_send and target_email:
        try:
            EmailService.send_statutory_notice_email(
                recipient_email=target_email,
                recipient_name=party.name or "Commercial Entity",
                case_number=case.case_number,
                notice_type=req.notice_type or "SHOW_CAUSE_NOTICE",
                statutory_section=case.applicable_act_section or "Section 36(1) LM Act, 2009",
                due_date_str=case.notice_deadline.strftime("%d-%b-%Y") if case.notice_deadline else "15 Days",
                pdf_bytes=pdf_bytes,
                pdf_filename=f"Statutory_Notice_Fine_{case.case_number}.pdf"
            )
            case.email_status = "SENT"
            case.email_sent_at = datetime.utcnow()
            db.commit()
        except Exception as mail_err:
            print(f"Failed to dispatch statutory fine email: {mail_err}")


    # 6. Create Officer Notification
    notif = Notification(
        title=f"Case Registered: {case.case_number}",
        message=f"Non-compliance case logged for {prod.name}. Notice issued to {party.name} ({target_email or 'No email'}).",
        type="CASE_CREATED",
        severity=req.severity,
        case_id=case.id,
        responsible_party_id=party.id,
        action_url=f"/cases/{case.id}"
    )
    db.add(notif)
    db.commit()

    return format_case_response(case)

@router.post("/evaluate-responsibility")
def evaluate_responsibility_preview(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    extracted_data = payload.get("extracted_data", {})
    violations = payload.get("violations", [])
    resp = ResponsibilityEngine.evaluate_responsibility(
        extracted_data=extracted_data,
        violations=violations,
        db=db
    )
    return resp

@router.post("/{case_id}/confirm-responsibility", response_model=CaseResponse)
def confirm_responsibility(
    case_id: int,
    req: CaseConfirmResponsibilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    if req.responsible_party_id:
        case.responsible_party_id = req.responsible_party_id
    elif req.entity_name:
        party = ResponsibilityEngine.get_or_create_party(
            db=db,
            name=req.entity_name,
            entity_type=req.entity_type
        )
        case.responsible_party_id = party.id

    case.entity_type = req.entity_type
    if req.statutory_section:
        case.applicable_act_section = req.statutory_section
    if req.remarks:
        case.officer_remarks = (case.officer_remarks or "") + f"\n[{datetime.utcnow().strftime('%d-%b %H:%M')}] {req.remarks}"

    case.status = "UNDER_REVIEW"
    db.commit()
    db.refresh(case)
    return format_case_response(case)

@router.post("/{case_id}/issue-notice", response_model=CaseResponse)
def issue_notice(
    case_id: int,
    req: CaseIssueNoticeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    case.status = "NOTICE_ISSUED"
    case.notice_number = f"SCN/{datetime.utcnow().strftime('%Y%m%d')}/{case.id:04d}"
    case.notice_issued_at = datetime.utcnow()
    case.notice_deadline = datetime.utcnow() + timedelta(days=req.deadline_days)
    if req.notice_remarks:
        case.officer_remarks = (case.officer_remarks or "") + f"\n[{datetime.utcnow().strftime('%d-%b %H:%M')}] Notice Issued: {req.notice_remarks}"

    if case.responsible_party:
        case.responsible_party.notices_issued = (case.responsible_party.notices_issued or 0) + 1

    db.commit()
    db.refresh(case)

    # Async email simulation/dispatch with PDF
    if req.send_email and (req.recipient_email or (case.responsible_party and case.responsible_party.email)):
        target_email = req.recipient_email or case.responsible_party.email
        pdf_bytes = None
        try:
            pdf_bytes = ReportService.generate_statutory_inspection_memo(
                product_data={
                    "name": case.product.name if case.product else "Pre-Packaged Commodity",
                    "brand": getattr(case.product, "brand", "N/A") if case.product else "N/A",
                    "category": getattr(case.product, "category", "Packaged Goods") if case.product else "Packaged Goods",
                    "barcode": getattr(case.product, "barcode", ""),
                    "extracted_data": getattr(case.product, "extracted_data", {})
                },
                violations=[
                    {
                        "rule_id": case.applicable_rule or "PCR-R6",
                        "field": "Statutory Declaration",
                        "message": case.officer_remarks or "Non-compliance with Packaged Commodities Rules 2011",
                        "severity": case.severity or "HIGH",
                        "statutory_reference": case.applicable_act_section or "Section 36(1)"
                    }
                ],
                officer_name=current_user.full_name or case.officer_name or "Inspector Vikram Singh",
                officer_badge=case.officer_badge or f"CHK-{current_user.id:03d}",
                station="Legal Metrology Enforcement Headquarters"
            )
        except Exception as e:
            print(f"Error creating PDF: {e}")

        EmailService.send_statutory_notice_email(
            recipient_email=target_email,
            recipient_name=case.responsible_party.name if case.responsible_party else "Authorized Entity",
            case_number=case.case_number,
            notice_type=req.notice_type,
            statutory_section=case.applicable_act_section or "Section 36(1) LM Act, 2009",
            due_date_str=case.notice_deadline.strftime("%d-%b-%Y"),
            pdf_bytes=pdf_bytes,
            pdf_filename=f"Statutory_Notice_Fine_{case.case_number}.pdf"
        )
        case.email_status = "SENT"
        case.email_sent_at = datetime.utcnow()
        db.commit()

    return format_case_response(case)

@router.post("/{case_id}/impose-penalty", response_model=CaseResponse)
def impose_penalty(
    case_id: int,
    req: CaseImposePenaltyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    case.status = "PENALTY_IMPOSED"
    case.imposed_penalty = req.penalty_amount
    if req.statutory_section:
        case.applicable_act_section = req.statutory_section
    if req.penalty_remarks:
        case.officer_remarks = (case.officer_remarks or "") + f"\n[{datetime.utcnow().strftime('%d-%b %H:%M')}] Penalty: {req.penalty_remarks}"

    if case.responsible_party:
        case.responsible_party.total_penalties = (case.responsible_party.total_penalties or 0.0) + req.penalty_amount

    db.commit()
    db.refresh(case)
    return format_case_response(case)

@router.post("/{case_id}/close", response_model=CaseResponse)
def close_case(
    case_id: int,
    req: CaseCloseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    case.status = req.resolution_type  # e.g. COMPOUNDED, CLOSED, DISMISSED
    if req.closing_remarks:
        case.officer_remarks = (case.officer_remarks or "") + f"\n[{datetime.utcnow().strftime('%d-%b %H:%M')}] Resolution ({req.resolution_type}): {req.closing_remarks}"

    if case.responsible_party:
        case.responsible_party.open_cases = max(0, (case.responsible_party.open_cases or 1) - 1)
        if req.amount_collected > 0:
            case.responsible_party.total_penalties = (case.responsible_party.total_penalties or 0.0) + req.amount_collected

    db.commit()
    db.refresh(case)
    return format_case_response(case)

@router.get("/{case_id}/pdf")
def download_case_statutory_pdf(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    officer_name = current_user.full_name or case.officer_name or "Inspector Vikram Singh"
    pdf_bytes = ReportService.generate_statutory_inspection_memo(
        product_data={
            "name": case.product.name if case.product else "Pre-Packaged Commodity",
            "brand": getattr(case.product, "brand", "N/A") if case.product else "N/A",
            "category": getattr(case.product, "category", "Packaged Goods") if case.product else "Packaged Goods",
            "barcode": getattr(case.product, "barcode", ""),
            "extracted_data": getattr(case.product, "extracted_data", {})
        },
        violations=[
            {
                "rule_id": case.applicable_rule or "PCR-R6",
                "field": "Statutory Declaration",
                "message": case.officer_remarks or "Non-compliance with Packaged Commodities Rules 2011",
                "severity": case.severity or "HIGH",
                "statutory_reference": case.applicable_act_section or "Section 36(1)"
            }
        ],
        officer_name=officer_name,
        officer_badge=case.officer_badge or f"CHK-{current_user.id:03d}",
        station="Legal Metrology Enforcement Headquarters"
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="Statutory_Enforcement_Memo_{case.case_number}.pdf"'
        }
    )

@router.post("/{case_id}/override")
def apply_case_officer_override(
    case_id: int,
    payload: OfficerOverrideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Apply Legal Metrology Officer override to system decision on enforcement case.
    Logs audit trail event using engine.audit_trail and engine.officer_override.
    """
    try:
        res = intelligence_service.record_officer_override(
            db=db,
            case_id=case_id,
            officer_id=current_user.id,
            officer_email=current_user.email,
            override_decision=payload.override_decision,
            reason=payload.reason
        )
        return {"success": True, "detail": "Officer override recorded", "data": res}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
