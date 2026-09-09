import unittest
from pathlib import Path
from types import SimpleNamespace

from ocr.violation_heatmap import generate_violation_heatmap


class TestViolationHeatmap(unittest.TestCase):

    def test_heatmap(self):
        base = Path(__file__).resolve().parent.parent

        image = base / "test_images" / "package1.jpg"
        output = base / "processed" / "violation_heatmap.jpg"

        violations = [
            SimpleNamespace(
                violation_type="LOW_CONTRAST",
                severity="MEDIUM",
                bbox=[100, 200, 300, 230],
            ),
            SimpleNamespace(
                violation_type="POOR_READABILITY",
                severity="HIGH",
                bbox=[100, 240, 350, 275],
            ),
        ]

        result = generate_violation_heatmap(
            str(image),
            violations,
            str(output),
        )

        self.assertTrue(Path(result).exists())

        print("\nPHASE 15 — VIOLATION HEATMAP")
        print("-" * 50)
        print(f"Input image  : {image}")
        print(f"Output image : {result}")
        print(f"Violations   : {len(violations)}")


if __name__ == "__main__":
    unittest.main(verbosity=2)