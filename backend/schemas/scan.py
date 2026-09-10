from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScanCreate(BaseModel):
    product_id: Optional[int] = None
    barcode: Optional[str] = None
    notes: Optional[str] = None

class ScanOrchestrationResponse(BaseModel):
    scan_id: str
    numeric_scan_id: int
    product_id: int
    product_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    product: Optional[Dict[str, Any]] = None
    status: str
    quality: Optional[Dict[str, Any]] = None
    declarations: Dict[str, Any]
    violations: List[Dict[str, Any]]
    risk: Dict[str, Any]
    evidence: List[Dict[str, Any]]
    compliance: Dict[str, Any]
    images: Optional[Dict[str, Any]] = None
    facets: Optional[List[Dict[str, Any]]] = []
    raw_ocr_text: Optional[str] = ""
    ocr_regions: Optional[List[Dict[str, Any]]] = []
    scanned_at: str

class ScanSummaryResponse(BaseModel):
    id: int
    scan_code: str
    product_id: int
    user_id: int
    status: str
    scanned_at: datetime

    model_config = ConfigDict(from_attributes=True)

ScanResponse = ScanOrchestrationResponse
