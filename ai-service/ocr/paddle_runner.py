import sys
import json

try:
    import paddlex.inference.models.runners.paddle_static.config.pp_option as pp_option
    if hasattr(pp_option, 'MKLDNN_BLOCKLIST'):
        if 'PP-OCRv6_medium_det' not in pp_option.MKLDNN_BLOCKLIST:
            pp_option.MKLDNN_BLOCKLIST.append('PP-OCRv6_medium_det')
        if 'PP-OCRv6_medium_rec' not in pp_option.MKLDNN_BLOCKLIST:
            pp_option.MKLDNN_BLOCKLIST.append('PP-OCRv6_medium_rec')
except Exception:
    pass

from paddleocr import PaddleOCR

def main():
    if len(sys.argv) < 2:
        print(json.dumps([]))
        return
    img = sys.argv[1]
    engine = PaddleOCR(lang='en', device='cpu', use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False, text_det_limit_side_len=640, text_recognition_batch_size=16)
    try:
        results = list(engine.predict(img))
    except Exception:
        try:
            results = engine.ocr(img)
        except Exception:
            results = []
    
    out = []
    for r in results:
        if isinstance(r, dict):
            texts = r.get('rec_texts', [])
            scores = r.get('rec_scores', [])
            boxes = r.get('rec_boxes', [])
            for i, t in enumerate(texts):
                b = boxes[i] if i < len(boxes) else [0,0,0,0]
                s = scores[i] if i < len(scores) else 1.0
                out.append({'text': str(t).strip(), 'confidence': float(s), 'bbox': [int(b[0]), int(b[1]), int(b[2]), int(b[3])]})
    print(json.dumps(out))

if __name__ == '__main__':
    main()
