import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    violation_code = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    rule_id = Column(Integer, ForeignKey("rules.id"), nullable=True, index=True)
    field = Column(String, nullable=False)
    expected_value = Column(String, nullable=True)
    observed_value = Column(String, nullable=True)
    severity = Column(String, default="HIGH")
    confidence = Column(Float, default=1.0)
    status = Column(String, default="OPEN")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="violations")
    scan = relationship("Scan", back_populates="violations")
    rule = relationship("Rule", back_populates="violations")
    evidence_items = relationship("Evidence", back_populates="violation", cascade="all, delete-orphan")
    officer_decisions = relationship("OfficerDecision", back_populates="violation", cascade="all, delete-orphan")
