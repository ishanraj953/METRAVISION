from api.auth import router as auth_router
from api.users import router as users_router
from api.products import router as products_router
from api.scans import router as scans_router
from api.compliance import router as compliance_router
from api.violations import router as violations_router
from api.inspections import router as inspections_router
from api.risk import router as risk_router
from api.listings import router as listings_router
from api.reports import router as reports_router
from api.admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router",
    "products_router",
    "scans_router",
    "compliance_router",
    "violations_router",
    "inspections_router",
    "risk_router",
    "listings_router",
    "reports_router",
    "admin_router"
]
