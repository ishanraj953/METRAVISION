import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Declaration(Base):
    __tablename__ = "declarations"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    field_name = Column(String, nullable=False, index=True)
    detected_value = Column(String, nullable=True)
    expected_value = Column(String, nullable=True)
    confidence = Column(Float, default=1.0)
    bbox = Column(String, nullable=True)
    is_present = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("Scan", back_populates="declarations")
    product = relationship("Product", back_populates="declarations")
