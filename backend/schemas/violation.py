from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from schemas.evidence import EvidenceResponse

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
    evidence_items: List[EvidenceResponse] = []

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
