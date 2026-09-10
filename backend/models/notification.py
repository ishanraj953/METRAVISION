import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Notification(Base):
    __tablename__ = "officer_notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="ALERT")  # ALERT, NOTICE_DUE, REPEAT_OFFENDER, CASE_CREATED, PENALTY
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)
    responsible_party_id = Column(Integer, ForeignKey("responsible_parties.id"), nullable=True, index=True)
    action_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("Case", back_populates="notifications")
    responsible_party = relationship("ResponsibleParty")
