from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re


# ── Request models ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(r"^\+?[0-9]{10,15}$", v):
            raise ValueError("Invalid phone number format")
        return v

    def model_post_init(self, __context):
        if not self.email and not self.phone:
            raise ValueError("Either email or phone is required")


class LoginRequest(BaseModel):
    identifier: str   # email or phone
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ContactRequest(BaseModel):
    name: str
    phone: str
    relation: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        v = v.strip()
        if not re.match(r"^\+?[0-9]{10,15}$", v):
            raise ValueError("Invalid phone number")
        return v


# ── Response models ──────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class ContactOut(BaseModel):
    id: int
    name: str
    phone: str
    relation: str

