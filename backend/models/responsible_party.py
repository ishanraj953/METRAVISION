import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
import enum
from database.base import Base

class EntityType(str, enum.Enum):
    MANUFACTURER = "MANUFACTURER"
    PACKER = "PACKER"
    IMPORTER = "IMPORTER"
    BRAND_OWNER = "BRAND_OWNER"
    SELLER_DEALER = "SELLER_DEALER"
    ECOMMERCE_ENTITY = "ECOMMERCE_ENTITY"

class ResponsibleParty(Base):
    __tablename__ = "responsible_parties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    entity_type = Column(String, default="MANUFACTURER", index=True)
    brand_name = Column(String, nullable=True)
    registration_number = Column(String, nullable=True, index=True)
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True, index=True)
    pincode = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=True)
    
    risk_score = Column(Float, default=15.0)
    total_inspections = Column(Integer, default=0)
    total_violations = Column(Integer, default=0)
    open_cases = Column(Integer, default=0)
    notices_issued = Column(Integer, default=0)
    total_penalties = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    cases = relationship("Case", back_populates="responsible_party", cascade="all, delete-orphan")
