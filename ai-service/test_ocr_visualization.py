from ocr import OCREngine, draw_ocr_results


IMAGE_PATH = "test_images/package1.jpg"
OUTPUT_PATH = "processed/ocr_visualized.jpg"


def main():

    print("\nInitializing OCR engine...")

    ocr_engine = OCREngine()

    print("Running OCR...\n")

    results = ocr_engine.extract_text(IMAGE_PATH)

    print(f"Detected {len(results)} text regions.")

    draw_ocr_results(
        IMAGE_PATH,
        results,
        OUTPUT_PATH
    )

    print(f"\nVisualization saved to:")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()