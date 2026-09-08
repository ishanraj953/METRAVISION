import sys
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ocr import OCREngine


IMAGE_PATH = Path("test_images/package1.jpg")
if not IMAGE_PATH.exists():
    IMAGE_PATH = Path(__file__).resolve().parent.parent / "test_images" / "package1.jpg"


def main():

    print("\nInitializing OCR engine...")
    ocr_engine = OCREngine()

    print(f"Running OCR on {IMAGE_PATH}...\n")
    results = ocr_engine.extract_text(str(IMAGE_PATH))

    print("=" * 70)
    print("PHASE 3 — OCR RESULTS")
    print("=" * 70)

    print(f"\nTotal text regions detected: {len(results)}\n")

    for index, result in enumerate(results, start=1):
        print(f"[{index:02d}]")
        print(f"Text       : {result.text}")
        print(f"Confidence : {result.confidence:.3f}")
        print(f"BBox       : {result.bbox}")
        print(f"Polygon    : {result.polygon}")
        print(f"Source     : {result.source}")
        print("-" * 70)


if __name__ == "__main__":
    main()