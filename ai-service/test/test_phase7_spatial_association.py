import sys
from pathlib import Path
import unittest

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[1])
)

from ocr.ocr_result import OCRResult
from ocr.field_detector import detect_fields
from ocr.spatial_association import associate_field_values


def make_result(
    text,
    confidence,
    bbox
):
    x1, y1, x2, y2 = bbox

    return OCRResult(
        text=text,
        confidence=confidence,
        bbox=bbox,
        polygon=[
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2],
        ],
    )


class TestPhase7SpatialAssociation(unittest.TestCase):

    def test_net_quantity_same_line(self):

        results = [
            make_result(
                "N.QTY:",
                0.9999,
                [0, 852, 117, 914]
            ),
            make_result(
                "44 g",
                0.9605,
                [175, 847, 567, 914]
            ),
        ]

        fields = detect_fields(results)

        associations = associate_field_values(
            fields,
            results
        )

        self.assertEqual(
            len(associations),
            1
        )

        self.assertEqual(
            associations[0].field,
            "net_quantity"
        )

        self.assertEqual(
            associations[0].value_text,
            "44 g"
        )

        self.assertIn(
            "same_line",
            associations[0].evidence
        )

    def test_mfd_date_association(self):

        results = [
            make_result(
                "MFD:",
                1.0,
                [0, 1046, 90, 1104]
            ),
            make_result(
                "26/02/22",
                1.0,
                [396, 1068, 580, 1120]
            ),
        ]

        fields = detect_fields(results)

        associations = associate_field_values(
            fields,
            results
        )

        self.assertEqual(
            len(associations),
            1
        )

        self.assertEqual(
            associations[0].field,
            "manufacturing_date"
        )

        self.assertEqual(
            associations[0].value_text,
            "26/02/22"
        )

    def test_mrp_association(self):

        results = [
            make_result(
                "MRP",
                0.99,
                [0, 774, 100, 835]
            ),
            make_result(
                "Rs. 10.00",
                0.99,
                [110, 774, 514, 835]
            ),
        ]

        fields = detect_fields(results)

        associations = associate_field_values(
            fields,
            results
        )

        self.assertEqual(
            len(associations),
            1
        )

        self.assertEqual(
            associations[0].field,
            "mrp"
        )

        self.assertEqual(
            associations[0].value_text,
            "Rs. 10.00"
        )

    def test_distant_value_is_rejected(self):

        results = [
            make_result(
                "N.QTY:",
                0.99,
                [0, 100, 100, 140]
            ),
            make_result(
                "44 g",
                0.99,
                [1000, 1000, 1100, 1040]
            ),
        ]

        fields = detect_fields(results)

        associations = associate_field_values(
            fields,
            results
        )

        self.assertEqual(
            len(associations),
            0
        )


if __name__ == "__main__":
    unittest.main()