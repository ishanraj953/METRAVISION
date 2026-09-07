from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User, UserRole
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate, ProductResponse
from auth.dependencies import get_current_user, require_shopkeeper, validate_product_ownership
from utils.audit_logger import log_audit

router = APIRouter(prefix="/products", tags=["Products"])

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
        country_of_origin=prod_in.country_of_origin,
        manufacturer_name=prod_in.manufacturer_name,
        importer_name=prod_in.importer_name,
        consumer_care=prod_in.consumer_care,
        shopkeeper_id=current_user.id,
        status="COMPLIANT"
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    log_audit(db, action="CREATE_PRODUCT", entity="Product", entity_id=str(product.id), user=current_user)

    return product

@router.get("/my", response_model=List[ProductResponse])
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_shopkeeper)
):
    # Strict ownership isolation for Shopkeeper
    return db.query(Product).filter(Product.shopkeeper_id == current_user.id).all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforces role permissions and shopkeeper ownership validation
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

    log_audit(db, action="UPDATE_PRODUCT", entity="Product", entity_id=str(product.id), user=current_user)

    return product
