import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from database.base import Base

class ViolationRule(Base):
    __tablename__ = "violation_rules"

    id = Column(Integer, primary_key=True, index=True)
    violation_code = Column(String, unique=True, index=True, nullable=False)
    violation_name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    applicable_rule = Column(String, nullable=False)
    applicable_act_section = Column(String, nullable=False)
    responsible_entity_types = Column(Text, nullable=False, default='["MANUFACTURER","PACKER","IMPORTER"]')
    penalty_type = Column(String, default="COMPOUNDING_FINE")
    minimum_penalty = Column(Float, default=10000.0)
    maximum_penalty = Column(Float, default=25000.0)
    second_offense_penalty = Column(Float, default=50000.0)
    subsequent_penalty = Column(Float, default=100000.0)
    imprisonment_possible = Column(Boolean, default=False)
    imprisonment_max_months = Column(Integer, default=0)
    officer_confirmation_required = Column(Boolean, default=True)
    active = Column(Boolean, default=True)
    effective_from = Column(DateTime, default=datetime.datetime.utcnow)
    effective_to = Column(DateTime, nullable=True)
