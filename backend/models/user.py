import enum
import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from database.base import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SHOPKEEPER = "SHOPKEEPER"
    CHECKER = "CHECKER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.SHOPKEEPER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="shopkeeper")
    inspections = relationship("Inspection", back_populates="checker")
    audit_logs = relationship("AuditLog", back_populates="user")
