from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User
from models.scan import Scan
from schemas.scan import ScanOrchestrationResponse, ScanSummaryResponse
from services.compliance_service import compliance_service
from auth.dependencies import get_current_user, validate_product_ownership
from utils.audit_logger import log_audit

router = APIRouter(tags=["Scans"])

@router.post("/products/{product_id}/scan", response_model=ScanOrchestrationResponse)
async def scan_product_endpoint(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    
    contents = await file.read()
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
