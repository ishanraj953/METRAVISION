import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User, UserRole
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate, ProductResponse
from auth.dependencies import get_current_user, require_shopkeeper, validate_product_ownership
from services.auto_detect_service import auto_detect_service
from utils.audit_logger import log_audit

logger = logging.getLogger("metravision.api.products")

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
def get_all_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.SHOPKEEPER:
        return db.query(Product).filter(Product.shopkeeper_id == current_user.id).all()
    return db.query(Product).all()

@router.post("/auto-detect")
async def auto_detect_commodity(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Auto-detects commodity attributes from 1 to 4+ uploaded packaging photos.
    Decodes barcode/QR code if present, extracts declarations via OCR,
    and returns detected statutory fields along with any missing fields.
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="Please upload at least 1 packaging photograph.")

    images_data = []
    for f in files:
        b = await f.read()
        images_data.append({
            "bytes": b,
            "filename": f.filename or "panel.jpg"
        })

    result = auto_detect_service.detect_commodity_from_images(
        db=db,
        images_data=images_data,
        user_id=current_user.id
    )

    log_audit(
        db,
        action="AUTO_DETECT_COMMODITY",
        entity="Product",
        entity_id="AUTO_SCAN",
        user=current_user,
        metadata={"total_panels": len(files), "is_new": result["is_new_commodity"], "barcode": result["barcode"]}
    )

    return result

@router.post("/", response_model=ProductResponse)
def create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_shopkeeper)
):
    product = Product(
        name=prod_in.name,
        brand=prod_in.brand,
        category=prod_in.category,
        mrp=prod_in.mrp,
        net_quantity=prod_in.net_quantity,
        country_of_origin=prod_in.country_of_origin or "India",
        manufacturer_name=prod_in.manufacturer_name,
        importer_name=prod_in.importer_name,
        consumer_care=prod_in.consumer_care,
        shopkeeper_id=current_user.id,
        status="COMPLIANT"
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    try:
        from database.mongo import products_collection
        products_collection().update_one(
            {"id": product.id},
            {"$set": {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "category": product.category,
                "mrp": product.mrp,
                "net_quantity": product.net_quantity,
                "country_of_origin": product.country_of_origin,
                "manufacturer_name": product.manufacturer_name,
                "importer_name": product.importer_name,
                "consumer_care": product.consumer_care,
                "shopkeeper_id": product.shopkeeper_id,
                "status": product.status,
            }},
            upsert=True
        )
    except Exception:
        pass

    log_audit(db, action="CREATE_PRODUCT", entity="Product", entity_id=str(product.id), user=current_user)

    return product

@router.get("/my", response_model=List[ProductResponse])
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_shopkeeper)
):
    return db.query(Product).filter(Product.shopkeeper_id == current_user.id).all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = validate_product_ownership(product_id=product_id, current_user=current_user, db=db)
    
    update_data = prod_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)

    try:
        from database.mongo import products_collection
        products_collection().update_one(
            {"id": product.id},
            {"$set": {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "category": product.category,
                "mrp": product.mrp,
                "net_quantity": product.net_quantity,
                "country_of_origin": product.country_of_origin,
                "manufacturer_name": product.manufacturer_name,
                "importer_name": product.importer_name,
                "consumer_care": product.consumer_care,
                "shopkeeper_id": product.shopkeeper_id,
                "status": product.status,
            }},
            upsert=True
        )
    except Exception:
        pass

    log_audit(db, action="UPDATE_PRODUCT", entity="Product", entity_id=str(product.id), user=current_user)

    return product
