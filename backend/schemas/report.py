from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class ReportCreate(BaseModel):
    report_type: str  # CHECKER, SHOPKEEPER, ADMIN
    format: str = "JSON"  # JSON, PDF
    product_id: Optional[int] = None
    inspection_id: Optional[int] = None

class ReportResponse(BaseModel):
    id: int
    report_type: str
    generated_by: int
    file_path: Optional[str] = None
    format: str
    data: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
