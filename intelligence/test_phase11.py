from declaration_bbox import (
    normalize_bbox,
    create_declaration_bbox,
    attach_bounding_boxes
)


def test_normalize_bbox():

    bbox = normalize_bbox([420, 680, 690, 745])

    assert bbox == [420, 680, 690, 745]

    print("BBox normalization: PASS")


def test_create_declaration_bbox():

    result = create_declaration_bbox(
        field="mrp",
        value="₹499",
        bbox=[420, 680, 690, 745],
        confidence=0.97
    )

    assert result["field"] == "mrp"
    assert result["value"] == "₹499"
    assert result["bbox"] == [420, 680, 690, 745]
    assert result["confidence"] == 0.97

    print("Declaration BBox creation: PASS")


def test_attach_bbox():

    declarations = {
        "mrp": {
            "value": "₹499",
            "confidence": 0.97
        }
    }

    ocr_results = [
        {
            "text": "MRP ₹499",
            "bbox": [420, 680, 690, 745],
            "confidence": 0.98
        }
    ]

    result = attach_bounding_boxes(
        declarations,
        ocr_results
    )

    assert result["mrp"]["value"] == "₹499"

    assert result["mrp"]["bbox"] == [
        420,
        680,
        690,
        745
    ]

    assert result["mrp"]["confidence"] == 0.97

    assert result["mrp"]["evidence_text"] == "MRP ₹499"

    print("BBox attachment: PASS")


def test_multiple_fields():

    declarations = {

        "mrp": {
            "value": "₹499",
            "confidence": 0.97
        },

        "manufacturer": {
            "value": "ABC Pvt Ltd",
            "confidence": 0.82
        },

        "net_quantity": {
            "value": "500 g",
            "confidence": 0.91
        }
    }

    ocr_results = [

        {
            "text": "MRP ₹499",
            "bbox": [420, 680, 690, 745],
            "confidence": 0.98
        },

        {
            "text": "ABC Pvt Ltd",
            "bbox": [300, 200, 650, 250],
            "confidence": 0.85
        },

        {
            "text": "Net Quantity: 500 g",
            "bbox": [500, 500, 800, 550],
            "confidence": 0.95
        }
    ]

    result = attach_bounding_boxes(
        declarations,
        ocr_results
    )

    assert result["mrp"]["bbox"] == [
        420, 680, 690, 745
    ]

    assert result["manufacturer"]["bbox"] == [
        300, 200, 650, 250
    ]

    assert result["net_quantity"]["bbox"] == [
        500, 500, 800, 550
    ]

    print("Multiple declaration BBoxes: PASS")


def test_missing_bbox():

    declarations = {
        "mrp": {
            "value": "₹499",
            "confidence": 0.60
        }
    }

    ocr_results = [
        {
            "text": "MRP",
            "bbox": [100, 100, 200, 150],
            "confidence": 0.90
        }
    ]

    result = attach_bounding_boxes(
        declarations,
        ocr_results
    )

    assert result["mrp"]["bbox"] is None

    print("Missing BBox handling: PASS")


def main():

    print("=" * 45)
    print("PHASE 11 - DECLARATION BOUNDING BOX TEST")
    print("=" * 45)

    test_normalize_bbox()
    test_create_declaration_bbox()
    test_attach_bbox()
    test_multiple_fields()
    test_missing_bbox()

    print("=" * 45)
    print("PHASE 11 STATUS: PASS")
    print("=" * 45)


if __name__ == "__main__":
    main()