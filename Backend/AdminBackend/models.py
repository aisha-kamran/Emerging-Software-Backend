from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from datetime import datetime
from database import Base


class Admin(Base):
    """Admin user model for authentication and authorization"""
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_super_admin = Column(Boolean, default=False)  # Only one super-admin
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

class Blog(Base):
    """Blog post model"""
    __tablename__ = "blogs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    
    # 👇 NEW FIELDS
    status = Column(String(50), default="draft", nullable=False)  # draft / published
    is_published = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
