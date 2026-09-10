from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ResponsiblePartyBase(BaseModel):
    name: str
    entity_type: str = "MANUFACTURER"
    brand_name: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ResponsiblePartyCreate(ResponsiblePartyBase):
    pass

class ResponsiblePartyUpdate(BaseModel):
    name: Optional[str] = None
    entity_type: Optional[str] = None
    brand_name: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class ResponsiblePartyResponse(ResponsiblePartyBase):
    id: int
    risk_score: float = 15.0
    total_inspections: int = 0
    total_violations: int = 0
    open_cases: int = 0
    notices_issued: int = 0
    total_penalties: float = 0.0
    status: str = "ACTIVE"
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ResponsiblePartyListResponse(BaseModel):
    items: List[ResponsiblePartyResponse]
    total: int
    page: int = 1
    limit: int = 20
    total_pages: int = 1
