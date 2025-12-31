from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ============ Admin/Authentication Schemas ============

class AdminLogin(BaseModel):
    """Schema for admin login request"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "username": "admin",
                "password": "securepassword123"
            }
        }


class AdminCreate(BaseModel):
    """Schema for creating a new admin"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "username": "newadmin",
                "password": "securepassword456"
            }
        }


class AdminResponse(BaseModel):
    """Schema for admin response"""
    id: int
    username: str
    is_super_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "admin",
                "is_super_admin": True,
                "created_at": "2024-12-17T10:00:00",
                "updated_at": "2024-12-17T10:00:00"
            }
        }


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


# ============ Blog Schemas ============

class BlogCreate(BaseModel):
    """Schema for creating a new blog"""
    title: str = Field(..., min_length=5, max_length=255)
    content: str = Field(..., min_length=10)
    author: str = Field(..., min_length=2, max_length=100)
    status: Optional[str] = "draft"  

class BlogUpdate(BaseModel):
    """Schema for updating a blog"""
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    content: Optional[str] = Field(None, min_length=10)
    author: Optional[str] = Field(None, min_length=2, max_length=100)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Blog Title",
                "content": "Updated content here...",
                "author": "Jane Doe"
            }
        }


class AdminUpdate(BaseModel):
    """Schema for updating an admin"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "username": "updatedadmin",
                "password": "newsecurepassword"
            }
        }


class BlogResponse(BaseModel):
    """Schema for blog response"""
    id: int
    title: str
    content: str
    author: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Introduction to FastAPI",
                "content": "FastAPI is a modern web framework...",
                "author": "John Doe",
                "created_at": "2024-12-17T10:00:00",
                "updated_at": "2024-12-17T10:00:00"
            }
        }


class BlogListResponse(BaseModel):
    """Schema for blog list response"""
    id: int
    title: str
    author: str
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Introduction to FastAPI",
                "author": "John Doe",
                "created_at": "2024-12-17T10:00:00"
            }
        }
