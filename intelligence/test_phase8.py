from product_classifier import (
    classify_product,
    classify_from_ocr_results,
)


# ============================================================
# TEST HELPER
# ============================================================

def run_test(
    test_name,
    input_text,
    expected_category
):

    result = classify_product(
        input_text
    )

    passed = (
        result["category"]
        == expected_category
    )

    print("\n--------------------------------------")
    print(test_name)
    print("--------------------------------------")

    print("Input      :", input_text)
    print("Category   :", result["category"])
    print("Confidence :", result["confidence"])
    print("Expected   :", expected_category)

    if passed:
        print("Result     : PASS")
    else:
        print("Result     : FAIL")

    return passed


# ============================================================
# OCR INTEGRATION TEST
# ============================================================

def run_ocr_test():

    ocr_results = [
        {"text": "Samsung"},
        {"text": "Smartphone"},
        {"text": "128 GB"},
        {"text": "Charger"},
    ]

    result = classify_from_ocr_results(
        ocr_results
    )

    print("\n--------------------------------------")
    print("OCR INTEGRATION TEST")
    print("--------------------------------------")

    print("OCR Result :", ocr_results)
    print("Output     :", result)

    passed = (
        result["category"]
        == "electronics"
    )

    print(
        "Result     :",
        "PASS" if passed else "FAIL"
    )

    return passed


# ============================================================
# MAIN
# ============================================================

def main():

    print("\n======================================")
    print("     PHASE 8 - PRODUCT CLASSIFICATION")
    print("======================================")

    tests = [

        (
            "Test 1 - Electronics",
            "Samsung smartphone 128 GB charger",
            "electronics",
        ),

        (
            "Test 2 - Food",
            "Biscuits ingredients nutrition 100g",
            "food",
        ),

        (
            "Test 3 - Garment",
            "Men cotton shirt size L",
            "garment",
        ),

        (
            "Test 4 - Imported",
            "Imported product Made in China",
            "imported",
        ),

        (
            "Test 5 - Multi-pack",
            "Pack of 6 chocolate bars",
            "multi-pack",
        ),

        (
            "Test 6 - General",
            "Premium household product",
            "general",
        ),
    ]

    passed = 0
    total = len(tests)

    # Run category tests
    for (
        test_name,
        input_text,
        expected_category
    ) in tests:

        if run_test(
            test_name,
            input_text,
            expected_category
        ):
            passed += 1

    # Run OCR integration test
    if run_ocr_test():
        passed += 1

    total += 1

    # Final result
    print("\n======================================")
    print(
        f"FINAL RESULT: {passed}/{total} tests passed"
    )
    print("======================================")

    if passed == total:
        print("\nPHASE 8 TEST STATUS: PASS")
    else:
        print("\nPHASE 8 TEST STATUS: FAIL")


if __name__ == "__main__":
    main()