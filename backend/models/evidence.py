import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    violation_id = Column(Integer, ForeignKey("violations.id"), nullable=False, index=True)
    image_id = Column(Integer, ForeignKey("product_images.id"), nullable=True, index=True)
    bbox = Column(String, nullable=True)
    detected_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, default=1.0)
    annotated_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    violation = relationship("Violation", back_populates="evidence_items")
