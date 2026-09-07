import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=True, index=True)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="LOW")
    inspection_priority = Column(Integer, default=3)
    repeat_offender = Column(Boolean, default=False)
    factors = Column(Text, nullable=True)  # JSON formatted factors
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="risk_scores")
    scan = relationship("Scan", back_populates="risk_scores")
