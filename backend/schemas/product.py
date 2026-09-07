from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    category: str
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    country_of_origin: Optional[str] = None
    manufacturer_name: Optional[str] = None
    importer_name: Optional[str] = None
    consumer_care: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    country_of_origin: Optional[str] = None
    manufacturer_name: Optional[str] = None
    importer_name: Optional[str] = None
    consumer_care: Optional[str] = None
    status: Optional[str] = None

class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    scan_id: Optional[int] = None
    file_path: str
    original_filename: str
    file_type: str
    file_size: int
    image_quality_score: float
    width: int
    height: int
    blur_score: float
    glare_score: float
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductResponse(BaseModel):
    id: int
    name: str
    brand: Optional[str] = None
    category: str
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    country_of_origin: Optional[str] = None
    manufacturer_name: Optional[str] = None
    importer_name: Optional[str] = None
    consumer_care: Optional[str] = None
    shopkeeper_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    images: List[ProductImageResponse] = []

    model_config = ConfigDict(from_attributes=True)
