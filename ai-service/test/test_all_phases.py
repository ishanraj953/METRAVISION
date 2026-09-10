import os
import sys
import json
import unittest
import numpy as np
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from preprocessing import (
    preprocess_image,
    validate_image,
    assess_image_quality,
    check_blur,
    check_glare,
    check_darkness
)
from ocr import (
    OCREngine,
    OCRResult,
    draw_ocr_results,
    normalize_text,
    normalize_unit,
    normalize_currency,
    normalize_date,
    normalize_phone,
    normalize_email,
    normalize_address,
    detect_declaration_labels,
    build_normalized_ocr_output,
    classify_confidence,
    build_ocr_evidence,
    extract_declarations,
    extract_mrp,
    extract_net_quantity,
    extract_unit_sale_price,
    extract_manufacturer
)
from pipeline import process_package, METRAVisionPipeline


class TestMETRAVisionAllPhases(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.image_path = Path(__file__).resolve().parent.parent / "test_images" / "package1.jpg"
        if not cls.image_path.exists():
            cls.image_path = Path("test_images/package1.jpg")

    # =========================================================
    # PHASE 1: PREPROCESSING & VALIDATION
    # =========================================================
    def test_phase1_validation_and_preprocessing(self):
        print("\n[TEST] Phase 1: Image Input & Preprocessing...")
        if not self.image_path.exists():
            self.skipTest(f"Test image not found at {self.image_path}")

        # Test valid image
        processed_img, meta = preprocess_image(str(self.image_path), save_output=True)
        self.assertIsNotNone(processed_img)
        self.assertTrue(meta["valid"])
        self.assertGreater(meta["width"], 0)
        self.assertGreater(meta["height"], 0)
        self.assertIn(meta["format"].lower(), ["jpg", "jpeg", "png", "webp"])
        self.assertTrue(meta["processing"]["clahe"])
        self.assertTrue(meta["processing"]["grayscale"])

        # Test invalid file
        bad_img, bad_meta = preprocess_image("non_existent_file.xyz", save_output=False)
        self.assertIsNone(bad_img)
        self.assertFalse(bad_meta["valid"])
        print("  -> Phase 1 validation and preprocessing passed.")

    # =========================================================
    # PHASE 2: QUALITY GATE
    # =========================================================
    def test_phase2_quality_gate(self):
        print("\n[TEST] Phase 2: Image Quality Gate...")
        if not self.image_path.exists():
            self.skipTest(f"Test image not found at {self.image_path}")

        quality = assess_image_quality(str(self.image_path))
        self.assertIn("quality_score", quality)
        self.assertIn("usable", quality)
        self.assertIn("blur", quality)
        self.assertIn("glare", quality)
        self.assertIn("resolution_ok", quality)
        self.assertIn("status", quality)
        self.assertIn(quality["status"], ["USABLE", "INSUFFICIENT EVIDENCE"])

        # Test simulated dark/degraded image -> INSUFFICIENT EVIDENCE
        dark_img = np.zeros((600, 800, 3), dtype=np.uint8)
        dark_quality = assess_image_quality(dark_img)
        self.assertFalse(dark_quality["usable"])
        self.assertEqual(dark_quality["status"], "INSUFFICIENT EVIDENCE")
        print("  -> Phase 2 quality gate & INSUFFICIENT EVIDENCE check passed.")

    # =========================================================
    # PHASE 3: OCR ENGINE
    # =========================================================
    def test_phase3_ocr_engine(self):
        print("\n[TEST] Phase 3: OCR Engine Extraction...")
        if not self.image_path.exists():
            self.skipTest(f"Test image not found at {self.image_path}")

        engine = OCREngine()
        results = engine.extract_text(str(self.image_path))
        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)

        first = results[0]
        self.assertIsInstance(first, OCRResult)
        self.assertIsInstance(first.text, str)
        self.assertIsInstance(first.confidence, float)
        self.assertEqual(len(first.bbox), 4)
        self.assertEqual(first.source, "ocr")
        print(f"  -> Phase 3 OCR extracted {len(results)} text blocks successfully.")

    # =========================================================
    # PHASE 4: OCR POST-PROCESSING & NORMALIZATION
    # =========================================================
    def test_phase4_normalization(self):
        print("\n[TEST] Phase 4: OCR Post-Processing & Normalization...")

        # MRP normalization
        self.assertEqual(normalize_text("M.R.P. Rs.499/-"), "MRP Rs 499/-")
        self.assertEqual(normalize_text("MRP: ₹ 1,299"), "MRP Rs 1,299")

        # Units normalization
        self.assertEqual(normalize_unit("KG"), "kg")
        self.assertEqual(normalize_unit("GMS"), "g")
        self.assertEqual(normalize_unit("milliliters"), "ml")
        self.assertEqual(normalize_unit("LITRES"), "L")

        # Phone numbers
        phones = normalize_phone("+91 98765 43210")
        self.assertEqual(phones, "+919876543210")
        tollfree = normalize_phone("1800-111-222")
        self.assertEqual(tollfree, "1800111222")

        # Email
        emails = normalize_email("Customercare@Nestle.Com")
        self.assertEqual(emails, "customercare@nestle.com")

        # Dates
        self.assertEqual(normalize_date("15.08.2024"), "15/08/2024")
        self.assertEqual(normalize_date("15-08-2024"), "15/08/2024")

        print("  -> Phase 4 normalization rules passed.")

    # =========================================================
    # PHASE 5: OCR CONFIDENCE & VISUALIZATION
    # =========================================================
    def test_phase5_confidence_and_visualization(self):
        print("\n[TEST] Phase 5: OCR Confidence & Bounding Box System...")
        self.assertEqual(classify_confidence(0.95), "high")
        self.assertEqual(classify_confidence(0.75), "medium")
        self.assertEqual(classify_confidence(0.40), "low")

        mock_result = OCRResult(
            text="Net Qty 500 g",
            confidence=0.94,
            bbox=[100, 200, 350, 250],
            polygon=[[100, 200], [350, 200], [350, 250], [100, 250]],
            source="ocr"
        )
        evidence = build_ocr_evidence(mock_result)
        self.assertEqual(evidence["text"], "Net Qty 500 g")
        self.assertEqual(evidence["confidence_level"], "high")
        self.assertEqual(evidence["bbox"], [100, 200, 350, 250])

        if self.image_path.exists():
            out_vis = "processed/test_vis.jpg"
            saved = draw_ocr_results(str(self.image_path), [mock_result], out_vis)
            self.assertTrue(os.path.exists(saved))
            if os.path.exists(saved):
                os.remove(saved)

        print("  -> Phase 5 confidence evidence & visualization passed.")

    # =========================================================
    # PHASE 6: DECLARATION INTELLIGENCE
    # =========================================================
    def test_phase6_declaration_extraction(self):
        print("\n[TEST] Phase 6: Declaration Intelligence (10 Legal Fields)...")
        mock_ocr = [
            OCRResult("Cadbury Dairy Milk Silk", 0.98, [50, 50, 400, 100]),
            OCRResult("Manufactured by Mondelez India Foods Pvt Ltd, Mumbai 400018", 0.95, [50, 120, 500, 150]),
            OCRResult("Packed by Packaging Hub Ltd, Solan, HP", 0.93, [50, 160, 450, 190]),
            OCRResult("Imported by Global Imports India, New Delhi", 0.91, [50, 200, 450, 230]),
            OCRResult("Net Quantity: 150 g", 0.96, [50, 240, 300, 270]),
            OCRResult("MRP Rs. 175.00 (incl. of all taxes)", 0.97, [50, 280, 350, 310]),
            OCRResult("Unit Sale Price: Rs. 1.17 / g", 0.94, [50, 320, 350, 350]),
            OCRResult("MFD DATE: 12/03/2024", 0.92, [50, 360, 300, 390]),
            OCRResult("Consumer Care: 1800-22-8282 / care@mondelez.com", 0.95, [50, 400, 550, 430]),
            OCRResult("Country of Origin: India", 0.96, [50, 440, 300, 470]),
        ]

        decl = extract_declarations(mock_ocr)
        fields = decl["fields"]

        self.assertIsNotNone(fields["product_name"])
        self.assertIsNotNone(fields["manufacturer"])
        self.assertIn("Mondelez", fields["manufacturer"]["value"])
        self.assertIsNotNone(fields["packer"])
        self.assertIsNotNone(fields["importer"])
        self.assertIsNotNone(fields["net_quantity"])
        self.assertEqual(fields["net_quantity"]["unit"], "g")
        self.assertIsNotNone(fields["mrp"])
        self.assertIn("175", fields["mrp"]["value"])
        self.assertIsNotNone(fields["unit_sale_price"])
        self.assertIsNotNone(fields["manufacturing_date"])
        self.assertIsNotNone(fields["consumer_care"])
        self.assertIsNotNone(fields["country_of_origin"])

        self.assertGreaterEqual(decl["detected_field_count"], 10)
        print("  -> Phase 6 extracted all 10 Legal Metrology declaration fields successfully.")

    # =========================================================
    # END-TO-END PIPELINE TEST
    # =========================================================
    def test_complete_end_to_end_pipeline(self):
        print("\n[TEST] Complete End-to-End Pipeline...")
        if not self.image_path.exists():
            self.skipTest(f"Test image not found at {self.image_path}")

        pipeline = METRAVisionPipeline()
        res = pipeline.process_package(str(self.image_path), generate_visualization=True)

        self.assertEqual(res["status"], "SUCCESS")
        self.assertIn("preprocessing", res)
        self.assertIn("quality", res)
        self.assertIn("ocr", res)
        self.assertIn("normalized", res)
        self.assertIn("evidence", res)
        self.assertIn("declarations", res)
        self.assertIn("visualization", res)
        print("  -> Complete 6-phase pipeline integration test passed.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
