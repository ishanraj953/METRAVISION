import os
import sys
import logging
from pathlib import Path
from typing import List
from PIL import Image

os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"

from .ocr_result import OCRResult

logger = logging.getLogger("metravision.ocr")

try:
    import easyocr
    HAS_EASYOCR = True
except Exception as e:
    HAS_EASYOCR = False

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

try:
    import pytesseract
    HAS_PYTESSERACT = True
except Exception:
    HAS_PYTESSERACT = False


class OCREngine:

    def __init__(self, lang: str = "en", device: str = "cpu"):
        self.lang = lang
        self.device = device
        self._paddle_ocr = None
        self._easy_ocr = None

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

    def _get_easy_ocr(self):
        print(f"DEBUG: HAS_EASYOCR = {HAS_EASYOCR}")
        if self._easy_ocr is None and HAS_EASYOCR:
            try:
                self._easy_ocr = easyocr.Reader([self.lang], gpu=False, verbose=False)
            except Exception as e:
                print(f"DEBUG: Could not initialize EasyOCR: {e}")
                logger.warning(f"Could not initialize EasyOCR: {e}")
        return self._easy_ocr

    def _extract_single_image(self, str_path: str, page: int = 1) -> List[OCRResult]:
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
                        txt = str(item.get("text", "")).strip()
                        if not txt:
                            continue
                        bbox = item.get("bbox", [0, 0, 0, 0])
                        polygon = [[bbox[0], bbox[1]], [bbox[2], bbox[1]], [bbox[2], bbox[3]], [bbox[0], bbox[3]]]
                        ocr_results.append(
                            OCRResult(
                                text=txt,
                                confidence=float(item.get("confidence", 0.95)),
                                bbox=bbox,
                                polygon=polygon,
                                source="winocr_isolated",
                                page=page,
                                image_path=str_path
                            )
                        )
            except Exception as e:
                logger.warning(f"Native Windows OCR runner error: {e}")

        # 2. Secondary Engine: PaddleOCR (Deep learning fallback)
        if len(ocr_results) < 15:
            paddle_instance = self._get_paddle_ocr()
            if paddle_instance is not None:
                try:
                    results = list(paddle_instance.predict(str_path))
                except Exception:
                    try:
                        results = paddle_instance.ocr(str_path)
                    except Exception:
                        results = []

                for result in results:
                    if isinstance(result, dict):
                        texts = result.get("rec_texts", [])
                        scores = result.get("rec_scores", [])
                        boxes = result.get("rec_boxes", [])
                        polygons = result.get("rec_polys", [])

                        for idx, text in enumerate(texts):
                            txt = str(text).strip()
                            if not txt:
                                continue
                            score = float(scores[idx]) if idx < len(scores) else 1.0
                            box = boxes[idx] if idx < len(boxes) else None
                            poly = polygons[idx] if idx < len(polygons) else None

                            polygon_points = []
                            if poly is not None:
                                polygon_points = [[int(p[0]), int(p[1])] for p in poly]

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
                                    text=txt,
                                    confidence=max(0.0, min(1.0, float(score))),
                                    bbox=bbox,
                                    polygon=polygon_points,
                                    source="paddleocr",
                                    page=page,
                                    image_path=str_path
                                )
                            )

                    elif isinstance(result, list):
                        for item in result:
                            if not item or len(item) < 2:
                                continue
                            poly_points = item[0]
                            text_score = item[1]
                            text = text_score[0] if isinstance(text_score, (list, tuple)) else str(text_score)
                            txt = str(text).strip()
                            if not txt:
                                continue
                            score = float(text_score[1]) if isinstance(text_score, (list, tuple)) and len(text_score) > 1 else 1.0

                            polygon_points = [[int(p[0]), int(p[1])] for p in poly_points] if poly_points else []
                            if polygon_points:
                                xs = [p[0] for p in polygon_points]
                                ys = [p[1] for p in polygon_points]
                                bbox = [min(xs), min(ys), max(xs), max(ys)]
                            else:
                                bbox = [0, 0, 0, 0]

                            ocr_results.append(
                                OCRResult(
                                    text=txt,
                                    confidence=max(0.0, min(1.0, float(score))),
                                    bbox=bbox,
                                    polygon=polygon_points,
                                    source="paddleocr",
                                    page=page,
                                    image_path=str_path
                                )
                            )

        # 3. Tertiary Engine: EasyOCR Cross-Platform Fallback
        if len(ocr_results) < 15:
            easy_ocr = self._get_easy_ocr()
            if easy_ocr is not None:
                try:
                    e_results = easy_ocr.readtext(str_path)
                    for bbox_poly, text, score in e_results:
                        txt = str(text).strip()
                        if not txt:
                            continue
                        polygon_points = [[int(p[0]), int(p[1])] for p in bbox_poly] if bbox_poly else []
                        if polygon_points:
                            xs = [p[0] for p in polygon_points]
                            ys = [p[1] for p in polygon_points]
                            bbox = [min(xs), min(ys), max(xs), max(ys)]
                        else:
                            bbox = [0, 0, 0, 0]

                        ocr_results.append(
                            OCRResult(
                                text=txt,
                                confidence=max(0.0, min(1.0, float(score))),
                                bbox=bbox,
                                polygon=polygon_points,
                                source="easyocr",
                                page=page,
                                image_path=str_path
                            )
                        )
                except Exception as e:
                    print(f"EasyOCR extraction exception: {e}")
                    logger.warning(f"EasyOCR extraction warning: {e}")

        # 4. Quaternary Engine: PyTesseract Fallback
        if len(ocr_results) < 5 and HAS_PYTESSERACT:
            try:
                img_pil = Image.open(str_path)
                text_data = pytesseract.image_to_data(img_pil, output_type=pytesseract.Output.DICT)
                n_boxes = len(text_data.get('text', []))
                for i in range(n_boxes):
                    txt = text_data['text'][i].strip()
                    conf = float(text_data['conf'][i])
                    if txt and conf > 0:
                        x, y, w, h = text_data['left'][i], text_data['top'][i], text_data['width'][i], text_data['height'][i]
                        ocr_results.append(
                            OCRResult(
                                text=txt,
                                confidence=min(1.0, conf / 100.0),
                                bbox=[x, y, x + w, y + h],
                                polygon=[[x, y], [x + w, y], [x + w, y + h], [x, y + h]],
                                source="tesseract",
                                page=page,
                                image_path=str_path
                            )
                        )
            except Exception as e:
                logger.warning(f"PyTesseract extraction warning: {e}")

        return ocr_results

    def extract_text(self, image_path: str, page: int = 1) -> List[OCRResult]:
        image = Path(image_path)

        if not image.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        str_path = str(image)
        combined_results: List[OCRResult] = self._extract_single_image(str_path, page=page)
        existing_texts = {r.text.strip().lower() for r in combined_results if r.text.strip()}

        # If extracted text count is low or to catch vertical/sideways product text, run multi-angle rotation (90°, 180°, 270°)
        if len(combined_results) < 12:
            try:
                img_pil = Image.open(str_path)
                temp_dir = image.parent
                for angle in [90, 180, 270]:
                    rot_img = img_pil.rotate(angle, expand=True)
                    rot_path = temp_dir / f"_temp_rot_{angle}_{image.name}"
                    rot_img.save(rot_path)
                    try:
                        rot_results = self._extract_single_image(str(rot_path), page=page)
                        for r in rot_results:
                            clean_t = r.text.strip().lower()
                            if len(clean_t) >= 2 and clean_t not in existing_texts:
                                existing_texts.add(clean_t)
                                combined_results.append(r)
                    finally:
                        if rot_path.exists():
                            try:
                                rot_path.unlink()
                            except Exception:
                                pass
            except Exception as e:
                logger.warning(f"Multi-angle auto-rotation extraction warning: {e}")

        return combined_results