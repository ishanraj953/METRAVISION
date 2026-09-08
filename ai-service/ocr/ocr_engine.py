from pathlib import Path
from typing import List

from paddleocr import PaddleOCR

from .ocr_result import OCRResult


class OCREngine:

    def __init__(self):
        self.ocr = PaddleOCR(
            lang="en",
            device="cpu",
            enable_mkldnn=False,
        )

    def extract_text(self, image_path: str) -> List[OCRResult]:

        image = Path(image_path)

        if not image.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        results = self.ocr.predict(str(image))

        ocr_results = []

        for result in results:

            texts = result.get("rec_texts", [])
            scores = result.get("rec_scores", [])
            boxes = result.get("rec_boxes", [])
            polygons = result.get("rec_polys", [])

            for text, score, box, polygon in zip(
                texts,
                scores,
                boxes,
                polygons
            ):

                bbox = [
                    int(box[0]),
                    int(box[1]),
                    int(box[2]),
                    int(box[3])
                ]

                polygon_points = [
                    [int(point[0]), int(point[1])]
                    for point in polygon
                ]

                ocr_results.append(
                    OCRResult(
                        text=str(text),
                        confidence=float(score),
                        bbox=bbox,
                        polygon=polygon_points,
                        source="ocr"
                    )
                )

        return ocr_results