from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import Blog, User
from auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from datetime import timedelta

Base.metadata.create_all(bind=engine)
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create first admin user manually
@app.post("/create-admin")
def create_admin(db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username=="admin").first()
    if existing:
        return {"msg":"Admin already exists"}
    hashed = get_password_hash("admin123")
    admin = User(username="admin", hashed_password=hashed, is_admin=True)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return {"msg":"Admin created"}

# Admin login
@app.post("/admin/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Create blog
@app.post("/admin/blogs")
def create_blog(blog: Blog, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog

# Read blogs (public)
@app.get("/blogs")
def get_blogs(db: Session = Depends(get_db)):
    return db.query(Blog).all()

# Update blog
@app.put("/admin/blogs/{blog_id}")
def update_blog(blog_id: int, updated_blog: Blog, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    blog.title = updated_blog.title
    blog.content = updated_blog.content
    db.commit()
    db.refresh(blog)
    return blog

# Delete blog
@app.delete("/admin/blogs/{blog_id}")
def delete_blog(blog_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return {"detail": "Blog deleted"}
