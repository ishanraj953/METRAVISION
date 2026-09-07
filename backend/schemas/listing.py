from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class OnlineListingCreate(BaseModel):
    product_id: int
    platform_name: str
    listing_url: Optional[str] = None
    product_name: Optional[str] = None
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    manufacturer_name: Optional[str] = None
    importer_name: Optional[str] = None
    country_of_origin: Optional[str] = None
    consumer_care: Optional[str] = None
    unit_sale_price: Optional[str] = None

class OnlineListingResponse(BaseModel):
    id: int
    product_id: int
    platform_name: str
    listing_url: Optional[str] = None
    product_name: Optional[str] = None
    mrp: Optional[str] = None
    net_quantity: Optional[str] = None
    manufacturer_name: Optional[str] = None
    importer_name: Optional[str] = None
    country_of_origin: Optional[str] = None
    consumer_care: Optional[str] = None
    unit_sale_price: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CrossChannelComparisonResponse(BaseModel):
    match: bool
    mismatches: List[Dict[str, Any]] = []
