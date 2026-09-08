import sys
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ocr import OCREngine, draw_ocr_results, extract_declarations


IMAGE_PATH = Path("test_images/package1.jpg")
if not IMAGE_PATH.exists():
    IMAGE_PATH = Path(__file__).resolve().parent.parent / "test_images" / "package1.jpg"

OUTPUT_PATH = Path("processed/ocr_visualized.jpg")


def main():

    print("\nInitializing OCR engine...")
    ocr_engine = OCREngine()

    print(f"Running OCR on {IMAGE_PATH}...\n")
    results = ocr_engine.extract_text(str(IMAGE_PATH))

    print(f"Detected {len(results)} text regions.")

    print("Extracting declaration fields for overlay labeling...")
    declarations = extract_declarations(results)

    print(f"Drawing annotated bounding boxes and saving to {OUTPUT_PATH}...")
    saved_path = draw_ocr_results(
        image_path=str(IMAGE_PATH),
        results=results,
        output_path=str(OUTPUT_PATH),
        declarations=declarations
    )

    print(f"\nVisualization successfully saved to: {saved_path}")


if __name__ == "__main__":
    main()