from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

from database import Base, engine, get_db
from models import Blog, Admin
from auth import (
    authenticate_admin,
    create_access_token,
    get_current_admin,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from schemas import (
    AdminCreate,
    AdminResponse,
    AdminUpdate,
    TokenResponse,
    BlogCreate,
    BlogUpdate,
    BlogResponse,
    BlogListResponse
)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables: {e}")

app = FastAPI(
    title="Blogs & Admin API",
    description="Secure production-ready Blogs and Admin management system",
    version="1.0.0"
)

# CORS - Allow All for Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Admin Auth ============

@app.post("/admin/login", response_model=TokenResponse, tags=["Admin Auth"])
async def admin_login(
    username: str = Form(...), # OAuth2 expects 'username' field (we pass email here)
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    print(f"====================================")
    print(f"🧐 LOGIN ATTEMPT FROM FRONTEND:")
    print(f"   Email Received: '{username}'")
    print(f"   Password Received: '{password}'")
    print(f"====================================")

    # Authenticate using Email
    admin = authenticate_admin(db, username, password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(admin.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# ============ Admin Management ============

@app.post("/admin/create", response_model=AdminResponse, tags=["Admin Management"])
async def create_admin(
    admin_data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Check if email exists
    existing = db.query(Admin).filter(Admin.email == admin_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_admin = Admin(
        email=admin_data.email,
        full_name=admin_data.full_name,
        hashed_password=get_password_hash(admin_data.password),
        is_super_admin=False
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
    # Return all admins
    admins = db.query(Admin).all()
    return admins

@app.put("/admin/{admin_id}", response_model=AdminResponse, tags=["Admin Management"])
async def update_admin(
    admin_id: int,
    admin_data: AdminUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if current_admin.id != admin_id and not current_admin.is_super_admin:
        raise HTTPException(status_code=403, detail="Not permitted")

    if admin_data.email and admin_data.email != admin.email:
        existing = db.query(Admin).filter(Admin.email == admin_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        admin.email = admin_data.email

    if admin_data.full_name:
        admin.full_name = admin_data.full_name

    if admin_data.password:
        admin.hashed_password = get_password_hash(admin_data.password)

    db.commit()
    db.refresh(admin)
    return admin

@app.delete("/admin/{admin_id}", tags=["Admin Management"])
async def delete_admin(
    admin_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    admin_to_delete = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin_to_delete:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if admin_to_delete.id == 1:
        raise HTTPException(status_code=403, detail="Cannot delete super admin")
    
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    db.delete(admin_to_delete)
    db.commit()
    return {"detail": "Deleted successfully"}

# ============ Blogs ============

@app.post("/blogs", response_model=BlogResponse, status_code=201, tags=["Blogs"])
async def create_blog(
    blog_data: BlogCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    new_blog = Blog(
        title=blog_data.title,
        content=blog_data.content,
        author=blog_data.author,
        status=blog_data.status
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog

@app.get("/blogs", response_model=list[BlogListResponse], tags=["Blogs"])
async def list_blogs(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return db.query(Blog).order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()

@app.get("/blogs/summary", tags=["Blogs"])
async def blogs_summary(db: Session = Depends(get_db)):
    total = db.query(Blog).count()
    drafts = db.query(Blog).filter(Blog.status == "draft").count()
    published = db.query(Blog).filter(Blog.status == "published").count()
    return {"total": total, "drafts": drafts, "published": published}

@app.get("/blogs/{blog_id}", response_model=BlogResponse, tags=["Blogs"])
async def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@app.put("/blogs/{blog_id}", response_model=BlogResponse, tags=["Blogs"])
async def update_blog(
    blog_id: int,
    blog_data: BlogUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    update_data = blog_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(blog, key, value)
    
    db.commit()
    db.refresh(blog)
    return blog

@app.delete("/blogs/{blog_id}", tags=["Blogs"])
async def delete_blog(
    blog_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return {"detail": "Deleted successfully"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}