import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_code = Column(String, unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    checker_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String, default="ASSIGNED")
    priority_score = Column(Float, default=50.0)
    scheduled_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    remarks = Column(Text, nullable=True)

    product = relationship("Product", back_populates="inspections")
    checker = relationship("User", back_populates="inspections")


class OfficerDecision(Base):
    __tablename__ = "officer_decisions"

    id = Column(Integer, primary_key=True, index=True)
    violation_id = Column(Integer, ForeignKey("violations.id"), nullable=False, index=True)
    checker_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    decision = Column(String, nullable=False)  # CONFIRMED, REJECTED, MANUAL_REVIEW
    remarks = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=datetime.datetime.utcnow)

    violation = relationship("Violation", back_populates="officer_decisions")
    checker = relationship("User")
