import sys
from pathlib import Path
import unittest

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[1])
)

from ocr.ocr_engine import OCREngine
from ocr.field_detector import detect_fields
from ocr.spatial_association import associate_field_values


class TestPhase7RealOCR(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.project_root = Path(__file__).resolve().parents[1]

        cls.image_path = (
            cls.project_root
            / "test_images"
            / "package1.jpg"
        )

        if not cls.image_path.exists():
            raise FileNotFoundError(
                f"Test image not found: {cls.image_path}"
            )

        print("\n" + "=" * 70)
        print("PHASE 7.3 — REAL OCR FIELD DETECTION + ASSOCIATION")
        print("=" * 70)

        print(f"Input image: {cls.image_path}")

        print("\nRunning PaddleOCR...")

        cls.ocr_engine = OCREngine()

        cls.ocr_results = (
            cls.ocr_engine.extract_text(
                str(cls.image_path)
            )
        )

        print(
            f"OCR regions: {len(cls.ocr_results)}"
        )

        print("\nRunning Phase 7.1 — Field Detection...")

        cls.field_detections = detect_fields(
            cls.ocr_results
        )

        print(
            f"Field labels detected: "
            f"{len(cls.field_detections)}"
        )

        print("\nRunning Phase 7.2 — Spatial Association...")

        cls.associations = associate_field_values(
            cls.field_detections,
            cls.ocr_results
        )

        print(
            f"Field/value associations: "
            f"{len(cls.associations)}"
        )

    def test_ocr_regions_exist(self):

        self.assertGreater(
            len(self.ocr_results),
            0
        )

    def test_field_detection_exists(self):

        self.assertGreater(
            len(self.field_detections),
            0
        )

    def test_net_quantity_association(self):

        matches = [
            item
            for item in self.associations
            if item.field == "net_quantity"
        ]

        self.assertGreater(
            len(matches),
            0,
            "Net quantity was not associated"
        )

        value = matches[0].value_text.upper()

        self.assertIn(
            "44",
            value
        )

        print(
            f"\n[PASS] net_quantity → "
            f"{matches[0].value_text}"
        )

    def test_mrp_association(self):

        matches = [
            item
            for item in self.associations
            if item.field == "mrp"
        ]

        self.assertGreater(
            len(matches),
            0,
            "MRP was not associated"
        )

        value = matches[0].value_text.upper()

        self.assertIn(
            "10",
            value
        )

        print(
            f"[PASS] mrp → "
            f"{matches[0].value_text}"
        )

    def test_manufacturing_date_association(self):

        matches = [
            item
            for item in self.associations
            if item.field == "manufacturing_date"
        ]

        self.assertGreater(
            len(matches),
            0,
            "Manufacturing date was not associated"
        )

        value = matches[0].value_text

        self.assertRegex(
            value,
            r"26[/-]02[/-]22"
        )

        print(
            f"[PASS] manufacturing_date → "
            f"{matches[0].value_text}"
        )

    def test_print_all_associations(self):

        print("\n")
        print("-" * 70)
        print("PHASE 7.3 — DETECTED FIELD/VALUE PAIRS")
        print("-" * 70)

        for item in self.associations:

            print(
                f"\nField: {item.field}"
            )

            print(
                f"  Label      : {item.label_text}"
            )

            print(
                f"  Value      : {item.value_text}"
            )

            print(
                f"  Value Conf.: "
                f"{item.value_confidence:.4f}"
            )

            print(
                f"  Association: "
                f"{item.association_confidence:.4f}"
            )

            print(
                f"  Evidence   : {item.evidence}"
            )

        print("\n" + "=" * 70)


if __name__ == "__main__":
    unittest.main()