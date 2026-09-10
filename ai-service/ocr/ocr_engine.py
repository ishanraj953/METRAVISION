import os
import sys
import logging
from pathlib import Path
from typing import List
from PIL import Image

from .ocr_result import OCRResult

logger = logging.getLogger("metravision.ocr")

try:
    import winocr
    HAS_WINOCR = True
except Exception:
    HAS_WINOCR = False

try:
    # Ensure paddle models don't crash with PIR / onednn bug
    import paddlex.inference.models.runners.paddle_static.config.pp_option as pp_option
    if hasattr(pp_option, 'MKLDNN_BLOCKLIST'):
        if 'PP-OCRv6_medium_det' not in pp_option.MKLDNN_BLOCKLIST:
            pp_option.MKLDNN_BLOCKLIST.append('PP-OCRv6_medium_det')
        if 'PP-OCRv6_medium_rec' not in pp_option.MKLDNN_BLOCKLIST:
            pp_option.MKLDNN_BLOCKLIST.append('PP-OCRv6_medium_rec')
    from paddleocr import PaddleOCR
    HAS_PADDLEOCR = True
except Exception:
    HAS_PADDLEOCR = False


class OCREngine:

    def __init__(self, lang: str = "en", device: str = "cpu"):
        self.lang = lang
        self.device = device
        self._paddle_ocr = None

    def _get_paddle_ocr(self):
        if self._paddle_ocr is None and HAS_PADDLEOCR:
            try:
                self._paddle_ocr = PaddleOCR(
                    lang=self.lang,
                    device=self.device,
                    use_doc_orientation_classify=False,
                    use_doc_unwarping=False,
                    use_textline_orientation=False,
                    text_det_limit_side_len=640,
                    text_recognition_batch_size=16,
                )
            except Exception as e:
                logger.warning(f"Could not initialize PaddleOCR: {e}")
        return self._paddle_ocr

    def extract_text(self, image_path: str, page: int = 1) -> List[OCRResult]:

        image = Path(image_path)

        if not image.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        str_path = str(image)
        ocr_results: List[OCRResult] = []

        # 1. Primary Engine: Isolated Native Windows Media OCR (Process-safe, COM-isolated, 0.7s runtime)
        runner_path = Path(__file__).parent / "native_ocr_runner.py"
        if runner_path.exists():
            try:
                import subprocess
                import json
                cmd = [sys.executable, str(runner_path), str_path, self.lang]
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=8)
                if proc.returncode == 0 and proc.stdout.strip():
                    items = json.loads(proc.stdout)
                    for item in items:
                        bbox = item.get("bbox", [0, 0, 0, 0])
                        polygon = [[bbox[0], bbox[1]], [bbox[2], bbox[1]], [bbox[2], bbox[3]], [bbox[0], bbox[3]]]
                        ocr_results.append(
                            OCRResult(
                                text=str(item.get("text", "")).strip(),
                                confidence=float(item.get("confidence", 0.95)),
                                bbox=bbox,
                                polygon=polygon,
                                source="winocr_isolated",
                                page=page,
                                image_path=str_path
                            )
                        )
                    if ocr_results:
                        return ocr_results
            except Exception as e:
                logger.warning(f"Native Windows OCR runner error: {e}, falling back to PaddleOCR")

        # 2. Secondary Engine: PaddleOCR (Deep learning fallback)
        paddle_instance = self._get_paddle_ocr()
        if paddle_instance is not None:
            try:
                results = list(paddle_instance.predict(str_path))
            except Exception:
                try:
                    results = paddle_instance.ocr(str_path)
                except Exception:
                    results = []
        else:
            results = []

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