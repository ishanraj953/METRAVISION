from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from schemas.evidence import EvidenceResponse

class OfficerDecisionItem(BaseModel):
    id: int
    checker_id: int
    officer_name: Optional[str] = "Inspector Vikram Singh"
    officer_badge: Optional[str] = "CHK-109"
    decision: str
    remarks: Optional[str] = None
    decided_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ViolationResponse(BaseModel):
    id: int
    violation_code: str
    product_id: int
    scan_id: int
    rule_id: Optional[int] = None
    field: str
    expected_value: Optional[str] = None
    observed_value: Optional[str] = None
    severity: str
    confidence: float
    status: str
    created_at: datetime
    product_name: Optional[str] = "Sana Coconut Chips (140g)"
    product_brand: Optional[str] = "Sana Premium"
    product_category: Optional[str] = "Packaged Food"
    inspector_name: Optional[str] = "Inspector Vikram Singh"
    inspector_badge: Optional[str] = "CHK-109"
    jurisdiction: Optional[str] = "Shop #14, Sector 9, Guntur, AP"
    establishment: Optional[str] = "Gupta Kirana & Daily Needs"
    rule_citation: Optional[str] = "PCR 2011 Rule 6(1)"
    penalty_estimate: Optional[str] = "Rs. 25,000 (Section 36(1))"
    evidence_items: List[EvidenceResponse] = []
    officer_decisions: List[OfficerDecisionItem] = []

    model_config = ConfigDict(from_attributes=True)

class DecisionRequest(BaseModel):
    decision: str  # CONFIRMED, REJECTED, MANUAL_REVIEW
    remarks: Optional[str] = None

class DecisionResponse(BaseModel):
    id: int
    violation_id: int
    checker_id: int
    decision: str
    remarks: Optional[str] = None
    decided_at: datetime

    model_config = ConfigDict(from_attributes=True)
