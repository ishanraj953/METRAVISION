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
    extract_declarations,
    extract_declaration_value,
    classify_mfd_use_by_dates
)

IMAGE_PATH = Path("test_images/package1.jpg")
if not IMAGE_PATH.exists():
    IMAGE_PATH = Path(__file__).resolve().parent.parent / "test_images" / "package1.jpg"


def main():

    print("\nInitializing OCR engine...")
    ocr_engine = OCREngine()

    print(f"Running OCR on {IMAGE_PATH}...\n")
    results = ocr_engine.extract_text(str(IMAGE_PATH))

    print(f"Raw OCR regions: {len(results)}")

    print("\n" + "=" * 70)
    print("PHASE 6 — EXTRACTED DECLARATIONS (ALL 10 LEGAL METROLOGY FIELDS)")
    print("=" * 70)

    declarations = extract_declarations(results)

    print(f"\nTotal Candidates Detected : {declarations.get('total_candidates')}")
    print(f"Unique Legal Fields Found : {declarations.get('detected_field_count')} / 10\n")

    for field_name, item in declarations.get("fields", {}).items():
        print("-" * 50)
        print(f"FIELD: {field_name.upper()}")
        if item:
            print(f"  Value       : {item.get('value')}")
            print(f"  Confidence  : {item.get('confidence')}")
            print(f"  Raw Text    : {item.get('raw_text')}")
            print(f"  BBox        : {item.get('bbox')}")
            if "unit" in item:
                print(f"  Unit        : {item.get('unit')}")
            if "currency" in item:
                print(f"  Currency    : {item.get('currency')}")
        else:
            print("  Status      : NOT FOUND")

    print("-" * 50)


if __name__ == "__main__":
    main()