from ocr import (
    OCREngine,
    extract_declaration_value
)

from ocr.declaration_extractor import (
    classify_mfd_use_by_dates
)

IMAGE_PATH = "test_images/package1.jpg"


def main():

    print("\nInitializing OCR engine...")

    ocr_engine = OCREngine()

    print("Running OCR...\n")

    results = ocr_engine.extract_text(
        IMAGE_PATH
    )

    print(f"Raw OCR regions: {len(results)}")

    print("\n")
    print("=" * 70)
    print("EXTRACTED DECLARATIONS")
    print("=" * 70)

    total = 0

    for result in results:

        declarations = extract_declaration_value(
            result
        )

        for declaration in declarations:

            total += 1

            print()

            print(
                f"Field       : "
                f"{declaration['field']}"
            )

            print(
                f"Value       : "
                f"{declaration['value']}"
            )

            if "unit" in declaration:

                print(
                    f"Unit        : "
                    f"{declaration['unit']}"
                )

            if "currency" in declaration:

                print(
                    f"Currency    : "
                    f"{declaration['currency']}"
                )

            print(
                f"Raw text    : "
                f"{declaration['raw_text']}"
            )

            print(
                f"Confidence  : "
                f"{declaration['confidence']:.3f}"
            )

            print(
                f"BBox        : "
                f"{declaration['bbox']}"
            )

    print("\n")
    print("=" * 70)
    print(
        f"Total extracted values: {total}"
    )
    print("=" * 70)

    print("\n")
    print("=" * 70)
    print("ALL OCR REGIONS")
    print("=" * 70)

    for index, result in enumerate(results, start=1):

        print(
            f"[{index}] "
            f"{result.text} "
            f"| confidence={result.confidence:.3f} "
            f"| bbox={result.bbox}"
        )

    # ========================================================
    # CLASSIFIED DATES
    # ========================================================

    classified_dates = classify_mfd_use_by_dates(results)

    print("\n")
    print("=" * 70)
    print("CLASSIFIED DATES")
    print("=" * 70)

    for declaration in classified_dates:

        print()

        print(
            f"Field       : {declaration['field']}"
        )

        print(
            f"Value       : {declaration['value']}"
        )

        print(
            f"Raw text    : {declaration['raw_text']}"
        )

        print(
            f"Confidence  : "
            f"{declaration['confidence']:.3f}"
        )

        print(
            f"BBox        : {declaration['bbox']}"
        )

if __name__ == "__main__":
    main()