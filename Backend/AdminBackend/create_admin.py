"""
Script to create the first admin user in the database.
This admin cannot be deleted and is permanent.
"""
import os
from dotenv import load_dotenv
from database import SessionLocal, Base, engine
from models import Admin
from auth import get_password_hash

load_dotenv()

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Check if admin with ID 1 already exists
    existing_admin = db.query(Admin).filter(Admin.id == 1).first()
    
    if existing_admin:
        print(f"✓ First admin already exists: {existing_admin.username}")
    else:
        # Create first admin (permanent, cannot be deleted)
        first_admin = Admin(
            id=1,  # Fixed ID for the permanent admin
            username="admin",
            hashed_password=get_password_hash("admin123"),
            is_super_admin=True
        )
        
        db.add(first_admin)
        db.commit()
        db.refresh(first_admin)
        
        print("✓ First admin created successfully!")
        print(f"  Username: admin")
        print(f"  Password: admin123")
        print(f"  Status: Super Admin (PERMANENT - Cannot be deleted)")
        
finally:
    db.close()
