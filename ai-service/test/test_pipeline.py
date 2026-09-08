import json
import sys
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(
    0,
    str(Path(__file__).resolve().parent.parent)
)

from pipeline import process_package

# ============================================================
# Configuration
# ============================================================

IMAGE_PATH = Path("test_images/package1.jpg")
if not IMAGE_PATH.exists():
    IMAGE_PATH = Path(__file__).resolve().parent.parent / "test_images" / "package1.jpg"


def main():

    print("=" * 70)
    print("METRAVISION — COMPLETE 6-PHASE AI PIPELINE TEST")
    print("=" * 70)

    if not IMAGE_PATH.exists():
        print(f"\nERROR: Image not found: {IMAGE_PATH}")
        return

    print(f"\nInput Image : {IMAGE_PATH}")
    print("Starting pipeline...\n")

    result = process_package(
        str(IMAGE_PATH)
    )

    print("-" * 70)
    print("PIPELINE STATUS")
    print("-" * 70)

    status = result.get("status")
    print(f"Status  : {status}")
    print(f"Message : {result.get('message', 'N/A')}")

    if status == "INVALID_IMAGE":
        print("\n❌ INVALID IMAGE")
        print(result.get("preprocessing", {}).get("message", "Image validation failed."))
        return

    if status == "INSUFFICIENT_EVIDENCE":
        print("\n⚠️ INSUFFICIENT EVIDENCE (Quality Gate Rejected)")
        quality = result.get("quality", {})
        print(f"Quality Score : {quality.get('quality_score')}")
        print(f"Blur          : {quality.get('blur')}")
        print(f"Resolution OK : {quality.get('resolution_ok')}")
        print(f"Glare         : {quality.get('glare')}")
        print(f"Contrast Poor : {quality.get('poor_contrast')}")
        print(f"Perspective   : {quality.get('extreme_perspective')}")
        print(f"Occlusion     : {quality.get('possible_occlusion')}")
        print(f"Reason        : {quality.get('message')}")
        return

    print("\n✅ PIPELINE EXECUTED SUCCESSFULLY")

    # Phase 1
    prep = result.get("preprocessing", {})
    print("\n" + "-" * 70)
    print("PHASE 1 — IMAGE PREPROCESSING")
    print("-" * 70)
    print(f"Valid       : {prep.get('valid')}")
    print(f"Dimensions  : {prep.get('width')}x{prep.get('height')}")
    print(f"Format      : {prep.get('format')}")
    print(f"File Size   : {prep.get('file_size_mb')} MB")
    print(f"Output Path : {prep.get('output_path')}")

    # Phase 2
    qual = result.get("quality", {})
    print("\n" + "-" * 70)
    print("PHASE 2 — IMAGE QUALITY GATE")
    print("-" * 70)
    print(f"Quality Score : {qual.get('quality_score')}")
    print(f"Usable        : {qual.get('usable')}")
    print(f"Status        : {qual.get('status')}")

    # Phase 3
    ocr = result.get("ocr", {})
    print("\n" + "-" * 70)
    print("PHASE 3 — OCR ENGINE")
    print("-" * 70)
    print(f"Total Detected Regions : {ocr.get('total_regions')}")
    for idx, item in enumerate(ocr.get("results", [])[:5], start=1):
        print(f"  {idx:02d}. '{item.get('text')}' (conf={item.get('confidence'):.3f}, bbox={item.get('bbox')})")

    # Phase 4
    norm = result.get("normalized", {})
    print("\n" + "-" * 70)
    print("PHASE 4 — OCR POST-PROCESSING & NORMALIZATION")
    print("-" * 70)
    print(f"Total Normalized Regions : {norm.get('total_regions')}")
    print(f"Dates Extracted          : {norm.get('dates')}")
    print(f"Phone Numbers            : {norm.get('phone_numbers')}")
    print(f"Emails Extracted         : {norm.get('emails')}")

    # Phase 5
    evidence = result.get("evidence", [])
    print("\n" + "-" * 70)
    print("PHASE 5 — CONFIDENCE & BOUNDING BOX EVIDENCE")
    print("-" * 70)
    print(f"Evidence Regions Count : {len(evidence)}")
    vis = result.get("visualization", {})
    print(f"Visualization Saved To : {vis.get('annotated_image_path')}")

    # Phase 6
    decl = result.get("declarations", {})
    print("\n" + "-" * 70)
    print("PHASE 6 — DECLARATION INTELLIGENCE (LEGAL METROLOGY FIELDS)")
    print("-" * 70)
    print(f"Detected Fields Count : {decl.get('detected_field_count')} / 10")
    print(f"Total Candidates      : {decl.get('total_candidates')}")
    print("\nLegal Declarations Extracted:")
    for field_name, val_dict in decl.get("fields", {}).items():
        if val_dict:
            print(f"  • {field_name.upper():<22}: {val_dict.get('value')} (conf={val_dict.get('confidence'):.2f})")
        else:
            print(f"  • {field_name.upper():<22}: [NOT FOUND]")

    # Save output JSON
    output_dir = Path("processed")
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "pipeline_result.json"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4, ensure_ascii=False, default=str)

    print("\n" + "=" * 70)
    print(f"TEST COMPLETE — Pipeline JSON saved to: {json_path}")
    print("=" * 70)


if __name__ == "__main__":
    main()