import json
import unittest
from pathlib import Path

from ocr.ocr_engine import OCREngine
from ocr.declaration_pipeline import DeclarationPipeline


class TestDeclarationPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.image_path = (
            Path(__file__).resolve().parent.parent
            / "test_images"
            / "package1.jpg"
        )

        if not cls.image_path.exists():
            raise FileNotFoundError(
                f"Test image not found: {cls.image_path}"
            )

        print("\nRunning OCR on master test image...")
        cls.ocr_engine = OCREngine()
        cls.ocr_results = cls.ocr_engine.extract_text(
            str(cls.image_path)
        )

        print(f"OCR regions: {len(cls.ocr_results)}")

    def test_phase8_unified_pipeline(self):

        pipeline = DeclarationPipeline()

        result = pipeline.process(
            ocr_results=self.ocr_results,
            image_usable=True,
        )

        self.assertEqual(result["status"], "SUCCESS")

        self.assertIn("field_detections", result)
        self.assertIn("associations", result)
        self.assertIn("normalized_declarations", result)
        self.assertIn("declaration_status", result)
        self.assertIn("structured_declarations", result)
        self.assertIn("declarations", result)

        print("\n" + "=" * 70)
        print("PHASE 8 — UNIFIED DECLARATION INTELLIGENCE")
        print("=" * 70)

        print(
            f"\nField labels detected       : "
            f"{len(result['field_detections'])}"
        )

        print(
            f"Field/value associations   : "
            f"{len(result['associations'])}"
        )

        print(
            f"Normalized declarations    : "
            f"{len(result['normalized_declarations'])}"
        )

        print("\nDECLARATION STATUS")

        for field, assessment in result["declaration_status"].items():
            print(
                f"{field:25} "
                f"{assessment['status']:22} "
                f"confidence={assessment['confidence']:.4f}"
            )

        print("\nUNIFIED DECLARATIONS")

        for field, declaration in result["declarations"].items():

            print(f"\n{field}")
            print(f"  Value        : {declaration['value']}")
            print(
                f"  Normalized   : "
                f"{declaration['normalized_value']}"
            )
            print(
                f"  Status       : "
                f"{declaration['status']}"
            )
            print(
                f"  Confidence   : "
                f"{declaration['confidence']:.4f}"
            )
            print(
                f"  Source       : "
                f"{declaration['source']}"
            )
            print(
                f"  Evidence     : "
                f"{len(declaration['evidence'])}"
            )

        print("\n" + "=" * 70)

    def test_phase8_json_serializable(self):

        pipeline = DeclarationPipeline()

        result = pipeline.process(
            ocr_results=self.ocr_results,
            image_usable=True,
        )

        # Make sure the complete result can be converted to JSON.
        json.dumps(result, default=str)

        print("\n[PASS] Phase 8 result is JSON serializable")


if __name__ == "__main__":
    unittest.main(verbosity=2)