def calculate_evidence_confidence(
    ocr_confidence,
    image_quality,
    rule_certainty
):
    """
    Calculate overall evidence confidence.
    """

    evidence_confidence = (
        ocr_confidence
        + image_quality
        + rule_certainty
    ) / 3

    if evidence_confidence >= 0.80:
        confidence_level = "HIGH"

    elif evidence_confidence >= 0.60:
        confidence_level = "MEDIUM"

    else:
        confidence_level = "LOW"

    return {
        "evidence_confidence": round(
            evidence_confidence, 2
        ),
        "confidence_level": confidence_level
    }


def create_evidence(issue):
    """
    Create a structured evidence record.
    """

    ocr_confidence = issue.get(
        "confidence", 0.0
    )

    image_quality = issue.get(
        "image_quality", 0.0
    )

    rule_certainty = issue.get(
        "rule_certainty", 0.0
    )

    confidence_result = calculate_evidence_confidence(
        ocr_confidence,
        image_quality,
        rule_certainty
    )

    return {
        "violation": issue.get(
            "type", "unknown"
        ),
        "detected_text": issue.get(
            "detected_text", ""
        ),
        "bounding_box": issue.get(
            "bounding_box", []
        ),
        "rule_id": issue.get(
            "rule_id", ""
        ),
        "reason": issue.get(
            "reason", ""
        ),
        "ocr_confidence": ocr_confidence,
        "image_quality": image_quality,
        "rule_certainty": rule_certainty,
        "evidence_confidence": confidence_result[
            "evidence_confidence"
        ],
        "confidence_level": confidence_result[
            "confidence_level"
        ]
    }


def create_evidence_chain(issues):
    """
    Create evidence records for all violations.
    """

    evidence_chain = []

    for issue in issues:
        evidence = create_evidence(issue)
        evidence_chain.append(evidence)

    return evidence_chain


def validate_evidence(evidence):
    """
    Validate whether an evidence record
    contains the required information.
    """

    errors = []

    if not evidence["violation"]:
        errors.append("Violation type missing")

    if not evidence["rule_id"]:
        errors.append("Rule ID missing")

    if not evidence["reason"]:
        errors.append("Reason missing")

    if not evidence["bounding_box"]:
        errors.append("Bounding box missing")

    if evidence["evidence_confidence"] <= 0:
        errors.append("Confidence missing")

    if len(errors) == 0:
        return {
            "valid": True,
            "errors": []
        }

    return {
        "valid": False,
        "errors": errors
    }


# Test
if __name__ == "__main__":

    issues = [
        {
            "type": "mrp_violation",
            "detected_text": "MRP ₹999",
            "bounding_box": [120, 250, 180, 50],
            "rule_id": "LM-PC-001",
            "reason": "MRP declaration is required.",
            "confidence": 0.94,
            "image_quality": 0.90,
            "rule_certainty": 1.00
        },
        {
            "type": "missing_declaration",
            "detected_text": "",
            "bounding_box": [300, 400, 200, 60],
            "rule_id": "LM-PC-002",
            "reason": "Manufacturer name is required.",
            "confidence": 0.70,
            "image_quality": 0.60,
            "rule_certainty": 1.00
        }
    ]

    evidence_chain = create_evidence_chain(issues)

    print("\nMETRAVISION EVIDENCE VALIDATION")
    print("--------------------------------")

    for evidence in evidence_chain:

        print("\nViolation:",
              evidence["violation"])

        print("Detected Text:",
              evidence["detected_text"])

        print("Bounding Box:",
              evidence["bounding_box"])

        print("Rule:",
              evidence["rule_id"])

        print("Reason:",
              evidence["reason"])

        print("Evidence Confidence:",
              evidence["evidence_confidence"])

        print("Confidence Level:",
              evidence["confidence_level"])

        validation = validate_evidence(evidence)

        print("Evidence Valid:",
              validation["valid"])

        print("Validation Errors:",
              validation["errors"])