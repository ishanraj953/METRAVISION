import sys
from pathlib import Path
import unittest

# Add ai-service project root to Python path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ocr.ocr_result import OCRResult
from ocr.field_detector import detect_fields
from ocr.field_detector import detect_fields


class TestPhase7FieldDetection(unittest.TestCase):

    def test_net_quantity(self):

        results = [
            OCRResult(
                text="N.QTY:",
                confidence=0.999,
                bbox=[0, 100, 100, 140],
                polygon=[
                    [0, 100],
                    [100, 100],
                    [100, 140],
                    [0, 140],
                ],
            )
        ]

        detections = detect_fields(results)

        self.assertEqual(len(detections), 1)
        self.assertEqual(
            detections[0].field,
            "net_quantity"
        )

    def test_mrp(self):

        results = [
            OCRResult(
                text="MRP Rs. 10.00",
                confidence=0.99,
                bbox=[0, 200, 200, 240],
                polygon=[
                    [0, 200],
                    [200, 200],
                    [200, 240],
                    [0, 240],
                ],
            )
        ]

        detections = detect_fields(results)

        self.assertEqual(len(detections), 1)
        self.assertEqual(
            detections[0].field,
            "mrp"
        )

    def test_manufacturer_requires_explicit_label(self):

        results = [
            OCRResult(
                text="PEPSICO INDIA HOLDINGS PVT. LTD.",
                confidence=0.98,
                bbox=[0, 300, 300, 340],
                polygon=[
                    [0, 300],
                    [300, 300],
                    [300, 340],
                    [0, 340],
                ],
            )
        ]

        detections = detect_fields(results)

        self.assertEqual(len(detections), 0)

    def test_explicit_manufacturer(self):

        results = [
            OCRResult(
                text="MANUFACTURED BY PEPSICO INDIA",
                confidence=0.98,
                bbox=[0, 400, 300, 440],
                polygon=[
                    [0, 400],
                    [300, 400],
                    [300, 440],
                    [0, 440],
                ],
            )
        ]

        detections = detect_fields(results)

        self.assertEqual(len(detections), 1)
        self.assertEqual(
            detections[0].field,
            "manufacturer"
        )


if __name__ == "__main__":
    unittest.main()