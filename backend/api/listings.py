import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database.connection import get_db
from models.user import User
from models.product import Product
from models.scan import Scan
from models.violation import Violation
from models.evidence import Evidence
from models.risk import RiskScore
from models.listing import OnlineListing, ProductVersion
from models.inspection import Inspection
from schemas.listing import OnlineListingCreate, OnlineListingResponse, CrossChannelComparisonResponse
from services.drift_service import drift_service
from auth.dependencies import get_current_user, validate_product_ownership
from utils.audit_logger import log_audit

router = APIRouter(tags=["Listings, Digital Twin & History"])

# --- PHASE 11: DIGITAL TWIN ---
@router.get("/products/{product_id}/digital-twin")
def get_digital_twin(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    
    latest_scan = db.query(Scan).filter(Scan.product_id == product.id).order_by(Scan.id.desc()).first()
    violations = db.query(Violation).filter(Violation.product_id == product.id).all()
    risk = db.query(RiskScore).filter(RiskScore.product_id == product.id).order_by(RiskScore.id.desc()).first()
    versions = db.query(ProductVersion).filter(ProductVersion.product_id == product.id).all()
    listings = db.query(OnlineListing).filter(OnlineListing.product_id == product.id).all()
    inspections = db.query(Inspection).filter(Inspection.product_id == product.id).all()
    drift = drift_service.detect_drift(db=db, product_id=product.id)

    declarations = {}
    if latest_scan and latest_scan.raw_ai_response:
        try:
            parsed = json.loads(latest_scan.raw_ai_response)
            declarations = parsed.get("declarations", {})
        except Exception:
            pass

    return {
        "identity": {
            "id": product.id,
            "name": product.name,
            "brand": product.brand,
            "category": product.category,
            "created_at": product.created_at.isoformat()
        },
        "manufacturer": {
            "name": product.manufacturer_name,
            "importer": product.importer_name,
            "country_of_origin": product.country_of_origin,
            "consumer_care": product.consumer_care
        },
        "declarations": {
            "mrp": product.mrp,
            "net_quantity": product.net_quantity,
            "extracted": declarations
        },
        "latest_scan": {
            "scan_id": latest_scan.scan_code if latest_scan else None,
            "status": latest_scan.status if latest_scan else "UNSCANNED",
            "scanned_at": latest_scan.scanned_at.isoformat() if latest_scan else None
        },
        "compliance_status": product.status,
        "risk": {
            "score": risk.risk_score if risk else 0.0,
            "level": risk.risk_level if risk else "LOW",
            "repeat_offender": risk.repeat_offender if risk else False
        },
        "violations": [
            {
                "id": v.id,
                "field": v.field,
                "expected": v.expected_value,
                "observed": v.observed_value,
                "severity": v.severity,
                "status": v.status
            } for v in violations
        ],
        "history": {
            "total_scans": db.query(Scan).filter(Scan.product_id == product.id).count(),
            "versions_count": len(versions)
        },
        "online_comparison": {
            "listings_count": len(listings)
        },
        "compliance_drift": drift,
        "inspection_history": [
            {
                "id": i.id,
                "code": i.inspection_code,
                "status": i.status,
                "priority_score": i.priority_score
            } for i in inspections
        ]
    }


# --- PHASE 13: HISTORY / VERSION / DRIFT ---
@router.get("/products/{product_id}/history")
def get_product_history(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    scans = db.query(Scan).filter(Scan.product_id == product.id).all()
    versions = db.query(ProductVersion).filter(ProductVersion.product_id == product.id).all()
    
    return {
        "product_id": product.id,
        "scans": [
            {
                "id": s.id,
                "code": s.scan_code,
                "status": s.status,
                "scanned_at": s.scanned_at.isoformat()
            } for s in scans
        ],
        "versions": [
            {
                "version_number": v.version_number,
                "mrp": v.mrp,
                "net_quantity": v.net_quantity,
                "manufacturer": v.manufacturer_name,
                "created_at": v.created_at.isoformat()
            } for v in versions
        ]
    }

@router.get("/products/{product_id}/versions")
def get_product_versions(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    return db.query(ProductVersion).filter(ProductVersion.product_id == product.id).order_by(ProductVersion.version_number.asc()).all()

@router.get("/products/{product_id}/drift")
def get_product_drift(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    return drift_service.detect_drift(db=db, product_id=product.id)


# --- PHASE 14: CROSS-CHANNEL COMPLIANCE ---
@router.post("/listings", response_model=OnlineListingResponse)
def create_online_listing(
    list_in: OnlineListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=list_in.product_id, current_user=current_user, db=db)
    
    listing = OnlineListing(
        product_id=product.id,
        platform_name=list_in.platform_name,
        listing_url=list_in.listing_url,
        product_name=list_in.product_name,
        mrp=list_in.mrp,
        net_quantity=list_in.net_quantity,
        manufacturer_name=list_in.manufacturer_name,
        importer_name=list_in.importer_name,
        country_of_origin=list_in.country_of_origin,
        consumer_care=list_in.consumer_care,
        unit_sale_price=list_in.unit_sale_price
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    log_audit(db, action="CREATE_ONLINE_LISTING", entity="OnlineListing", entity_id=str(listing.id), user=current_user)

    return listing

@router.get("/products/{product_id}/listing", response_model=List[OnlineListingResponse])
def get_product_listings(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    return db.query(OnlineListing).filter(OnlineListing.product_id == product.id).all()

@router.post("/products/{product_id}/compare-online", response_model=CrossChannelComparisonResponse)
def compare_online_listing(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    listing = db.query(OnlineListing).filter(OnlineListing.product_id == product.id).order_by(OnlineListing.id.desc()).first()
    
    if not listing:
        raise HTTPException(status_code=404, detail="No online listing found for product comparison")

    mismatches = []
    comparison_fields = [
        ("mrp", "MRP"),
        ("net_quantity", "Net Quantity"),
        ("manufacturer_name", "Manufacturer"),
        ("country_of_origin", "Country of Origin"),
        ("importer_name", "Importer"),
        ("consumer_care", "Consumer Care")
    ]

    for field_key, field_name in comparison_fields:
        phys_val = getattr(product, field_key, None)
        onl_val = getattr(listing, field_key, None)

        if phys_val and onl_val and str(phys_val).strip() != str(onl_val).strip():
            mismatches.append({
                "field": field_key,
                "field_name": field_name,
                "physical": str(phys_val),
                "online": str(onl_val),
                "severity": "HIGH" if field_key in ["mrp", "net_quantity"] else "MEDIUM"
            })

    match_status = len(mismatches) == 0

    log_audit(
        db=db,
        action="CROSS_CHANNEL_COMPARISON",
        entity="Product",
        entity_id=str(product.id),
        user=current_user,
        metadata={"match": match_status, "mismatches_count": len(mismatches)}
    )

    return CrossChannelComparisonResponse(
        match=match_status,
        mismatches=mismatches
    )
