import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_code = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False, index=True)
    field_name = Column(String, nullable=False, index=True)
    rule_description = Column(Text, nullable=False)
    parameters = Column(Text, nullable=True)
    severity = Column(String, default="HIGH")
    is_active = Column(Boolean, default=True)
    version_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    versions = relationship("RuleVersion", back_populates="rule", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="rule")


class RuleVersion(Base):
    __tablename__ = "rule_versions"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("rules.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    changes_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    rule = relationship("Rule", back_populates="versions")


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    overall_status = Column(String, default="COMPLIANT")
    passed_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)
    violation_count = Column(Integer, default=0)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("Scan", back_populates="compliance_checks")
