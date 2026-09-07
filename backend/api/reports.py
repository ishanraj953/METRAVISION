import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from models.listing import Report
from schemas.report import ReportCreate, ReportResponse
from services.report_service import report_service
from auth.dependencies import get_current_user
from utils.audit_logger import log_audit

router = APIRouter(prefix="/reports", tags=["Reports"])

def format_report_response(rep: Report) -> dict:
    parsed_data = None
    if rep.data:
        try:
            parsed_data = json.loads(rep.data) if isinstance(rep.data, str) else rep.data
        except Exception:
            parsed_data = {}
    return {
        "id": rep.id,
        "report_type": rep.report_type,
        "generated_by": rep.generated_by,
        "file_path": rep.file_path,
        "format": rep.format,
        "data": parsed_data,
        "created_at": rep.created_at
    }

@router.post("/", response_model=ReportResponse)
def generate_report(
    rep_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report_db = report_service.generate_report(
        db=db,
        report_type=rep_in.report_type,
        user=current_user,
        product_id=rep_in.product_id,
        report_format=rep_in.format
    )

    log_audit(
        db=db,
        action="GENERATE_REPORT",
        entity="Report",
        entity_id=str(report_db.id),
        user=current_user,
        metadata={"type": rep_in.report_type, "format": rep_in.format}
    )

    return format_report_response(report_db)

@router.get("/{report_id}", response_model=ReportResponse)
def get_report_metadata(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return format_report_response(rep)

@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep or not rep.file_path or not os.path.exists(rep.file_path):
        raise HTTPException(status_code=404, detail="Report file not found")

    filename = os.path.basename(rep.file_path)
    media_type = "application/pdf" if rep.format == "PDF" else "application/json"
    
    return FileResponse(
        path=rep.file_path,
        filename=filename,
        media_type=media_type
    )
