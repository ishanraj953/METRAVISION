from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class OCRResult:
    text: str
    confidence: float
    bbox: List[int]
    polygon: List[List[int]] = field(default_factory=list)
    source: str = "ocr"
    page: int = 1
    image_path: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "confidence": round(float(self.confidence), 4),
            "bbox": self.bbox,
            "polygon": self.polygon,
            "source": self.source,
            "page": self.page,
            "image_path": self.image_path
        }