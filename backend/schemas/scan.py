from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScanOrchestrationResponse(BaseModel):
    scan_id: str
    numeric_scan_id: int
    product_id: int
    status: str
    declarations: Dict[str, Any]
    violations: List[Dict[str, Any]]
    risk: Dict[str, Any]
    evidence: List[Dict[str, Any]]
    compliance: Dict[str, Any]
    scanned_at: str

class ScanSummaryResponse(BaseModel):
    id: int
    scan_code: str
    product_id: int
    user_id: int
    status: str
    scanned_at: datetime

    model_config = ConfigDict(from_attributes=True)
