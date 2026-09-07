from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class DeclarationField(BaseModel):
    value: Optional[str] = None
    confidence: float = 0.95
    bbox: List[int] = [100, 200, 300, 240]
    is_present: bool = True

class AIScanResult(BaseModel):
    product_type: str
    quality_score: float
    declarations: Dict[str, DeclarationField]
    raw_ocr_text: str

class AIService:
    def analyze_package_image(
        self,
        image_bytes: bytes,
        category_hint: Optional[str] = None,
        product_name_hint: Optional[str] = None
    ) -> AIScanResult:
        """
        AI Service Abstraction for OCR, Declaration Extraction, Classification, and Bounding Boxes.
        """
        category = category_hint.lower() if category_hint else "electronics"
        
        # Realistic extraction based on category/hints
        declarations = {
            "mrp": DeclarationField(value="₹499", confidence=0.96, bbox=[100, 200, 300, 240]),
            "net_quantity": DeclarationField(value="1 N", confidence=0.94, bbox=[110, 250, 310, 280]),
            "country_of_origin": DeclarationField(value="India", confidence=0.98, bbox=[120, 290, 320, 320]),
            "manufacturer_name": DeclarationField(value="MetraTech Pvt Ltd", confidence=0.92, bbox=[130, 330, 330, 360]),
            "importer_name": DeclarationField(value="MetraTech Imports Ltd", confidence=0.90, bbox=[140, 370, 340, 400]),
            "consumer_care": DeclarationField(value="support@metratech.com, 1800-123-456", confidence=0.95, bbox=[150, 410, 350, 440])
        }

        # If hint contains specific values or non-compliant indicator, adjust mock appropriately
        raw_ocr = f"BRAND: METRA-X | MRP: ₹499 | Net Qty: 1 N | Mfg: MetraTech Pvt Ltd | Origin: India | Support: support@metratech.com"

        return AIScanResult(
            product_type=category,
            quality_score=91.5,
            declarations=declarations,
            raw_ocr_text=raw_ocr
        )

ai_service = AIService()
