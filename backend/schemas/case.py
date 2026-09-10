from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class CaseBase(BaseModel):
    product_id: Optional[int] = None
    inspection_id: Optional[int] = None
    violation_id: Optional[int] = None
    responsible_party_id: Optional[int] = None
    entity_type: str = "MANUFACTURER"
    applicable_rule: Optional[str] = None
    applicable_act_section: Optional[str] = None
    severity: str = "HIGH"
    status: str = "UNDER_REVIEW"

class CaseCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: Optional[str] = "Pre-Packaged Commodity"
    product_brand: Optional[str] = "N/A"
    product_category: Optional[str] = "Packaged Goods"
    barcode: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    violations: Optional[List[Dict[str, Any]]] = None

    responsible_party_id: Optional[int] = None
    entity_name: Optional[str] = None
    entity_type: str = "MANUFACTURER"
    applicable_rule: Optional[str] = "PCR 2011 Rule 6(1)"
    applicable_act_section: Optional[str] = "Section 36(1) LM Act, 2009"
    severity: str = "HIGH"
    status: str = "UNDER_REVIEW"

    potential_penalty_min: Optional[float] = 10000.0
    potential_penalty_max: Optional[float] = 25000.0
    imposed_penalty: Optional[float] = None
    
    notice_type: Optional[str] = "SHOW_CAUSE_NOTICE"
    notice_deadline_days: Optional[int] = 15
    recipient_email: Optional[str] = None
    send_email: bool = True
    officer_remarks: Optional[str] = None

class CaseConfirmResponsibilityRequest(BaseModel):
    responsible_party_id: Optional[int] = None
    entity_name: Optional[str] = None
    entity_type: str
    statutory_section: Optional[str] = None
    remarks: Optional[str] = None

class CaseIssueNoticeRequest(BaseModel):
    deadline_days: int = 15
    notice_type: str = "SHOW_CAUSE_NOTICE"
    notice_remarks: Optional[str] = None
    recipient_email: Optional[str] = None
    send_email: bool = True

class CaseImposePenaltyRequest(BaseModel):
    penalty_amount: float
    statutory_section: Optional[str] = None
    penalty_remarks: Optional[str] = None
    send_email: bool = True

class CaseCloseRequest(BaseModel):
    resolution_type: str = "COMPOUNDED"  # COMPOUNDED, COMPLIANCE_RECTIFIED, DISMISSED, PROSECUTION_FILED
    amount_collected: float = 0.0
    closing_remarks: Optional[str] = None

class CaseResponse(BaseModel):
    id: int
    case_number: str
    product_id: Optional[int] = None
    inspection_id: Optional[int] = None
    violation_id: Optional[int] = None
    responsible_party_id: Optional[int] = None
    entity_type: str = "MANUFACTURER"
    applicable_rule: Optional[str] = None
    applicable_act_section: Optional[str] = None
    severity: str = "HIGH"
    status: str = "UNDER_REVIEW"
    potential_penalty_min: float = 10000.0
    potential_penalty_max: float = 25000.0
    imposed_penalty: Optional[float] = None
    notice_number: Optional[str] = None
    notice_issued_at: Optional[datetime] = None
    notice_deadline: Optional[datetime] = None
    officer_id: Optional[int] = None
    officer_name: Optional[str] = "Inspector Vikram Singh"
    officer_badge: Optional[str] = "CHK-109"
    officer_remarks: Optional[str] = None
    pdf_report_path: Optional[str] = None
    pdf_download_url: Optional[str] = None
    email_status: str = "PENDING"
    email_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    product_name: Optional[str] = None
    product_brand: Optional[str] = None
    product_category: Optional[str] = None
    responsible_party_name: Optional[str] = None
    violations_summary: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)

class CaseListResponse(BaseModel):
    items: List[CaseResponse]
    total: int
    page: int = 1
    limit: int = 20
    total_pages: int = 1

class DashboardKPIResponse(BaseModel):
    total_cases: int
    active_cases: int
    notices_pending: int
    penalties_imposed_inr: float
    penalties_collected_inr: float
    repeat_offenders_count: int
    status_breakdown: Dict[str, int]
    severity_breakdown: Dict[str, int]
    entity_breakdown: Dict[str, int]
