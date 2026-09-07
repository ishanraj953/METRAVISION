import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import Base

class OnlineListing(Base):
    __tablename__ = "online_listings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    platform_name = Column(String, nullable=False)
    listing_url = Column(String, nullable=True)
    product_name = Column(String, nullable=True)
    mrp = Column(String, nullable=True)
    net_quantity = Column(String, nullable=True)
    manufacturer_name = Column(String, nullable=True)
    importer_name = Column(String, nullable=True)
    country_of_origin = Column(String, nullable=True)
    consumer_care = Column(String, nullable=True)
    unit_sale_price = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="online_listings")


class ProductVersion(Base):
    __tablename__ = "product_versions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=True, index=True)
    version_number = Column(Integer, nullable=False)
    mrp = Column(String, nullable=True)
    net_quantity = Column(String, nullable=True)
    manufacturer_name = Column(String, nullable=True)
    importer_name = Column(String, nullable=True)
    snapshot_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="versions")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String, nullable=False)  # CHECKER, SHOPKEEPER, ADMIN
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_path = Column(String, nullable=True)
    format = Column(String, default="JSON")  # JSON, PDF
    data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
