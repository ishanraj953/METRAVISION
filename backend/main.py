import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from database.connection import engine
from database.base import Base

# Import all models to register with Base
import models

# Include API routers
from api import (
    auth_router,
    users_router,
    products_router,
    scans_router,
    compliance_router,
    violations_router,
    inspections_router,
    risk_router,
    listings_router,
    reports_router,
    admin_router
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="METRA-X Central Orchestrator Backend API — Legal Metrology Compliance System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Frontend Compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for storage images and generated reports
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
app.mount("/storage", StaticFiles(directory=settings.STORAGE_DIR), name="storage")

# Include Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(scans_router)
app.include_router(compliance_router)
app.include_router(violations_router)
app.include_router(inspections_router)
app.include_router(risk_router)
app.include_router(listings_router)
app.include_router(reports_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to METRA-X Backend Service",
        "docs": "/docs",
        "status": "ONLINE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
