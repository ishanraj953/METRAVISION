from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class EvidenceResponse(BaseModel):
    id: int
    violation_id: int
    image_id: Optional[int] = None
    bbox: Optional[str] = None
    detected_text: Optional[str] = None
    ocr_confidence: float
    annotated_image: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
