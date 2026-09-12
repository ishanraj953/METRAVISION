import os
from fastapi import FastAPI, APIRouter
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
    admin_router,
    stats_router,
    cases_router,
    responsible_parties_router,
    notifications_router,
    intelligence_router
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="METRAVISION Central Legal Metrology Compliance & Enforcement Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Catch-all exception handling middleware to ensure errors return valid JSON
@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "status": "ERROR"}
        )

# Registered last so it executes FIRST on incoming requests and LAST on outgoing responses
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://metravision-mu.vercel.app",
        "https://metravision.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Static file serving for storage images and generated reports
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
app.mount("/storage", StaticFiles(directory=settings.STORAGE_DIR), name="storage")

# Register Routers at Root Level (e.g. /cases, /notifications, /auth)
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
app.include_router(stats_router)
app.include_router(cases_router)
app.include_router(responsible_parties_router)
app.include_router(notifications_router)
app.include_router(intelligence_router)

# Register Routers under /api/v1 Prefix as well (e.g. /api/v1/cases, /api/v1/auth)
api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(scans_router)
api_v1_router.include_router(compliance_router)
api_v1_router.include_router(violations_router)
api_v1_router.include_router(inspections_router)
api_v1_router.include_router(risk_router)
api_v1_router.include_router(listings_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(stats_router)
api_v1_router.include_router(cases_router)
api_v1_router.include_router(responsible_parties_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(intelligence_router)

app.include_router(api_v1_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to METRAVISION Legal Metrology Compliance Platform",
        "docs": "/docs",
        "status": "ONLINE",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
