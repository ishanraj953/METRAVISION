from multilingual_processor import (
    detect_language,
    detect_script,
    normalize_field,
    extract_value,
    process_text,
    process_ocr_results,
)


# ============================================================
# LANGUAGE + FIELD TESTS
# ============================================================

def test_english():
    result = process_text("Manufacturer: ABC Pvt Ltd")

    assert result["language"] == "en"
    assert result["script"] == "Latin"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("English: PASS")


def test_hindi():
    result = process_text("निर्माता: ABC Pvt Ltd")

    assert result["language"] == "hi"
    assert result["script"] == "Devanagari"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Hindi: PASS")


def test_telugu():
    result = process_text("తయారీదారు: ABC Pvt Ltd")

    assert result["language"] == "te"
    assert result["script"] == "Telugu"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Telugu: PASS")


def test_gujarati():
    result = process_text("ઉત્પાદક: ABC Pvt Ltd")

    assert result["language"] == "gu"
    assert result["script"] == "Gujarati"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Gujarati: PASS")


def test_bengali():
    result = process_text("প্রস্তুতকারক: ABC Pvt Ltd")

    assert result["language"] == "bn"
    assert result["script"] == "Bengali"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Bengali: PASS")


def test_tamil():
    result = process_text("உற்பத்தியாளர்: ABC Pvt Ltd")

    assert result["language"] == "ta"
    assert result["script"] == "Tamil"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Tamil: PASS")


def test_kannada():
    result = process_text("ತಯಾರಕರು: ABC Pvt Ltd")

    assert result["language"] == "kn"
    assert result["script"] == "Kannada"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Kannada: PASS")


def test_malayalam():
    result = process_text("നിർമ്മാതാവ്: ABC Pvt Ltd")

    assert result["language"] == "ml"
    assert result["script"] == "Malayalam"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Malayalam: PASS")


def test_punjabi():
    result = process_text("ਨਿਰਮਾਤਾ: ABC Pvt Ltd")

    assert result["language"] == "pa"
    assert result["script"] == "Gurmukhi"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Punjabi: PASS")


def test_odia():
    result = process_text("ଉତ୍ପାଦକ: ABC Pvt Ltd")

    assert result["language"] == "or"
    assert result["script"] == "Odia"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"

    print("Odia: PASS")


def test_santali():
    result = process_text("ᱛᱟᱭᱟᱨᱤ: ABC Pvt Ltd")

    assert result["script"] == "Ol Chiki"
    assert result["field"] == "manufacturer"

    print("Santali: PASS")


# ============================================================
# SCRIPT DETECTION
# ============================================================

def test_mixed_hindi_english_script():
    text = "निर्माता: ABC Pvt Ltd"

    script = detect_script(text)

    assert script == "Devanagari"

    print("Mixed Hindi + English Script: PASS")


def test_telugu_english_script():
    text = "తయారీదారు: ABC Pvt Ltd"

    script = detect_script(text)

    assert script == "Telugu"

    print("Mixed Telugu + English Script: PASS")


def test_gujarati_english_script():
    text = "ઉત્પાદક: ABC Pvt Ltd"

    script = detect_script(text)

    assert script == "Gujarati"

    print("Mixed Gujarati + English Script: PASS")


# ============================================================
# FIELD NORMALIZATION
# ============================================================

def test_manufacturer_field():

    assert normalize_field(
        "Manufacturer: ABC"
    ) == "manufacturer"

    assert normalize_field(
        "निर्माता: ABC"
    ) == "manufacturer"

    assert normalize_field(
        "తయారీదారు: ABC"
    ) == "manufacturer"

    print("Manufacturer Field Normalization: PASS")


def test_mrp_field():

    assert normalize_field(
        "MRP: ₹499"
    ) == "mrp"

    assert normalize_field(
        "एमआरपी: ₹499"
    ) == "mrp"

    print("MRP Field Normalization: PASS")


def test_net_quantity_field():

    assert normalize_field(
        "Net Quantity: 500 g"
    ) == "net_quantity"

    assert normalize_field(
        "शुद्ध मात्रा: 500 ग्राम"
    ) == "net_quantity"

    print("Net Quantity Field Normalization: PASS")


def test_consumer_care_field():

    assert normalize_field(
        "Consumer Care: 1800123456"
    ) == "consumer_care"

    assert normalize_field(
        "उपभोक्ता सेवा: 1800123456"
    ) == "consumer_care"

    print("Consumer Care Field Normalization: PASS")


def test_manufacturing_date_field():

    assert normalize_field(
        "Manufacturing Date: 09/09/2026"
    ) == "manufacturing_date"

    assert normalize_field(
        "निर्माण तिथि: 09/09/2026"
    ) == "manufacturing_date"

    print("Manufacturing Date Field Normalization: PASS")


