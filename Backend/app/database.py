import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. .env file ko load karein
load_dotenv()

# 2. URL wahan se uthayein
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# --- ERROR CHECKING ---
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("❌ ERROR: .env file mein 'DATABASE_URL' nahi mila!")

# 3. Supabase Fix: Agar URL 'postgres://' se shuru ho raha hai to usay 'postgresql://' karein
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 4. Engine Create Karein
# 'pool_pre_ping=True' connection ko stable rakhta hai
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

# 5. Session Local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6. Base Model
Base = declarative_base()

# 7. DB Connection Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()