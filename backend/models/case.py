import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    violation_id = Column(Integer, ForeignKey("violations.id"), nullable=True, index=True)
    responsible_party_id = Column(Integer, ForeignKey("responsible_parties.id"), nullable=True, index=True)
    
    entity_type = Column(String, default="MANUFACTURER")
    applicable_rule = Column(String, nullable=True)
    applicable_act_section = Column(String, nullable=True)
    severity = Column(String, default="HIGH")
    status = Column(String, default="UNDER_REVIEW", index=True)
    
    potential_penalty_min = Column(Float, default=10000.0)
    potential_penalty_max = Column(Float, default=25000.0)
    imposed_penalty = Column(Float, nullable=True)
    
    notice_number = Column(String, nullable=True)
    notice_issued_at = Column(DateTime, nullable=True)
    notice_deadline = Column(DateTime, nullable=True)
    
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    officer_name = Column(String, default="Inspector Vikram Singh")
    officer_badge = Column(String, default="CHK-109")
    officer_remarks = Column(Text, nullable=True)
    
    pdf_report_path = Column(String, nullable=True)
    email_status = Column(String, default="PENDING")
    email_sent_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    product = relationship("Product")
    violation = relationship("Violation")
    inspection = relationship("Inspection")
    responsible_party = relationship("ResponsibleParty", back_populates="cases")
    officer = relationship("User")
    notifications = relationship("Notification", back_populates="case", cascade="all, delete-orphan")