# ============================================================
# VALUE EXTRACTION
# ============================================================

def test_manufacturer_value():

    value = extract_value(
        "Manufacturer: ABC Pvt Ltd",
        "manufacturer"
    )

    assert value == "ABC Pvt Ltd"

    print("Manufacturer Value Extraction: PASS")


def test_hindi_manufacturer_value():

    value = extract_value(
        "निर्माता: ABC Pvt Ltd",
        "manufacturer"
    )

    assert value == "ABC Pvt Ltd"

    print("Hindi Manufacturer Value Extraction: PASS")


def test_mrp_value():

    value = extract_value(
        "MRP: ₹499",
        "mrp"
    )

    assert value == "₹499"

    print("MRP Value Extraction: PASS")


def test_quantity_value():

    value = extract_value(
        "Net Quantity: 500 g",
        "net_quantity"
    )

    assert value == "500 g"

    print("Quantity Value Extraction: PASS")


def test_date_value():

    value = extract_value(
        "Manufacturing Date: 09/09/2026",
        "manufacturing_date"
    )

    assert value == "09/09/2026"

    print("Manufacturing Date Value Extraction: PASS")


# ============================================================
# COMPLETE PROCESSING
# ============================================================

def test_complete_processing():

    result = process_text(
        "निर्माता: ABC Pvt Ltd"
    )

    assert result["language"] == "hi"
    assert result["language_name"] == "Hindi"
    assert result["script"] == "Devanagari"
    assert result["field"] == "manufacturer"
    assert result["value"] == "ABC Pvt Ltd"
    assert result["raw_text"] == "निर्माता: ABC Pvt Ltd"

    print("Complete Hindi Processing: PASS")


# ============================================================
# OCR BATCH PROCESSING
# ============================================================

def test_ocr_processing():

    ocr_results = [

        {
            "text": "Manufacturer: ABC Pvt Ltd"
        },

        {
            "text": "निर्माता: XYZ Pvt Ltd"
        },

        {
            "text": "తయారీదారు: PQR Pvt Ltd"
        },

        {
            "text": "ઉત્પાદક: DEF Pvt Ltd"
        }
    ]

    results = process_ocr_results(
        ocr_results
    )

    assert len(results) == 4

    assert results[0]["language"] == "en"
    assert results[1]["language"] == "hi"
    assert results[2]["language"] == "te"
    assert results[3]["language"] == "gu"

    for result in results:
        assert result["field"] == "manufacturer"

    print("OCR Batch Processing: PASS")


# ============================================================
# EDGE CASES
# ============================================================

def test_empty_text():

    result = process_text("")

    assert result["language"] == "unknown"
    assert result["script"] == "Unknown"
    assert result["field"] == "unknown"
    assert result["value"] == ""

    print("Empty Text Handling: PASS")


def test_none_text():

    result = process_text(None)

    assert result["language"] == "unknown"
    assert result["script"] == "Unknown"
    assert result["field"] == "unknown"

    print("None Text Handling: PASS")


def test_unknown_text():

    result = process_text(
        "ABC XYZ 12345"
    )

    assert result["language"] == "en"
    assert result["script"] == "Latin"
    assert result["field"] == "unknown"

    print("Unknown Declaration Handling: PASS")


# ============================================================
# DEVANAGARI AMBIGUITY
# ============================================================

def test_devanagari_ambiguity():

    result = process_text(
        "यह एक सामान्य वाक्य है"
    )

    assert result["script"] == "Devanagari"

    # Language should remain conservative when
    # there is no strong declaration vocabulary.
    assert result["language"] == "unknown"

    print("Devanagari Ambiguity Handling: PASS")


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("======================================")
    print("   PHASE 9 - MULTILINGUAL PROCESSING")
    print("======================================")

    # Languages
    test_english()
    test_hindi()
    test_telugu()
    test_gujarati()
    test_bengali()
    test_tamil()
    test_kannada()
    test_malayalam()
    test_punjabi()
    test_odia()
    test_santali()

    # Script detection
    test_mixed_hindi_english_script()
    test_telugu_english_script()
    test_gujarati_english_script()

    # Field normalization
    test_manufacturer_field()
    test_mrp_field()
    test_net_quantity_field()
    test_consumer_care_field()
    test_manufacturing_date_field()

    # Value extraction
    test_manufacturer_value()
    test_hindi_manufacturer_value()
    test_mrp_value()
    test_quantity_value()
    test_date_value()

    # Complete processing
    test_complete_processing()

    # OCR
    test_ocr_processing()

    # Edge cases
    test_empty_text()
    test_none_text()
    test_unknown_text()

    # Ambiguity
    test_devanagari_ambiguity()

    print()
    print("======================================")
    print("PHASE 9 TEST STATUS: PASS")
    print("======================================")


if __name__ == "__main__":
    main()