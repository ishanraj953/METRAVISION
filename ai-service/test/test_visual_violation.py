import unittest
from types import SimpleNamespace

from ocr.visual_violation import detect_visual_violations


class TestVisualViolation(unittest.TestCase):

    def test_low_readability(self):
        readability = SimpleNamespace(
            field="mrp",
            status="LOW_READABILITY",
            readability_score=0.42,
            contrast=0.25,
            obstruction=0.0,
            bbox=[100, 200, 300, 220],
        )

        result = detect_visual_violations(readability)

        self.assertGreaterEqual(len(result), 2)

        print("\nPHASE 14 — VISUAL VIOLATIONS")
        print("-" * 50)

        for violation in result:
            print(f"Type       : {violation.violation_type}")
            print(f"Field      : {violation.field}")
            print(f"Severity   : {violation.severity}")
            print(f"Confidence : {violation.confidence:.2f}")
            print(f"Message    : {violation.message}")
            print()

    def test_font_size_warning(self):
        readability = SimpleNamespace(
            field="mrp",
            status="READABLE",
            readability_score=0.80,
            contrast=0.70,
            obstruction=0.0,
            bbox=[100, 200, 300, 220],
        )

        font_size = SimpleNamespace(
            field="mrp",
            estimated_height=0.8,
            unit="mm",
            confidence=0.72,
            bbox=[100, 200, 300, 220],
        )

        result = detect_visual_violations(
            readability,
            font_size,
        )

        self.assertTrue(
            any(
                v.violation_type == "POSSIBLE_FONT_SIZE_ISSUE"
                for v in result
            )
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)