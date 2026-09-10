import cv2
import numpy as np
import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from models.product import Product
from services.ai_service import ai_service

logger = logging.getLogger("metravision.auto_detect")

MANDATORY_FIELDS = [
    "name",
    "brand",
    "category",
    "mrp",
    "net_quantity",
    "country_of_origin",
    "manufacturer_name",
    "consumer_care"
]

CATEGORY_KEYWORDS = {
    "packaged_food": ["food", "snack", "flour", "rice", "wheat", "atta", "namkeen", "chips", "biscuit", "cookie", "oil", "spice", "masala", "tea", "coffee", "sugar", "salt", "pulse", "dal", "paneer", "milk", "beverage", "juice", "chana", "moong"],
    "electronics": ["electronics", "cable", "battery", "charger", "power bank", "adapter", "usb", "volt", "watt", "mah", "device", "speaker", "headphone", "earphone", "display", "led", "smart"],
    "cosmetics": ["soap", "shampoo", "cream", "lotion", "serum", "perfume", "deodorant", "hair", "skin", "cosmetics", "face wash", "body wash", "oil", "gel", "conditioner"],
    "medical_device": ["bandage", "thermometer", "mask", "syringe", "device", "medical", "sanitizer", "oximeter", "gloves", "gauze"],
    "apparel": ["shirt", "cotton", "fabric", "trousers", "garment", "apparel", "textile", "wool", "size", "denim", "dress", "saree"]
}

