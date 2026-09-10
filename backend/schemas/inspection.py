from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from schemas.product import ProductResponse

class InspectionCreate(BaseModel):
    product_id: int
    checker_id: Optional[int] = None
    priority_score: Optional[float] = 50.0
    remarks: Optional[str] = None

class InspectionStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class InspectionResponse(BaseModel):
    id: int
    inspection_code: str
    product_id: int
    checker_id: Optional[int] = None
    status: str
    priority_score: float
    scheduled_at: datetime
    completed_at: Optional[datetime] = None
    remarks: Optional[str] = None
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)
