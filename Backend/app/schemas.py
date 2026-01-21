from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# ============ Contact Schema ============
class ContactForm(BaseModel):
    name: str | None = "User"
    email: EmailStr
    subject: str | None = "No Subject"
    message: str | None = None

# ============ Admin Schemas ============
class AdminLogin(BaseModel):
    username: EmailStr  
    password: str

class AdminCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2)
    password: str = Field(..., min_length=8)

class AdminUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class AdminResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_super_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# ============ Blog Schemas ============
class BlogCreate(BaseModel):
    title: str 
    content: str 
    author: str 
    status: Optional[str] = "draft"

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    status: Optional[str] = None

class BlogResponse(BaseModel):
    id: int
    title: str
    content: str
    author: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BlogListResponse(BaseModel):
    id: int
    title: str
    author: str
    created_at: datetime

    class Config:
        from_attributes = True