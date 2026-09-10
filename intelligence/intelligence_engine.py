try:
    from intelligence.risk_engine import calculate_risk_score
    from intelligence.priority_engine import calculate_priority_score
    from intelligence.recommendation_engine import (
        generate_recommendation,
        generate_explanation
    )
    from intelligence.evidence_engine import create_evidence_chain, validate_evidence
    from intelligence.decision_engine import make_decision
    from intelligence.officer_recommendation import generate_officer_recommendation
except ImportError:
    from risk_engine import calculate_risk_score
    from priority_engine import calculate_priority_score
    from recommendation_engine import (
        generate_recommendation,
        generate_explanation
    )
    from evidence_engine import create_evidence_chain, validate_evidence
    from decision_engine import make_decision
    from officer_recommendation import generate_officer_recommendation


def analyze_product(
    issues,
    violation_history=0,
    manufacturer_history=0,
    repeat_violation=False,
    violation_frequency=0
):
    """
    Complete METRAVISION intelligence analysis.
    """

    # -----------------------------
    # 1. Calculate Risk
    # -----------------------------

    risk_result = calculate_risk_score(
        issues,
        violation_history=violation_history,
        repeat_violation=repeat_violation
    )

    risk_score = risk_result["risk_score"]
    risk_level = risk_result["risk_level"]

    # -----------------------------
    # 2. Calculate Inspection Priority
    # -----------------------------

    priority_result = calculate_priority_score(
        risk_score=risk_score,
        repeat_violation=repeat_violation,
        severity_score=risk_result["severity_score"],
        violation_frequency=violation_frequency
    )

    priority_score = priority_result["priority_score"]
    inspection_priority = priority_result[
        "inspection_priority"
    ]

    # -----------------------------
    # 3. Create Evidence Chain
    # -----------------------------

    evidence_chain = create_evidence_chain(issues)

    # -----------------------------
    # 4. Validate Evidence
    # -----------------------------

    validated_evidence = []

    for evidence in evidence_chain:

        validation = validate_evidence(
            evidence
        )

        evidence["valid"] = validation["valid"]
        evidence["validation_errors"] = (
            validation["errors"]
        )

        validated_evidence.append(evidence)

    # -----------------------------
    # 5. Overall Evidence Confidence
    # -----------------------------

    if len(validated_evidence) > 0:

        total_confidence = 0

        for evidence in validated_evidence:
            total_confidence += evidence[
                "evidence_confidence"
            ]

        overall_confidence = round(
            total_confidence
            / len(validated_evidence),
            2
        )

    else:
        overall_confidence = 0.0

    # -----------------------------
    # 6. Check Overall Evidence
    # -----------------------------

    evidence_valid = all(
        evidence["valid"]
        for evidence in validated_evidence
    )

    # -----------------------------
    # 7. Decision Engine
    # -----------------------------

    decision_result = make_decision(
        risk_level=risk_level,
        evidence_confidence=overall_confidence,
        evidence_valid=evidence_valid,
        inspection_priority=inspection_priority
    )

    officer_decision = decision_result[
        "officer_decision"
    ]

    decision_reason = decision_result[
        "decision_reason"
    ]

    # -----------------------------
    # 8. Officer Recommendation
    # -----------------------------

    officer_result = generate_officer_recommendation(
        officer_decision=officer_decision,
        risk_level=risk_level,
        inspection_priority=inspection_priority
    )

    # -----------------------------
    # 9. Explanations
    # -----------------------------

    explanations = generate_explanation(
        issues
    )

    # -----------------------------
    # 10. General Recommendation
    # -----------------------------

    recommendation = generate_recommendation(
        risk_level,
        "URGENT"
        if inspection_priority == 1
        else "HIGH",
        issues
    )

    # -----------------------------
    # 11. Final Intelligence Output
    # -----------------------------

    return {
        "risk": {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "severity_score": risk_result[
                "severity_score"
            ],
            "confidence_score": risk_result[
                "confidence_score"
            ],
            "history_score": risk_result[
                "history_score"
            ],
            "repeat_score": risk_result[
                "repeat_score"
            ]
        },

        "evidence": {
            "overall_confidence": overall_confidence,
            "evidence_valid": evidence_valid,
            "records": validated_evidence
        },

        "history": {
            "violation_history": violation_history,
            "manufacturer_history": manufacturer_history,
            "repeat_violation": repeat_violation,
            "violation_frequency": violation_frequency
        },

        "inspection": {
            "priority_score": priority_score,
            "inspection_priority": inspection_priority
        },

        "decision": {
            "officer_decision": officer_decision,
            "decision_reason": decision_reason
        },

        "explanations": explanations,

        "recommendation": recommendation,

        "officer_recommendation": officer_result[
            "officer_recommendation"
        ]
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

    result = analyze_product(
        issues,
        violation_history=2,
        manufacturer_history=5,
        repeat_violation=True,
        violation_frequency=2
    )

    print("\nMETRAVISION FINAL INTELLIGENCE")
    print("--------------------------------")

    print("\nRISK")
    print("----")

    print("Risk Score:",
          result["risk"]["risk_score"])

    print("Risk Level:",
          result["risk"]["risk_level"])

    print("Severity Score:",
          result["risk"]["severity_score"])

    print("Confidence Score:",
          result["risk"]["confidence_score"])

    print("\nEVIDENCE")
    print("--------")

    print("Overall Confidence:",
          result["evidence"]["overall_confidence"])

    print("Evidence Valid:",
          result["evidence"]["evidence_valid"])

    for evidence in result["evidence"]["records"]:

        print("\nViolation:",
              evidence["violation"])

        print("Detected Text:",
              evidence["detected_text"])

        print("Bounding Box:",
              evidence["bounding_box"])

        print("Rule:",
              evidence["rule_id"])

        print("Evidence Confidence:",
              evidence["evidence_confidence"])

        print("Confidence Level:",
              evidence["confidence_level"])

        print("Valid:",
              evidence["valid"])

    print("\nINSPECTION")
    print("----------")

    print("Priority Score:",
          result["inspection"]["priority_score"])

    print("Inspection Priority:",
          result["inspection"]["inspection_priority"])

    print("\nOFFICER DECISION")
    print("----------------")

    print("Decision:",
          result["decision"]["officer_decision"])

    print("Reason:",
          result["decision"]["decision_reason"])

    print("\nOFFICER RECOMMENDATION")
    print("----------------------")

    print(result["officer_recommendation"])

    print("\nWHY IS THIS RISKY?")
    print("------------------")

    for item in result["explanations"]:
        print("-", item["explanation"])

    print("\nGENERAL RECOMMENDATION")
    print("----------------------")

    print(result["recommendation"])