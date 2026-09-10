import os
import sys
from pathlib import Path
import pytest

# Ensure project root & ai-service are in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

from ocr.ocr_result import OCRResult
from multilingual.multilingual_processor import (
    detect_script,
    detect_language,
    convert_indic_digits,
    translate_legal_terms,
    MultilingualProcessor,
    get_multilingual_processor
)
from pipeline import process_package


def test_script_detection():
    assert detect_script("Hello World") == "LATIN"
    assert detect_script("अधिकतम खुदरा मूल्य") == "DEVANAGARI"
    assert detect_script("அதிகபட்ச சில்லறை விலை") == "TAMIL"
    assert detect_script("గరిష్ట రిటైల్ ధర") == "TELUGU"
    assert detect_script("મહત્તમ છૂટક કિંમત") == "GUJARATI"
    assert detect_script("সর্বোচ্চ খুচরা মূল্য") == "BENGALI"


def test_language_detection():
    assert detect_language("Hello World") == "en"
    assert detect_language("अधिकतम खुदरा मूल्य") == "hi"
    assert detect_language("அதிகபட்ச சில்லறை விலை") == "ta"
    assert detect_language("గరిష్ట రిటైల్ ధర") == "te"


def test_indic_digit_conversion():
    # Hindi/Devanagari numerals
    assert convert_indic_digits("₹५००") == "₹500"
    assert convert_indic_digits("मात्रा: २५० ग्राम") == "मात्रा: 250 ग्राम"
    # Gujarati numerals
    assert convert_indic_digits("જથ્થો: ૧૦૦ ગ્રામ") == "જથ્થો: 100 ગ્રામ"
    # Bengali numerals
    assert convert_indic_digits("দাম: ৫০ টাকা") == "দাম: 50 টাকা"


def test_translate_legal_terms():
    # Hindi MRP
    translated, fields = translate_legal_terms("अधिकतम खुदरा मूल्य: ₹५००")
    assert "MRP" in translated
    assert "500" in translated
    assert "mrp" in fields

    # Hindi Net Quantity
    translated_qty, fields_qty = translate_legal_terms("शुद्ध मात्रा: ५०० ग्राम")
    assert "NET QUANTITY" in translated_qty
    assert "500" in translated_qty
    assert "net_quantity" in fields_qty

    # Hindi Manufacturer
    translated_mfg, fields_mfg = translate_legal_terms("निर्माता: एबीसी प्राइवेट लिमिटेड")
    assert "MANUFACTURED BY" in translated_mfg
    assert "manufacturer" in fields_mfg


def test_multilingual_processor_ocr_results():
    mp = get_multilingual_processor()

    results = [
        OCRResult(
            text="अधिकतम खुदरा मूल्य: ₹२९९",
            confidence=0.95,
            bbox=[10, 10, 100, 30],
            source="ocr"
        ),
        OCRResult(
            text="शुद्ध मात्रा: १०० ग्राम",
            confidence=0.92,
            bbox=[10, 40, 100, 60],
            source="ocr"
        ),
        OCRResult(
            text="MRP Rs. 150",
            confidence=0.98,
            bbox=[10, 70, 100, 90],
            source="ocr"
        )
    ]

    processed = mp.process_ocr_results(results)

    assert processed[0].script == "DEVANAGARI"
    assert processed[0].language == "hi"
    assert "MRP" in processed[0].text
    assert "299" in processed[0].text

    assert processed[1].script == "DEVANAGARI"
    assert "NET QUANTITY" in processed[1].text
    assert "100" in processed[1].text

    assert processed[2].script == "LATIN"
    assert processed[2].language == "en"


def test_declaration_enrichment():
    mp = get_multilingual_processor()

    ocr_res = OCRResult(
        text="निर्माता: एक्सवाईज़ उद्योग",
        confidence=0.95,
        bbox=[10, 10, 200, 40]
    )
    mp.process_ocr_results([ocr_res])

    declarations = {
        "fields": {
            "mrp": {"value": "₹100"},
            "manufacturer": None
        }
    }

    enriched = mp.enrich_declarations(declarations, [ocr_res])
    assert enriched["fields"]["manufacturer"] is not None
    assert enriched["fields"]["manufacturer"]["status"] == "detected_multilingual"


def test_pipeline_multilingual_integration():
    img_path = Path(AI_SERVICE_DIR) / "preprocessing" / "input" / "image.png"
    if not img_path.exists():
        pytest.skip("Test image not found")

    res = process_package(str(img_path))
    assert res["status"] == "SUCCESS"
    assert "multilingual" in res
    assert res["multilingual"].get("multilingual_active") is True
