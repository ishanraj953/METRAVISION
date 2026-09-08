from dataclasses import dataclass
from typing import List


@dataclass
class OCRResult:
    text: str
    confidence: float
    bbox: List[int]
    polygon: List[List[int]]
    source: str = "ocr"