class AutoDetectService:
    def detect_commodity_from_images(
        self,
        db: Session,
        images_data: List[Dict[str, Any]],
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Auto-detects commodity attributes from 1 to 4+ uploaded packaging photos.
        Extracts metadata first from Barcode / QR if present, then OCR across all panels.
        Flags missing statutory fields so the user can review or manually complete them.
        """
        detected_barcode = None
        barcode_type = None
        all_raw_text = []
        aggregated_decls = {}
        panel_details = []

        # 1. Barcode & QR Code detection + OCR on each uploaded panel
        for idx, item in enumerate(images_data):
            img_bytes = item.get("bytes", b"")
            filename = item.get("filename", f"panel_{idx+1}.jpg")

            # Check Barcode / QR
            b_info, b_type = self._scan_barcode_or_qr(img_bytes)
            if b_info and not detected_barcode:
                detected_barcode = b_info
                barcode_type = b_type

            # Run OCR & Declaration Extraction
            try:
                ai_res = ai_service.analyze_package_image(
                    image_bytes=img_bytes,
                    category_hint=None,
                    product_name_hint=None
                )
                if ai_res and ai_res.raw_ocr_text:
                    all_raw_text.append(ai_res.raw_ocr_text)

                for f_name, f_obj in (ai_res.declarations.items() if ai_res else {}):
                    val = f_obj.value if hasattr(f_obj, "value") else (f_obj.get("value") if isinstance(f_obj, dict) else None)
                    is_pres = f_obj.is_present if hasattr(f_obj, "is_present") else (f_obj.get("is_present") if isinstance(f_obj, dict) else False)
                    conf = f_obj.confidence if hasattr(f_obj, "confidence") else (f_obj.get("confidence", 0.9) if isinstance(f_obj, dict) else 0.9)

                    if is_pres and val and str(val).strip() and str(val).upper() not in ["NONE", "MISSING"]:
                        existing = aggregated_decls.get(f_name)
                        if not existing or (conf > existing.get("confidence", 0)):
                            aggregated_decls[f_name] = {
                                "value": str(val).strip(),
                                "confidence": conf,
                                "source": "OCR",
                                "panel_index": idx + 1
                            }

                panel_details.append({
                    "panel_index": idx + 1,
                    "filename": filename,
                    "barcode_detected": bool(b_info),
                    "barcode_value": b_info,
                    "ocr_text_length": len(ai_res.raw_ocr_text) if ai_res else 0,
                    "quality_score": ai_res.quality_score if ai_res else 85.0
                })
            except Exception as e:
                logger.warning(f"Error processing panel {idx+1}: {e}")

        combined_text = "\n".join(all_raw_text)

        # 2. Refined Regex Extraction from Combined OCR Text
        parsed_fields, field_sources = self._parse_fields_from_ocr_text(combined_text, aggregated_decls)

        # 3. If Barcode detected, attempt database / GS1 catalog lookup
        if detected_barcode:
            parsed_fields["barcode"] = detected_barcode
            field_sources["barcode"] = "BARCODE"
            self._enrich_from_barcode(detected_barcode, parsed_fields, field_sources)

        # 4. Check if commodity already exists in DB
        existing_product = None
        if detected_barcode:
            existing_product = db.query(Product).filter(
                (Product.name.ilike(f"%{detected_barcode}%")) |
                (Product.brand.ilike(f"%{detected_barcode}%"))
            ).first()

        if not existing_product and parsed_fields.get("name"):
            existing_product = db.query(Product).filter(
                Product.name.ilike(parsed_fields["name"])
            ).first()

        is_new = existing_product is None

        # If existing product found, merge known attributes
        if existing_product:
            if not parsed_fields.get("name"):
                parsed_fields["name"] = existing_product.name
                field_sources["name"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("brand") and existing_product.brand:
                parsed_fields["brand"] = existing_product.brand
                field_sources["brand"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("category") and existing_product.category:
                parsed_fields["category"] = existing_product.category
                field_sources["category"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("mrp") and existing_product.mrp:
                parsed_fields["mrp"] = existing_product.mrp
                field_sources["mrp"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("net_quantity") and existing_product.net_quantity:
                parsed_fields["net_quantity"] = existing_product.net_quantity
                field_sources["net_quantity"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("manufacturer_name") and existing_product.manufacturer_name:
                parsed_fields["manufacturer_name"] = existing_product.manufacturer_name
                field_sources["manufacturer_name"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("importer_name") and existing_product.importer_name:
                parsed_fields["importer_name"] = existing_product.importer_name
                field_sources["importer_name"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("consumer_care") and existing_product.consumer_care:
                parsed_fields["consumer_care"] = existing_product.consumer_care
                field_sources["consumer_care"] = "DATABASE_LOOKUP"
            if not parsed_fields.get("country_of_origin") and existing_product.country_of_origin:
                parsed_fields["country_of_origin"] = existing_product.country_of_origin
                field_sources["country_of_origin"] = "DATABASE_LOOKUP"

        # 5. Compute missing fields
        missing_fields = []
        for mf in MANDATORY_FIELDS:
            val = parsed_fields.get(mf)
            if not val or str(val).strip() == "" or str(val).upper() in ["NONE", "MISSING", "N/A"]:
                missing_fields.append(mf)
                field_sources[mf] = "MANUAL_PENDING"

        # Categorize default if not detected
        if not parsed_fields.get("category"):
            parsed_fields["category"] = "packaged_food"
            field_sources["category"] = "DEFAULT_HINT"
            if "category" in missing_fields:
                missing_fields.remove("category")

        if not parsed_fields.get("country_of_origin"):
            parsed_fields["country_of_origin"] = "India"
            field_sources["country_of_origin"] = "DEFAULT_DOMESTIC"
            if "country_of_origin" in missing_fields:
                missing_fields.remove("country_of_origin")

        return {
            "is_new_commodity": is_new,
            "existing_product_id": existing_product.id if existing_product else None,
            "barcode": detected_barcode,
            "barcode_type": barcode_type,
            "detected_fields": parsed_fields,
            "field_sources": field_sources,
            "missing_fields": missing_fields,
            "total_panels_analyzed": len(images_data),
            "panels": panel_details,
            "raw_ocr_summary": combined_text[:400] + ("..." if len(combined_text) > 400 else "")
        }

    def _scan_barcode_or_qr(self, img_bytes: bytes) -> Tuple[Optional[str], Optional[str]]:
        if not img_bytes:
            return None, None
        try:
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return None, None

            # Try OpenCV Barcode Detector
            try:
                bd = cv2.barcode.BarcodeDetector()
                ok, decoded_info, decoded_type, _ = bd.detectAndDecode(img)
                if ok and decoded_info:
                    info = decoded_info[0] if isinstance(decoded_info, (list, tuple)) else decoded_info
                    btype = decoded_type[0] if isinstance(decoded_type, (list, tuple)) else decoded_type
                    if info and str(info).strip():
                        return str(info).strip(), str(btype or "EAN_13")
            except Exception:
                pass

            # Try OpenCV QR Code Detector
            try:
                qd = cv2.QRCodeDetector()
                val, pts, st_code = qd.detectAndDecode(img)
                if val and str(val).strip():
                    return str(val).strip(), "QR_CODE"
            except Exception:
                pass
        except Exception:
            pass
        return None, None

    def _parse_fields_from_ocr_text(
        self,
        text: str,
        aggregated: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], Dict[str, str]]:
        fields = {}
        sources = {}

        # Fill from aggregated declarations if present
        for k in ["mrp", "net_quantity", "country_of_origin", "manufacturer_name", "importer_name", "consumer_care", "manufacturing_date"]:
            if k in aggregated and aggregated[k].get("value"):
                fields[k] = aggregated[k]["value"]
                sources[k] = "OCR"

        # Regex Refinements
        # MRP
        if not fields.get("mrp"):
            mrp_match = re.search(r'(?:MRP|M\.R\.P\.|Rs\.?|₹|MAX(?:IMUM)?\s*RETAIL\s*PRICE)[^\d\n]*([0-9]+(?:\.[0-9]{1,2})?)', text, re.IGNORECASE)
            if mrp_match:
                fields["mrp"] = mrp_match.group(1).strip()
                sources["mrp"] = "OCR_REGEX"

        # Net Quantity
        if not fields.get("net_quantity"):
            qty_match = re.search(r'(?:NET\s*(?:QTY|QUANTITY|WEIGHT|CONTENT|VOL|VOLUME)|Net\s*Wt\.?)[^\w\n]*([0-9]+(?:\.[0-9]+)?\s*(?:g|gm|gms|kg|ml|l|ltr|litres?|pieces?|units?|N|u))\b', text, re.IGNORECASE)
            if qty_match:
                fields["net_quantity"] = qty_match.group(1).strip()
                sources["net_quantity"] = "OCR_REGEX"

        # Country of Origin
        if not fields.get("country_of_origin"):
            origin_match = re.search(r'(?:COUNTRY\s*OF\s*ORIGIN|MADE\s*IN|ORIGIN)[^\w\n]*([A-Za-z\s]{3,25})', text, re.IGNORECASE)
            if origin_match:
                clean_org = origin_match.group(1).strip().split("\n")[0].strip()
                if len(clean_org) >= 3:
                    fields["country_of_origin"] = clean_org
                    sources["country_of_origin"] = "OCR_REGEX"

        # Manufacturer Name
        if not fields.get("manufacturer_name"):
            mfr_match = re.search(r'(?:MFD\s*BY|MANUFACTURED\s*BY|PACKED\s*BY|MFR|PRODUCED\s*BY)[^\w\n]*([^\n\r\|]{5,80})', text, re.IGNORECASE)
            if mfr_match:
                clean_mfr = mfr_match.group(1).strip()
                if len(clean_mfr) >= 4:
                    fields["manufacturer_name"] = clean_mfr
                    sources["manufacturer_name"] = "OCR_REGEX"

        # Consumer Care
        if not fields.get("consumer_care"):
            care_match = re.search(r'(?:CONSUMER\s*CARE|CUSTOMER\s*CARE|CARE\s*CELL|HELPLINE|FEEDBACK|EMAIL|TOLL\s*FREE)[^\w\n]*([^\n\r\|]{6,80})', text, re.IGNORECASE)
            if care_match:
                clean_care = care_match.group(1).strip()
                if len(clean_care) >= 5:
                    fields["consumer_care"] = clean_care
                    sources["consumer_care"] = "OCR_REGEX"

        # Product Title & Brand
        lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 3]
        if lines:
            if not fields.get("name"):
                fields["name"] = lines[0][:80]
                sources["name"] = "OCR_HEADING"
            if not fields.get("brand") and len(lines) > 1:
                fields["brand"] = lines[0].split()[0] if lines[0] else lines[1][:30]
                sources["brand"] = "OCR_BRAND"

        # Category Classification based on keywords
        detected_category = None
        lower_text = text.lower()
        for cat, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if kw in lower_text:
                    detected_category = cat
                    break
            if detected_category:
                break

        if detected_category:
            fields["category"] = detected_category
            sources["category"] = "OCR_KEYWORD_MATCH"

        return fields, sources

    def _enrich_from_barcode(
        self,
        barcode: str,
        fields: Dict[str, Any],
        sources: Dict[str, str]
    ):
        """Enrich known GS1 barcode prefixes or patterns."""
        if barcode.startswith("890"):
            if not fields.get("country_of_origin"):
                fields["country_of_origin"] = "India"
                sources["country_of_origin"] = "GS1_BARCODE_PREFIX_890"

auto_detect_service = AutoDetectService()
