from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
from models.user import UserRole

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole = UserRole.SHOPKEEPER

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
