from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from sqlalchemy.orm import Session
from datetime import timedelta
import os
from dotenv import load_dotenv
# Load environment variables early so modules that read them at import time work
load_dotenv()

from database import Base, engine, get_db
from models import Blog, Admin
from auth import (
    authenticate_admin,
    create_access_token,
    get_current_admin,
    get_super_admin,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from schemas import (
    AdminLogin,
    AdminCreate,
    AdminResponse,
    TokenResponse,
    BlogCreate,
    BlogUpdate,
    BlogResponse,
    BlogListResponse
)

load_dotenv()

# Create tables (skip if DB not available)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables on startup: {e}")
    print("Make sure your DATABASE_URL is correct in .env")

app = FastAPI(
    title="Blogs & Admin API",
    description="Secure production-ready Blogs and Admin management system",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
        "defaultModelsExpandDepth": 1,
    }
)

# CORS Configuration
FRONTEND_URLS = os.getenv("FRONTEND_URLS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Admin Authentication Endpoints ============

@app.post("/admin/login", response_model=TokenResponse, tags=["Admin Auth"])
async def admin_login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Admin login endpoint.
    
    - **username**: Admin username
    - **password**: Admin password
    
    Returns JWT access token for authenticated admin.
    """
    admin = authenticate_admin(db, username, password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(admin.id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/admin/create", response_model=AdminResponse, tags=["Admin Management"])
async def create_admin(
    admin_data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new admin account (admin-only endpoint).
    
    Only authenticated admins can create other admins.
    Super-admin can create both regular and super-admin accounts.
    """
    # Check if username already exists
    existing_admin = db.query(Admin).filter(Admin.username == admin_data.username).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new admin
    hashed_password = get_password_hash(admin_data.password)
    new_admin = Admin(
        username=admin_data.username,
        hashed_password=hashed_password,
        is_super_admin=False  # Regular admins are created by default
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin


@app.get("/admin/list", response_model=list[AdminResponse], tags=["Admin Management"])
async def list_admins(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    List all admins (admin-only endpoint).
    
    Only authenticated admins can view the admin list.
    """
    admins = db.query(Admin).all()
    return admins


@app.delete("/admin/{admin_id}", tags=["Admin Management"])
async def delete_admin(
    admin_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete an admin account.
    
    - **Super-admin**: Can delete any admin (except themselves or the permanent admin)
    - **Regular admin**: Cannot delete admins
    - **Note**: The first admin (ID=1) is permanent and cannot be deleted
    """
    admin_to_delete = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Prevent deletion of the first admin (permanent)
    if admin_to_delete.id == 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete the permanent admin account"
        )
    
    # Prevent deletion of the requesting admin
    if current_admin.id == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Only super-admin can delete other admins
    if not current_admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super-admin can delete admins"
        )
    
    # Prevent deletion of super-admin by non-super-admin
    if admin_to_delete.is_super_admin and current_admin.id != admin_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete super-admin"
        )
    
    db.delete(admin_to_delete)
    db.commit()
    
    return {"detail": "Admin deleted successfully"}


# ============ Blog CRUD Endpoints ============

@app.post("/blogs", response_model=BlogResponse, status_code=status.HTTP_201_CREATED, tags=["Blogs"])
async def create_blog(
    blog_data: BlogCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new blog post (admin-only endpoint).
    
    Requires valid JWT token from authenticated admin.
    """
    new_blog = Blog(
        title=blog_data.title,
        content=blog_data.content,
        author=blog_data.author
    )
    
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    
    return new_blog


@app.get("/blogs", response_model=list[BlogListResponse], tags=["Blogs"])
async def list_blogs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """
    Get all published blog posts (public endpoint).
    
    - **skip**: Number of blogs to skip (default: 0)
    - **limit**: Number of blogs to return (default: 10)
    """
    blogs = db.query(Blog).order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()
    return blogs


@app.get("/blogs/{blog_id}", response_model=BlogResponse, tags=["Blogs"])
async def get_blog(
    blog_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific blog post by ID (public endpoint).
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    return blog


@app.put("/blogs/{blog_id}", response_model=BlogResponse, tags=["Blogs"])
async def update_blog(
    blog_id: int,
    blog_data: BlogUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update a blog post (admin-only endpoint).
    
    Only authenticated admins can update blogs.
    Only fields provided will be updated.
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    # Update only provided fields
    update_data = blog_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(blog, field, value)
    
    db.commit()
    db.refresh(blog)
    
    return blog


@app.delete("/blogs/{blog_id}", tags=["Blogs"])
async def delete_blog(
    blog_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a blog post (admin-only endpoint).
    
    Only authenticated admins can delete blogs.
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    db.delete(blog)
    db.commit()
    
    return {"detail": "Blog deleted successfully"}


# ============ Health Check ============

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for deployment monitoring.
    """
    return {"status": "healthy", "service": "Blogs & Admin API"}
