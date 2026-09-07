from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DeclarationResponse(BaseModel):
    id: int
    scan_id: int
    product_id: int
    field_name: str
    detected_value: Optional[str] = None
    expected_value: Optional[str] = None
    confidence: float
    bbox: Optional[str] = None
    is_present: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
