import sys
from pathlib import Path
import unittest

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[1])
)

from ocr.ocr_engine import OCREngine
from ocr.field_detector import detect_fields
from ocr.spatial_association import (
    associate_field_values,
)
from ocr.declaration_normalizer import (
    normalize_declarations,
    build_normalized_declaration_map,
)
from ocr.declaration_status import (
    assess_all_declarations,
    DeclarationStatus,
)


class TestPhase7Status(unittest.TestCase):

    @classmethod
    def setUpClass(cls):

        root = Path(__file__).resolve().parents[1]

        image_path = (
            root
            / "test_images"
            / "package1.jpg"
        )

        print("\n" + "=" * 70)
        print(
            "PHASE 7.5 — DECLARATION "
            "CONFIDENCE & COMPLETENESS"
        )
        print("=" * 70)

        ocr_results = OCREngine().extract_text(
            str(image_path)
        )

        fields = detect_fields(
            ocr_results
        )

        associations = associate_field_values(
            fields,
            ocr_results
        )

        declarations = normalize_declarations(
            associations
        )

        declaration_map = (
            build_normalized_declaration_map(
                declarations
            )
        )

        cls.assessments = (
            assess_all_declarations(
                declaration_map,
                image_usable=True,
            )
        )

    def test_mrp_detected(self):

        result = self.assessments["mrp"]

        self.assertEqual(
            result["status"],
            DeclarationStatus.DETECTED.value
        )

        self.assertEqual(
            result["value"],
            "10.00"
        )

        print(
            "\n[PASS] MRP → "
            f"{result['status']}"
        )

    def test_net_quantity_detected(self):

        result = self.assessments[
            "net_quantity"
        ]

        self.assertEqual(
            result["status"],
            DeclarationStatus.DETECTED.value
        )

        print(
            "[PASS] Net Quantity → "
            f"{result['status']}"
        )

    def test_manufacturing_date_detected(self):

        result = self.assessments[
            "manufacturing_date"
        ]

        self.assertEqual(
            result["status"],
            DeclarationStatus.DETECTED.value
        )

        print(
            "[PASS] Manufacturing Date → "
            f"{result['status']}"
        )

    def test_missing_field_status(self):

        result = self.assessments[
            "manufacturer"
        ]

        self.assertEqual(
            result["status"],
            DeclarationStatus.NOT_DETECTED.value
        )

        print(
            "[PASS] Manufacturer → "
            f"{result['status']}"
        )

    def test_bad_image_status(self):

        result = self.assessments[
            "manufacturer"
        ]

        # Simulate an unusable image.
        from ocr.declaration_status import (
            assess_declaration_status
        )

        result = assess_declaration_status(
            field="manufacturer",
            declarations=[],
            image_usable=False,
        )

        self.assertEqual(
            result.status,
            DeclarationStatus.INSUFFICIENT_EVIDENCE
        )

        print(
            "[PASS] Bad image → "
            f"{result.status.value}"
        )

    def test_print_all_statuses(self):

        print("\n")
        print("-" * 70)
        print("DECLARATION STATUS")
        print("-" * 70)

        for field, result in (
            self.assessments.items()
        ):

            print(
                f"{field:25} "
                f"{result['status']:22} "
                f"confidence="
                f"{result['confidence']:.4f}"
            )

        print("-" * 70)


if __name__ == "__main__":
    unittest.main()