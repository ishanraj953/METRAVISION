"""
Case Service for Legal Metrology Enforcement.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from models.case import Case
from models.responsible_party import ResponsibleParty
from models.product import Product
from models.notification import Notification
from services.responsibility_service import ResponsibilityEngine

class CaseService:
    @staticmethod
    def generate_case_number(db: Session) -> str:
        today_str = datetime.utcnow().strftime("%Y%m%d")
        prefix = f"MV-{today_str}-"
        latest = db.query(Case).filter(Case.case_number.like(f"{prefix}%")).order_by(desc(Case.id)).first()
        if latest and latest.case_number:
            try:
                seq = int(latest.case_number.split("-")[-1]) + 1
            except Exception:
                seq = 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"

    @staticmethod
    def create_case_from_scan(
        db: Session,
        product: Product,
        violations: List[Dict[str, Any]],
        officer_id: Optional[int] = None,
        officer_name: str = "Inspector Vikram Singh",
        officer_badge: str = "CHK-109"
    ) -> Case:
        case_num = CaseService.generate_case_number(db)
        
        extracted = product.extracted_data or {}
        resp_eval = ResponsibilityEngine.evaluate_responsibility(
            extracted_data=extracted,
            violations=violations,
            db=db
        )

        party = ResponsibilityEngine.get_or_create_party(
            db=db,
            name=resp_eval["entity_name"],
            entity_type=resp_eval["entity_type"],
            address=resp_eval.get("address")
        )

        severity = "HIGH" if len(violations) >= 2 else "MEDIUM"
        if len(violations) >= 4:
            severity = "CRITICAL"

        case = Case(
            case_number=case_num,
            product_id=product.id,
            responsible_party_id=party.id,
            entity_type=resp_eval["entity_type"],
            applicable_rule=resp_eval["applicable_rule"],
            applicable_act_section=resp_eval["statutory_section"],
            severity=severity,
            status="UNDER_REVIEW",
            potential_penalty_min=resp_eval["penalty_min"],
            potential_penalty_max=resp_eval["penalty_max"],
            officer_id=officer_id,
            officer_name=officer_name,
            officer_badge=officer_badge,
            officer_remarks=f"Detected {len(violations)} non-compliances. Recommended {resp_eval['statutory_section']} against {resp_eval['entity_name']}."
        )
        db.add(case)
        
        party.open_cases = (party.open_cases or 0) + 1
        party.total_violations = (party.total_violations or 0) + len(violations)
        party.risk_score = min(100.0, (party.risk_score or 15.0) + (len(violations) * 10))

        db.commit()
        db.refresh(case)

        # Generate Statutory Inspection Memo PDF & Auto-dispatch Email to rajishan950@gmail.com
        try:
            from services.report_service import ReportService
            from services.email_service import EmailService

            pdf_bytes = ReportService.generate_statutory_inspection_memo(
                product_data={
                    "name": product.name or "Pre-Packaged Commodity",
                    "brand": product.brand or "N/A",
                    "category": product.category or "Packaged Goods",
                    "extracted_data": extracted
                },
                violations=violations or [
                    {
                        "rule_id": resp_eval["applicable_rule"],
                        "field": "Packaging Declaration",
                        "message": "Statutory non-compliance detected during package perception scan.",
                        "severity": severity
                    }
                ],
                officer_name=officer_name,
                officer_badge=officer_badge,
                station="Legal Metrology Enforcement Headquarters"
            )

            EmailService.send_statutory_notice_email(
                recipient_email="rajishan950@gmail.com",
                recipient_name=resp_eval["entity_name"],
                case_number=case_num,
                notice_type="STATUTORY_INSPECTION_MEMO",
                statutory_section=resp_eval["statutory_section"],
                due_date_str=(datetime.utcnow() + timedelta(days=15)).strftime("%d-%b-%Y"),
                pdf_bytes=pdf_bytes,
                pdf_filename=f"Statutory_Notice_Fine_{case_num}.pdf"
            )
            case.email_status = "SENT"
            case.email_sent_at = datetime.utcnow()
        except Exception as mail_err:
            print(f"Auto-mail dispatch error in create_case_from_scan: {mail_err}")

        # Create alert notification
        notif = Notification(
            title=f"New Case Created: {case_num}",
            message=f"Non-compliance detected for {product.name or 'Commodity'}. Severity: {severity}. PDF memo mailed to rajishan950@gmail.com.",
            type="CASE_CREATED",
            severity=severity,
            case_id=case.id,
            responsible_party_id=party.id,
            action_url=f"/cases/{case.id}"
        )
        db.add(notif)
        db.commit()

        return case

    @staticmethod
    def get_dashboard_kpis(
        db: Session,
        officer_id: Optional[int] = None,
        officer_name: Optional[str] = None
    ) -> Dict[str, Any]:
        from sqlalchemy import or_

        def apply_officer_filter(q):
            if officer_id and officer_name:
                return q.filter(or_(Case.officer_id == officer_id, Case.officer_name.ilike(f"%{officer_name}%")))
            elif officer_id:
                return q.filter(Case.officer_id == officer_id)
            elif officer_name:
                return q.filter(Case.officer_name.ilike(f"%{officer_name}%"))
            return q

        total_cases = apply_officer_filter(db.query(func.count(Case.id))).scalar() or 0
        active_cases = apply_officer_filter(db.query(func.count(Case.id))).filter(
            Case.status.in_(["UNDER_REVIEW", "NOTICE_ISSUED", "PENALTY_IMPOSED", "HEARING_SCHEDULED"])
        ).scalar() or 0
        notices_pending = apply_officer_filter(db.query(func.count(Case.id))).filter(Case.status == "NOTICE_ISSUED").scalar() or 0
        penalties_imposed = apply_officer_filter(db.query(func.sum(Case.imposed_penalty))).scalar() or 0.0
        penalties_collected = db.query(func.sum(ResponsibleParty.total_penalties)).scalar() or 0.0
        repeat_offenders_count = db.query(func.count(ResponsibleParty.id)).filter(ResponsibleParty.total_violations > 1).scalar() or 0

        # Status counts
        status_keys = ["UNDER_REVIEW", "NOTICE_ISSUED", "PENALTY_IMPOSED", "COMPOUNDED", "CLOSED", "DISMISSED"]
        status_counts = {}
        for k in status_keys:
            status_counts[k] = apply_officer_filter(db.query(func.count(Case.id))).filter(Case.status == k).scalar() or 0

        severity_keys = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        severity_counts = {}
        for sv in severity_keys:
            severity_counts[sv] = apply_officer_filter(db.query(func.count(Case.id))).filter(Case.severity == sv).scalar() or 0

        entity_keys = ["MANUFACTURER", "PACKER", "IMPORTER", "BRAND_OWNER", "SELLER_DEALER", "ECOMMERCE_ENTITY"]
        entity_counts = {}
        for ek in entity_keys:
            entity_counts[ek] = db.query(func.count(ResponsibleParty.id)).filter(ResponsibleParty.entity_type == ek).scalar() or 0

        return {
            "total_cases": total_cases,
            "active_cases": active_cases,
            "notices_pending": notices_pending,
            "penalties_imposed_inr": float(penalties_imposed),
            "penalties_collected_inr": float(penalties_collected),
            "repeat_offenders_count": repeat_offenders_count,
            "status_breakdown": status_counts,
            "severity_breakdown": severity_counts,
            "entity_breakdown": entity_counts
        }

