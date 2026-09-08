import sys
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ocr import (
    OCREngine,
    group_into_lines,
    line_to_text,
    normalize_text,
    detect_declaration_labels,
    build_normalized_ocr_output
)

IMAGE_PATH = Path("test_images/package1.jpg")
if not IMAGE_PATH.exists():
    IMAGE_PATH = Path(__file__).resolve().parent.parent / "test_images" / "package1.jpg"


def main():

    print("\nInitializing OCR engine...")
    engine = OCREngine()

    print(f"Running OCR on {IMAGE_PATH}...\n")
    results = engine.extract_text(str(IMAGE_PATH))

    print(f"Raw OCR regions: {len(results)}")

    # --------------------------------------------------
    # GROUP OCR RESULTS INTO LINES
    # --------------------------------------------------
    lines = group_into_lines(results)
    print(f"Grouped lines: {len(lines)}")

    print("\n" + "=" * 70)
    print("GROUPED OCR TEXT")
    print("=" * 70)

    for index, line in enumerate(lines, start=1):
        text = line_to_text(line)
        print(f"[{index:02d}] {text}")

    # --------------------------------------------------
    # UNIFIED NORMALIZED OUTPUT
    # --------------------------------------------------
    normalized_output = build_normalized_ocr_output(results)

    print("\n" + "=" * 70)
    print("PHASE 4 — UNIFIED NORMALIZED OUTPUT")
    print("=" * 70)
    print(f"Total Regions : {normalized_output.get('total_regions')}")
    print(f"Dates         : {normalized_output.get('dates')}")
    print(f"Phone Numbers : {normalized_output.get('phone_numbers')}")
    print(f"Emails        : {normalized_output.get('emails')}")
    print(f"Addresses     : {normalized_output.get('addresses')}")


if __name__ == "__main__":
    main()