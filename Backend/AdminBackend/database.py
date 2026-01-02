import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# PostgreSQL connection parameters (defaults provided)
# These can be overridden by setting DATABASE_URL in the environment.
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "postgres")
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DB = os.getenv("PG_DB", "emerging_db")

# Preferred: set a single DATABASE_URL env var. Fallback to constructed URL.
# Use the psycopg2 dialect for SQLAlchemy.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DB}"
)

# Create synchronous SQLAlchemy engine for PostgreSQL
# Pool settings tuned for typical web apps; adjust as needed.
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False,
    future=False,
)

# Session factory and declarative base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a SQLAlchemy Session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined on SQLAlchemy `Base`.

    Note: Import your models (so they are registered on `Base`) before calling
    this function. The application `main.py` already calls
    `Base.metadata.create_all(bind=engine)` on startup; this helper is provided
    for convenience and for scripts that may need to ensure tables exist.
    """
    Base.metadata.create_all(bind=engine)


__all__ = ["engine", "SessionLocal", "Base", "get_db", "create_tables", "DATABASE_URL"]
