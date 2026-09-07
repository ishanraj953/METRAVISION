import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_code = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String, default="COMPLIANT")
    raw_ai_response = Column(Text, nullable=True)
    scanned_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="scans")
    images = relationship("ProductImage", back_populates="scan")
    declarations = relationship("Declaration", back_populates="scan", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="scan", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="scan", cascade="all, delete-orphan")
    compliance_checks = relationship("ComplianceCheck", back_populates="scan", cascade="all, delete-orphan")
