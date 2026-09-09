import unittest

from ocr.font_size import estimate_font_size


class TestFontSize(unittest.TestCase):

    def test_pixel_estimate(self):
        result = estimate_font_size(
            field="mrp",
            bbox=[100, 200, 300, 218],
            confidence=0.72,
        )

        self.assertEqual(result.unit, "px")
        self.assertEqual(result.measurement_type, "image_geometry_estimate")
        self.assertEqual(result.estimated_height, 18.0)

        print("\nPHASE 13 — FONT SIZE")
        print("-" * 50)
        print(f"Field             : {result.field}")
        print(f"Estimated height  : {result.estimated_height} {result.unit}")
        print(f"Confidence        : {result.confidence}")
        print(f"Measurement type  : {result.measurement_type}")

    def test_mm_estimate_with_reference(self):
        result = estimate_font_size(
            field="mrp",
            bbox=[100, 200, 300, 218],
            reference_mm_per_pixel=0.1,
            confidence=0.72,
        )

        self.assertEqual(result.unit, "mm")
        self.assertEqual(result.estimated_height, 1.8)
        self.assertEqual(result.measurement_type, "estimated")


if __name__ == "__main__":
    unittest.main(verbosity=2)