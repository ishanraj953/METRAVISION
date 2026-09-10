import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
from database.connection import get_db
from models.user import User
from models.scan import Scan
from schemas.scan import ScanOrchestrationResponse, ScanSummaryResponse
from services.compliance_service import compliance_service
from auth.dependencies import get_current_user, validate_product_ownership
from utils.audit_logger import log_audit

router = APIRouter(tags=["Scans"])

TEST_IMAGES_DIR = Path(__file__).resolve().parent.parent.parent / "ai-service" / "test_images"


@router.get("/scans/presets")
def list_scan_presets():
    """
    Returns built-in sample packaging photographs for 1-click testing & demo evaluation.
    """
    presets = []
    if os.path.exists(TEST_IMAGES_DIR):
        for f in os.listdir(TEST_IMAGES_DIR):
            if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                presets.append({
                    "name": f,
                    "url": f"/scans/presets/{f}",
                    "description": "Pre-packaged commodity sample for Legal Metrology PCR 2011 compliance check."
                })
    return presets


@router.get("/scans/presets/{filename}")
def get_scan_preset_file(filename: str):
    file_path = TEST_IMAGES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preset image not found")
    return FileResponse(str(file_path))


@router.get("/scans/presets-4facet")
def get_4facet_preset():
    """
    Returns official 4-facet packaging panel dataset for 1-click test evaluation under PCR 2011.
    """
    return {
        "preset_id": "pepsico_namkeen_4facet",
        "product_name": "Haldiram's / PepsiCo Namkeen (PCR 2011 Verified Set)",
        "category": "food",
        "description": "Complete 4-Facet Packaging Panel set conforming to Legal Metrology Rule 6: PDP Front, Back Statutory Panel, MRP/USP Pricing Crimp, and Manufacturer/Origin Panel.",
        "facets": [
            {"index": 0, "label": "Facet 1: Front Panel (PDP)", "file": "sample_facet1_front.jpg", "url": "/scans/presets/sample_facet1_front.jpg"},
            {"index": 1, "label": "Facet 2: Back Statutory Panel", "file": "sample_facet2_back.jpg", "url": "/scans/presets/sample_facet2_back.jpg"},
            {"index": 2, "label": "Facet 3: MRP & Statutory Pricing", "file": "sample_facet3_mrp.jpg", "url": "/scans/presets/sample_facet3_mrp.jpg"},
            {"index": 3, "label": "Facet 4: Manufacturer & Origin", "file": "sample_facet4_manufacturer.jpg", "url": "/scans/presets/sample_facet4_manufacturer.jpg"}
        ]
    }


@router.post("/scans/multi", response_model=ScanOrchestrationResponse)
def multi_facet_scan_endpoint(
    files: List[UploadFile] = File(...),
    facet_labels: Optional[List[str]] = Form(None),
    product_name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Multi-Facet Package Scan: requires at least 4 photos (PDP Front, Back Panel, MRP Crimp, Manufacturer/Origin Panel).
    Runs OCR perception across each facet, merges all detected declarations, and performs complete PCR 2011 compliance check.
    """
    if len(files) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Legal Metrology Protocol requires at least 4 packaging facet photographs (Front PDP, Back Panel, MRP/Date Crimp, and Manufacturer/Origin Panel). Received {len(files)} photos. Please upload at least 4 photos."
        )

    files_data = []
    for idx, f in enumerate(files):
        contents = f.file.read()
        if not contents:
            raise HTTPException(status_code=400, detail=f"Facet file #{idx+1} '{f.filename}' is empty.")
        label = facet_labels[idx] if (facet_labels and idx < len(facet_labels)) else None
        files_data.append({
            "bytes": contents,
            "filename": f.filename or f"facet_{idx+1}.jpg",
            "facet_label": label
        })

    try:
        result = compliance_service.scan_multi(
            db=db,
            user_id=current_user.id,
            files_data=files_data,
            category_hint=category,
            product_name_hint=product_name
        )

        log_audit(
            db=db,
            action="MULTI_FACET_SCAN",
            entity="Scan",
            entity_id=str(result["numeric_scan_id"]),
            user=current_user,
            metadata={"status": result["status"], "facets_count": len(files_data), "violations_count": len(result["violations"])}
        )

        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-facet scan execution failed: {str(e)}")


@router.post("/scans/instant", response_model=ScanOrchestrationResponse)
def instant_scan_endpoint(
    file: UploadFile = File(...),
    product_name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Direct instant scan endpoint: scan ANY package photograph directly without requiring a pre-registered product.
    Executed in threadpool worker so Uvicorn asyncio event loop is never blocked.
    """
    contents = file.file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file uploaded")

    try:
        result = compliance_service.scan_direct(
            db=db,
            user_id=current_user.id,
            image_bytes=contents,
            filename=file.filename or "instant_package_scan.jpg",
            category_hint=category,
            product_name_hint=product_name
        )

        log_audit(
            db=db,
            action="INSTANT_SCAN",
            entity="Scan",
            entity_id=str(result["numeric_scan_id"]),
            user=current_user,
            metadata={"status": result["status"], "violations_count": len(result["violations"])}
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Direct scan execution failed: {str(e)}")


@router.post("/products/{product_id}/scan", response_model=ScanOrchestrationResponse)
def scan_product_endpoint(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    
    contents = file.file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file uploaded")

    try:
        result = compliance_service.scan_product(
            db=db,
            product_id=product.id,
            user_id=current_user.id,
            image_bytes=contents,
            filename=file.filename or "package_scan.jpg"
        )
        
        log_audit(
            db=db,
            action="SCAN_PRODUCT",
            entity="Scan",
            entity_id=str(result["numeric_scan_id"]),
            user=current_user,
            metadata={"status": result["status"], "violations_count": len(result["violations"])}
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan orchestration failed: {str(e)}")


@router.get("/products/{product_id}/scans", response_model=List[ScanSummaryResponse])
def get_product_scans(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    return db.query(Scan).filter(Scan.product_id == product.id).all()
