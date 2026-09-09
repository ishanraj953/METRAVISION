import unittest
from pathlib import Path

from ocr.ocr_engine import OCREngine
from ocr.field_detector import detect_fields
from ocr.readability import analyze_readability


class TestReadability(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.image = Path(__file__).resolve().parent.parent / \
            "test_images" / "package1.jpg"

        cls.ocr = OCREngine()
        cls.results = cls.ocr.extract_text(str(cls.image))

    def test_readability(self):
        fields = detect_fields(self.results)

        self.assertGreater(len(fields), 0)

        detection = fields[0]

        ocr_result = next(
            r for r in self.results
            if r.bbox == detection.bbox
        )

        result = analyze_readability(
            str(self.image),
            detection.field,
            ocr_result,
        )

        self.assertGreaterEqual(result.readability_score, 0)
        self.assertLessEqual(result.readability_score, 1)

        print("\nPHASE 12 — READABILITY")
        print("-" * 50)
        print(f"Field              : {result.field}")
        print(f"Text               : {result.text}")
        print(f"Character height   : {result.character_height_px}px")
        print(f"Contrast           : {result.contrast}")
        print(f"Visibility         : {result.visibility}")
        print(f"Obstruction        : {result.obstruction}")
        print(f"Position           : {result.position}")
        print(f"OCR confidence     : {result.ocr_confidence}")
        print(f"Readability score  : {result.readability_score}")
        print(f"Status             : {result.status}")


if __name__ == "__main__":
    unittest.main(verbosity=2)