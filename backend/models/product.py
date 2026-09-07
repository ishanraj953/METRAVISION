import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=False, index=True)
    mrp = Column(String, nullable=True)
    net_quantity = Column(String, nullable=True)
    country_of_origin = Column(String, nullable=True)
    manufacturer_name = Column(String, nullable=True, index=True)
    importer_name = Column(String, nullable=True)
    consumer_care = Column(String, nullable=True)
    shopkeeper_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String, default="COMPLIANT")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    shopkeeper = relationship("User", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    scans = relationship("Scan", back_populates="product", cascade="all, delete-orphan")
    declarations = relationship("Declaration", back_populates="product", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="product", cascade="all, delete-orphan")
    versions = relationship("ProductVersion", back_populates="product", cascade="all, delete-orphan")
    online_listings = relationship("OnlineListing", back_populates="product", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="product", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=True, index=True)
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    image_quality_score = Column(Float, default=100.0)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    blur_score = Column(Float, default=0.0)
    glare_score = Column(Float, default=0.0)
    category = Column(String, default="original")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="images")
    scan = relationship("Scan", back_populates="images")
