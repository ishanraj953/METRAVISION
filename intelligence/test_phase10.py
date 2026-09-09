from declaration_confidence import (
    get_confidence_level,
    calculate_confidence,
    add_confidence,
    process_declarations,
)


def test_high_confidence():
    assert get_confidence_level(0.97) == "HIGH"
    assert get_confidence_level(0.86) == "HIGH"
    print("HIGH confidence: PASS")


def test_medium_confidence():
    assert get_confidence_level(0.85) == "MEDIUM"
    assert get_confidence_level(0.70) == "MEDIUM"
    print("MEDIUM confidence: PASS")


def test_manual_review():
    assert get_confidence_level(0.69) == "MANUAL_REVIEW"
    assert get_confidence_level(0.40) == "MANUAL_REVIEW"
    print("MANUAL REVIEW: PASS")


def test_confidence_calculation():
    result = calculate_confidence(0.97, 1.0)
    assert result == 0.97

    result = calculate_confidence(0.90, 0.80)
    assert result == 0.72

    print("Confidence calculation: PASS")


def test_add_confidence():
    result = add_confidence(
        field="mrp",
        value="₹499",
        ocr_confidence=0.97
    )

    assert result["field"] == "mrp"
    assert result["value"] == "₹499"
    assert result["confidence"] == 0.97
    assert result["level"] == "HIGH"
    assert result["manual_review"] is False

    print("Add confidence: PASS")


def test_manual_review_field():
    result = add_confidence(
        field="manufacturer",
        value="ABC Pvt Ltd",
        ocr_confidence=0.63
    )

    assert result["confidence"] == 0.63
    assert result["level"] == "MANUAL_REVIEW"
    assert result["manual_review"] is True

    print("Manual review field: PASS")


def test_multiple_declarations():

    declarations = {
        "mrp": {
            "value": "₹499",
            "confidence": 0.97
        },
        "manufacturer": {
            "value": "ABC Pvt Ltd",
            "confidence": 0.63
        },
        "net_quantity": {
            "value": "500 g",
            "confidence": 0.78
        }
    }

    result = process_declarations(declarations)

    assert result["mrp"]["level"] == "HIGH"
    assert result["manufacturer"]["level"] == "MANUAL_REVIEW"
    assert result["net_quantity"]["level"] == "MEDIUM"

    assert result["mrp"]["manual_review"] is False
    assert result["manufacturer"]["manual_review"] is True
    assert result["net_quantity"]["manual_review"] is False

    print("Multiple declarations: PASS")


def test_invalid_confidence():

    # Negative value should become 0
    assert calculate_confidence(-0.5, 1.0) == 0.0

    # Value greater than 1 should become 1
    assert calculate_confidence(1.5, 1.0) == 1.0

    print("Invalid confidence handling: PASS")


def main():

    print("=" * 40)
    print("PHASE 10 - DECLARATION CONFIDENCE TEST")
    print("=" * 40)

    test_high_confidence()
    test_medium_confidence()
    test_manual_review()
    test_confidence_calculation()
    test_add_confidence()
    test_manual_review_field()
    test_multiple_declarations()
    test_invalid_confidence()

    print("=" * 40)
    print("PHASE 10 STATUS: PASS")
    print("=" * 40)


if __name__ == "__main__":
    main()