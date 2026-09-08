import sys
from pathlib import Path
import unittest
import json


# ============================================================
# ADD PROJECT ROOT TO PYTHON PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

sys.path.insert(
    0,
    str(PROJECT_ROOT)
)


# ============================================================
# IMPORTS
# ============================================================

from ocr.ocr_result import OCRResult
from ocr.ocr_engine import OCREngine
from ocr.declaration_extractor import extract_declarations


# ============================================================
# TEST CLASS
# ============================================================

class TestPhase6DeclarationIntelligence(unittest.TestCase):

    # --------------------------------------------------------
    # SETUP
    # --------------------------------------------------------

    @classmethod
    def setUpClass(cls):

        cls.image_path = (
            PROJECT_ROOT
            / "test_images"
            / "package1.jpg"
        )

        cls.output_dir = (
            PROJECT_ROOT
            / "processed"
        )

        cls.output_dir.mkdir(
            exist_ok=True
        )

    # ========================================================
    # TEST 1
    # UNIT TEST — ALL 10 DECLARATIONS
    # ========================================================

    def test_phase6_all_10_fields(self):

        print(
            "\n"
            + "=" * 70
        )
        print(
            "PHASE 6 — DECLARATION INTELLIGENCE UNIT TEST"
        )
        print(
            "=" * 70
        )

        # ----------------------------------------------------
        # Controlled OCR input
        # ----------------------------------------------------

        mock_ocr = [

            OCRResult(
                text="Cadbury Dairy Milk Silk",
                confidence=0.98,
                bbox=[50, 50, 400, 100],
                polygon=[
                    [50, 50],
                    [400, 50],
                    [400, 100],
                    [50, 100]
                ]
            ),

            OCRResult(
                text=(
                    "Manufactured by Mondelez India Foods "
                    "Pvt Ltd, Mumbai 400018"
                ),
                confidence=0.95,
                bbox=[50, 120, 500, 150],
                polygon=[
                    [50, 120],
                    [500, 120],
                    [500, 150],
                    [50, 150]
                ]
            ),

            OCRResult(
                text=(
                    "Packed by Packaging Hub Ltd, "
                    "Solan, HP"
                ),
                confidence=0.93,
                bbox=[50, 160, 450, 190],
                polygon=[
                    [50, 160],
                    [450, 160],
                    [450, 190],
                    [50, 190]
                ]
            ),

            OCRResult(
                text=(
                    "Imported by Global Imports India, "
                    "New Delhi"
                ),
                confidence=0.91,
                bbox=[50, 200, 450, 230],
                polygon=[
                    [50, 200],
                    [450, 200],
                    [450, 230],
                    [50, 230]
                ]
            ),

            OCRResult(
                text="Net Quantity: 150 g",
                confidence=0.96,
                bbox=[50, 240, 300, 270],
                polygon=[
                    [50, 240],
                    [300, 240],
                    [300, 270],
                    [50, 270]
                ]
            ),

            OCRResult(
                text=(
                    "MRP Rs. 175.00 "
                    "(incl. of all taxes)"
                ),
                confidence=0.97,
                bbox=[50, 280, 350, 310],
                polygon=[
                    [50, 280],
                    [350, 280],
                    [350, 310],
                    [50, 310]
                ]
            ),

            OCRResult(
                text="Unit Sale Price: Rs. 1.17 / g",
                confidence=0.94,
                bbox=[50, 320, 350, 350],
                polygon=[
                    [50, 320],
                    [350, 320],
                    [350, 350],
                    [50, 350]
                ]
            ),

            OCRResult(
                text="MFD DATE: 12/03/2024",
                confidence=0.92,
                bbox=[50, 360, 300, 390],
                polygon=[
                    [50, 360],
                    [300, 360],
                    [300, 390],
                    [50, 390]
                ]
            ),

            OCRResult(
                text=(
                    "Consumer Care: 1800-22-8282 / "
                    "care@mondelez.com"
                ),
                confidence=0.95,
                bbox=[50, 400, 550, 430],
                polygon=[
                    [50, 400],
                    [550, 400],
                    [550, 430],
                    [50, 430]
                ]
            ),

            OCRResult(
                text="Country of Origin: India",
                confidence=0.96,
                bbox=[50, 440, 300, 470],
                polygon=[
                    [50, 440],
                    [300, 440],
                    [300, 470],
                    [50, 470]
                ]
            )
        ]

        # ----------------------------------------------------
        # Run Phase 6
        # ----------------------------------------------------

        result = extract_declarations(
            mock_ocr
        )

        self.assertIsInstance(
            result,
            dict
        )

        self.assertIn(
            "fields",
            result
        )

        fields = result["fields"]

        # ----------------------------------------------------
        # Verify all 10 fields
        # ----------------------------------------------------

        expected_fields = [
            "product_name",
            "manufacturer",
            "packer",
            "importer",
            "net_quantity",
            "mrp",
            "manufacturing_date",
            "consumer_care",
            "country_of_origin",
            "unit_sale_price"
        ]

        for field in expected_fields:

            self.assertIn(
                field,
                fields
            )

            self.assertIsNotNone(
                fields[field],
                f"{field} was not detected"
            )

            print(
                f"[PASS] {field}"
            )

        # ----------------------------------------------------
        # Specific validations
        # ----------------------------------------------------

        self.assertIn(
            "Mondelez",
            fields["manufacturer"]["value"]
        )

        self.assertEqual(
            fields["net_quantity"]["unit"],
            "g"
        )

        self.assertIn(
            "175",
            str(fields["mrp"]["value"])
        )

        self.assertIn(
            "india",
            fields["country_of_origin"]["value"].lower()
        )

        # ----------------------------------------------------
        # Count
        # ----------------------------------------------------

        self.assertEqual(
            result["detected_field_count"],
            10
        )

        print(
            "\nAll 10 declaration fields detected."
        )

    # ========================================================
    # TEST 2
    # REAL OCR → PHASE 6
    # ========================================================

    def test_phase6_real_ocr_image(self):

        print(
            "\n"
            + "=" * 70
        )
        print(
            "PHASE 6 — REAL IMAGE OCR INTEGRATION TEST"
        )
        print(
            "=" * 70
        )

        # ----------------------------------------------------
        # Check image
        # ----------------------------------------------------

        if not self.image_path.exists():

            self.skipTest(
                f"Test image not found: "
                f"{self.image_path}"
            )

        print(
            f"Input image: {self.image_path}"
        )

        # ----------------------------------------------------
        # Phase 3 — OCR
        # ----------------------------------------------------

        print(
            "\nRunning PaddleOCR..."
        )

        engine = OCREngine()

        ocr_results = engine.extract_text(
            str(self.image_path)
        )

        self.assertIsInstance(
            ocr_results,
            list
        )

        self.assertGreater(
            len(ocr_results),
            0
        )

        print(
            f"OCR regions: {len(ocr_results)}"
        )

        # ----------------------------------------------------
        # Phase 6
        # ----------------------------------------------------

        print(
            "\nRunning declaration extraction..."
        )

        declarations = extract_declarations(
            ocr_results
        )

        self.assertIsInstance(
            declarations,
            dict
        )

        self.assertIn(
            "fields",
            declarations
        )

        fields = declarations["fields"]

        # ----------------------------------------------------
        # Display extracted declarations
        # ----------------------------------------------------

        print(
            "\n"
            + "-" * 70
        )

        print(
            "EXTRACTED DECLARATIONS"
        )

        print(
            "-" * 70
        )

        for field_name, field_data in fields.items():

            print(
                f"\n{field_name}:"
            )

            if field_data is None:

                print(
                    "  NOT DETECTED"
                )

                continue

            print(
                f"  Value      : "
                f"{field_data.get('value')}"
            )

            print(
                f"  Confidence : "
                f"{field_data.get('confidence')}"
            )

            print(
                f"  Status     : "
                f"{field_data.get('status')}"
            )

            print(
                f"  BBox       : "
                f"{field_data.get('bbox')}"
            )

        # ----------------------------------------------------
        # Basic integrity checks
        # ----------------------------------------------------

        self.assertIn(
            "detected_field_count",
            declarations
        )

        self.assertIn(
            "candidates",
            declarations
        )

        print(
            "\n"
            + "-" * 70
        )

        print(
            "Detected fields: "
            f"{declarations['detected_field_count']}"
        )

        print(
            "Total candidates: "
            f"{declarations['total_candidates']}"
        )

        # ----------------------------------------------------
        # Save Phase 6 result
        # ----------------------------------------------------

        output_file = (
            self.output_dir
            / "phase6_declarations.json"
        )

        with open(
            output_file,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                declarations,
                file,
                indent=2,
                ensure_ascii=False
            )

        print(
            f"\nPhase 6 result saved to:"
        )

        print(
            output_file
        )

        print(
            "\nReal OCR → Declaration extraction "
            "test completed."
        )

    # ========================================================
    # TEST 3
    # EMPTY OCR INPUT
    # ========================================================

    def test_phase6_empty_ocr(self):

        print(
            "\n"
            + "=" * 70
        )

        print(
            "PHASE 6 — EMPTY OCR TEST"
        )

        print(
            "=" * 70
        )

        result = extract_declarations(
            []
        )

        self.assertIsInstance(
            result,
            dict
        )

        self.assertIn(
            "fields",
            result
        )

        self.assertEqual(
            result["detected_field_count"],
            0
        )

        print(
            "Empty OCR handled correctly."
        )


# ============================================================
# RUN TESTS
# ============================================================

if __name__ == "__main__":

    unittest.main(
        verbosity=2
    )