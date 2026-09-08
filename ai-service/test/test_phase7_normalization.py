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
from ocr.declaration_normalizer import (
    normalize_declarations,
    build_normalized_declaration_map,
)
from ocr.declaration_normalizer import (
    normalize_declarations,
    build_normalized_declaration_map,
    build_structured_declarations,
)

class TestPhase7Normalization(unittest.TestCase):

    @classmethod
    def setUpClass(cls):

        root = Path(__file__).resolve().parents[1]

        image_path = (
            root
            / "test_images"
            / "package1.jpg"
        )

        print("\n" + "=" * 70)
        print("PHASE 7.4 — DECLARATION NORMALIZATION")
        print("=" * 70)

        print(
            f"Input image: {image_path}"
        )

        ocr_results = OCREngine().extract_text(
            str(image_path)
        )

        print(
            f"OCR regions: {len(ocr_results)}"
        )

        fields = detect_fields(
            ocr_results
        )

        print(
            f"Fields detected: {len(fields)}"
        )

        associations = associate_field_values(
            fields,
            ocr_results
        )

        print(
            f"Associations: {len(associations)}"
        )

        cls.declarations = normalize_declarations(
            associations
        )

        cls.declaration_map = (
            build_normalized_declaration_map(
                cls.declarations
            )
        )
        cls.structured = build_structured_declarations(
            cls.declarations
        )

    def test_consumer_care_aggregation(self):

        self.assertIn(
            "consumer_care",
            self.structured
        )

        consumer_care = (
            self.structured["consumer_care"]["value"]
        )

        self.assertEqual(
        consumer_care["phone"],
        "1800224020"
        )

        self.assertEqual(
            consumer_care["email"],
            "consumer.feedback@pepsico.com"
        )

        print(
            "\n[PASS] Consumer Care → "
            f"{consumer_care}"
        )

    def test_mrp_normalization(self):

        self.assertIn(
            "mrp",
            self.declaration_map
        )

        item = self.declaration_map[
            "mrp"
        ][0]

        self.assertEqual(
            item["normalized_value"],
            "10.00"
        )

        print(
            f"\n[PASS] MRP → "
            f"{item['normalized_value']}"
        )

    def test_net_quantity_normalization(self):

        self.assertIn(
            "net_quantity",
            self.declaration_map
        )

        item = self.declaration_map[
            "net_quantity"
        ][0]

        self.assertTrue(
            item["normalized_value"]
            .startswith("44 g")
        )

        print(
            f"[PASS] Net Quantity → "
            f"{item['normalized_value']}"
        )

    def test_manufacturing_date_normalization(self):

        self.assertIn(
            "manufacturing_date",
            self.declaration_map
        )

        item = self.declaration_map[
            "manufacturing_date"
        ][0]

        self.assertEqual(
            item["normalized_value"],
            "2022-02-26"
        )

        print(
            f"[PASS] Manufacturing Date → "
            f"{item['normalized_value']}"
        )

    def test_print_normalized_output(self):

        print("\n")
        print("-" * 70)
        print("NORMALIZED DECLARATIONS")
        print("-" * 70)

        for field, values in (
            self.declaration_map.items()
        ):

            for value in values:

                print(
                    f"\nField: {field}"
                )

                print(
                    f"  Raw        : "
                    f"{value['raw_text']}"
                )

                print(
                    f"  Value      : "
                    f"{value['value']}"
                )

                print(
                    f"  Normalized : "
                    f"{value['normalized_value']}"
                )

                print(
                    f"  Confidence : "
                    f"{value['confidence']:.4f}"
                )

        print("\n" + "=" * 70)


if __name__ == "__main__":
    unittest.main()