import sys
import json
from pathlib import Path
from PIL import Image

try:
    import winocr
except ImportError:
    print(json.dumps([]))
    sys.exit(0)

def main():
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(0)

    image_path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "en"

    try:
        pil_img = Image.open(image_path)
        if pil_img.mode not in ("RGB", "L"):
            pil_img = pil_img.convert("RGB")
            
        res = winocr.recognize_pil_sync(pil_img, lang=lang)
        lines = []
        for l in res.get("lines", []):
            words = l.get("words", [])
            if not words:
                continue
            min_x = min(w["bounding_rect"]["x"] for w in words)
            min_y = min(w["bounding_rect"]["y"] for w in words)
            max_x = max(w["bounding_rect"]["x"] + w["bounding_rect"]["width"] for w in words)
            max_y = max(w["bounding_rect"]["y"] + w["bounding_rect"]["height"] for w in words)
            lines.append({
                "text": str(l.get("text", "")).strip(),
                "bbox": [int(min_x), int(min_y), int(max_x), int(max_y)],
                "confidence": 0.95
            })
        print(json.dumps(lines))
    except Exception:
        print(json.dumps([]))

if __name__ == "__main__":
    main()
