from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Blog, Admin
from app.auth import (
    authenticate_admin,
    create_access_token,
    get_current_admin,
    get_password_hash
)
from app.schemas import (
    AdminCreate, AdminResponse, AdminUpdate, TokenResponse,
    BlogCreate, BlogUpdate, BlogResponse, BlogListResponse
)

# Router Setup
router = APIRouter()

# ============ Admin Auth ============
@router.post("/admin/login", response_model=TokenResponse, tags=["Admin Auth"])
async def admin_login(
    username: str = Form(...), 
    password: str = Form(...),
    db: Session = Depends(get_db)
):
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
@router.post("/admin/create", response_model=AdminResponse, tags=["Admin Management"])
async def create_admin(
    admin_data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
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

@router.get("/admin/list", response_model=list[AdminResponse], tags=["Admin Management"])
async def list_admins(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Admin).all()

@router.put("/admin/{admin_id}", response_model=AdminResponse, tags=["Admin Management"])
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

@router.delete("/admin/{admin_id}", tags=["Admin Management"])
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
@router.post("/blogs", response_model=BlogResponse, status_code=201, tags=["Blogs"])
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

@router.get("/blogs", response_model=list[BlogListResponse], tags=["Blogs"])
async def list_blogs(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Blog).order_by(Blog.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/blogs/summary", tags=["Blogs"])
async def blogs_summary(db: Session = Depends(get_db)):
    total = db.query(Blog).count()
    drafts = db.query(Blog).filter(Blog.status == "draft").count()
    published = db.query(Blog).filter(Blog.status == "published").count()
    return {"total": total, "drafts": drafts, "published": published}

@router.get("/blogs/{blog_id}", response_model=BlogResponse, tags=["Blogs"])
async def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.put("/blogs/{blog_id}", response_model=BlogResponse, tags=["Blogs"])
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

@router.delete("/blogs/{blog_id}", tags=["Blogs"])
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