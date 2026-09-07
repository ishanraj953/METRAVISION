from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime

class RiskResponse(BaseModel):
    id: int
    product_id: int
    scan_id: Optional[int] = None
    risk_score: float
    risk_level: str
    inspection_priority: int
    repeat_offender: bool
    factors: Optional[Any] = None
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)
