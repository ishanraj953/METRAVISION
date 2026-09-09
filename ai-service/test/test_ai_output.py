import unittest

from ocr.ai_output import build_ai_output


class TestAIFinalOutput(unittest.TestCase):

    def test_final_output(self):

        violations = [
            {
                "violation_type": "LOW_CONTRAST",
                "field": "mrp",
                "severity": "MEDIUM",
                "confidence": 0.75,
            }
        ]

        result = build_ai_output(
            product_type="food",
            quality={
                "status": "GOOD",
                "image_quality": 0.91,
            },
            declarations={
                "mrp": "10.00",
                "net_quantity": "44 g",
            },
            visual_analysis={
                "readability": "READABLE",
                "font_size": "ESTIMATED",
            },
            confidence={
                "overall": 0.89,
            },
            violations=violations,
            annotated_image="processed/violation_heatmap.jpg",
        )

        self.assertEqual(result["product_type"], "food")
        self.assertEqual(result["declarations"]["mrp"], "10.00")
        self.assertEqual(
            result["annotated_image"],
            "processed/violation_heatmap.jpg",
        )

        self.assertEqual(len(result["violations"]), 1)

        print("\nPHASE 16 — AI FINAL OUTPUT")
        print("-" * 50)

        import json
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    unittest.main(verbosity=2)