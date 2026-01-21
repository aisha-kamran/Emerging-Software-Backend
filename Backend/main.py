from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import admin, contact
import uvicorn

# 1. Create Database Tables (Auto-run)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables: {e}")

# 2. App Initialization
app = FastAPI(
    title="Emerging Software Backend",
    description="Unified API for Contact Form and Admin Dashboard",
    version="2.0.0"
)

# 3. CORS Settings (Global)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include Routers
# Admin ke routes ab /api/admin se shuru nahi honge, direct honge jaisa aapne code mein likha tha
# lekin Contact ke liye maine prefix nahi lagaya kyunke wo already '/contact' hai.
app.include_router(admin.router) 
app.include_router(contact.router)

@app.get("/", tags=["Health"])
async def root():
    return {"status": "Backend server is running (Admin + Contact merged)"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)