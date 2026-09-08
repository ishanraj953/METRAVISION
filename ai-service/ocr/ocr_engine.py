from pathlib import Path
from typing import List

from paddleocr import PaddleOCR

from .ocr_result import OCRResult


class OCREngine:

    def __init__(self, lang: str = "en", device: str = "cpu"):
        self.ocr = PaddleOCR(
            lang=lang,
            device=device,
            enable_mkldnn=False,
        )

    def extract_text(self, image_path: str, page: int = 1) -> List[OCRResult]:

        image = Path(image_path)

        if not image.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        str_path = str(image)
        ocr_results: List[OCRResult] = []

        try:
            # First try predict method (PaddleOCR 3.x)
            results = self.ocr.predict(str_path)
        except Exception:
            # Fallback to standard ocr method
            results = self.ocr.ocr(str_path)

        for result in results:
            if isinstance(result, dict):
                texts = result.get("rec_texts", [])
                scores = result.get("rec_scores", [])
                boxes = result.get("rec_boxes", [])
                polygons = result.get("rec_polys", [])

                for idx, text in enumerate(texts):
                    score = float(scores[idx]) if idx < len(scores) else 1.0
                    box = boxes[idx] if idx < len(boxes) else None
                    poly = polygons[idx] if idx < len(polygons) else None

                    polygon_points = []
                    if poly is not None:
                        polygon_points = [
                            [int(p[0]), int(p[1])] for p in poly
                        ]

                    if box is not None and len(box) >= 4:
                        bbox = [int(box[0]), int(box[1]), int(box[2]), int(box[3])]
                    elif polygon_points:
                        xs = [p[0] for p in polygon_points]
                        ys = [p[1] for p in polygon_points]
                        bbox = [min(xs), min(ys), max(xs), max(ys)]
                    else:
                        bbox = [0, 0, 0, 0]

                    ocr_results.append(
                        OCRResult(
                            text=str(text).strip(),
                            confidence=max(0.0, min(1.0, float(score))),
                            bbox=bbox,
                            polygon=polygon_points,
                            source="ocr",
                            page=page,
                            image_path=str_path
                        )
                    )

            elif isinstance(result, list):
                # PaddleOCR 2.x standard output format: [[[points], (text, score)], ...]
                for item in result:
                    if not item or len(item) < 2:
                        continue
                    poly_points = item[0]
                    text_score = item[1]
                    text = text_score[0] if isinstance(text_score, (list, tuple)) else str(text_score)
                    score = float(text_score[1]) if isinstance(text_score, (list, tuple)) and len(text_score) > 1 else 1.0

                    polygon_points = [
                        [int(p[0]), int(p[1])] for p in poly_points
                    ] if poly_points else []

                    if polygon_points:
                        xs = [p[0] for p in polygon_points]
                        ys = [p[1] for p in polygon_points]
                        bbox = [min(xs), min(ys), max(xs), max(ys)]
                    else:
                        bbox = [0, 0, 0, 0]

                    ocr_results.append(
                        OCRResult(
                            text=str(text).strip(),
                            confidence=max(0.0, min(1.0, float(score))),
                            bbox=bbox,
                            polygon=polygon_points,
                            source="ocr",
                            page=page,
                            image_path=str_path
                        )
                    )

        return ocr_results