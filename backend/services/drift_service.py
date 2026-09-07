import json
from sqlalchemy.orm import Session
from models.product import Product
from models.scan import Scan
from models.listing import ProductVersion, OnlineListing

class DriftService:
    def detect_drift(self, db: Session, product_id: int) -> dict:
        versions = db.query(ProductVersion).filter(
            ProductVersion.product_id == product_id
        ).order_by(ProductVersion.version_number.asc()).all()

        if len(versions) < 2:
            return {
                "drift_detected": False,
                "message": "Insufficient version history to detect drift",
                "drifts": []
            }

        latest = versions[-1]
        previous = versions[-2]

        drifts = []
        fields_to_check = ["mrp", "net_quantity", "manufacturer_name", "importer_name"]

        for field in fields_to_check:
            old_val = getattr(previous, field, None)
            new_val = getattr(latest, field, None)

            if old_val and new_val and old_val != new_val:
                drifts.append({
                    "drift_detected": True,
                    "field": field,
                    "old_value": old_val,
                    "new_value": new_val,
                    "from_version": previous.version_number,
                    "to_version": latest.version_number,
                    "detected_at": latest.created_at.isoformat()
                })

        return {
            "drift_detected": len(drifts) > 0,
            "drifts": drifts
        }

drift_service = DriftService()
