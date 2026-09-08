from ocr import OCREngine


IMAGE_PATH = "test_images/package1.jpg"


def main():

    print("\nInitializing OCR engine...")

    ocr_engine = OCREngine()

    print("Running OCR...\n")

    results = ocr_engine.extract_text(IMAGE_PATH)

    print("=" * 70)
    print("OCR RESULTS")
    print("=" * 70)

    print(f"\nTotal text regions detected: {len(results)}\n")

    for index, result in enumerate(results, start=1):

        print(f"[{index}]")
        print(f"Text       : {result.text}")
        print(f"Confidence : {result.confidence:.3f}")
        print(f"BBox       : {result.bbox}")
        print(f"Polygon    : {result.polygon}")
        print(f"Source     : {result.source}")
        print("-" * 70)


if __name__ == "__main__":
    main()