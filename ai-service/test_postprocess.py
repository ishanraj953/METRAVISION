from ocr import (
    OCREngine,
    group_into_lines,
    line_to_text,
    normalize_text,
    detect_declaration_labels
)


IMAGE_PATH = "test_images/package1.jpg"


def main():

    print("\nInitializing OCR engine...")

    engine = OCREngine()

    print("Running OCR...\n")

    results = engine.extract_text(IMAGE_PATH)

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

        print(f"\n[{index}] {text}")

    # --------------------------------------------------
    # DECLARATION CANDIDATE DETECTION
    # --------------------------------------------------

    print("\n" + "=" * 70)
    print("DECLARATION CANDIDATES")
    print("=" * 70)

    for result in results:

        normalized = normalize_text(result.text)

        fields = detect_declaration_labels(
            normalized
        )

        if fields:

            print("\nRaw text:")
            print(result.text)

            print("Normalized:")
            print(normalized)

            print("Detected fields:")
            print(fields)

            print("Confidence:")
            print(f"{result.confidence:.3f}")

            print("BBox:")
            print(result.bbox)


# ------------------------------------------------------
# PROGRAM ENTRY POINT
# ------------------------------------------------------

if __name__ == "__main__":
    main()