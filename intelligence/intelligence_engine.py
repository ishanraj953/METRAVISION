from risk_engine import calculate_risk_score
from priority_engine import calculate_priority_score
from recommendation_engine import (
    generate_recommendation,
    generate_explanation
)


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
    inspection_priority = priority_result["inspection_priority"]

    # -----------------------------
    # 3. Generate Explanation
    # -----------------------------

    explanations = generate_explanation(issues)

    # -----------------------------
    # 4. Generate Recommendation
    # -----------------------------

    recommendation = generate_recommendation(
        risk_level,
        "URGENT" if inspection_priority == 1 else "HIGH",
        issues
    )

    # -----------------------------
    # 5. Final Intelligence Result
    # -----------------------------

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "priority_score": priority_score,
        "inspection_priority": inspection_priority,
        "issues_count": len(issues),

        "severity_score": risk_result["severity_score"],
        "confidence_score": risk_result["confidence_score"],
        "history_score": risk_result["history_score"],
        "repeat_score": risk_result["repeat_score"],

        "violation_history": violation_history,
        "manufacturer_history": manufacturer_history,
        "repeat_violation": repeat_violation,
        "violation_frequency": violation_frequency,

        "explanations": explanations,
        "recommendation": recommendation
    }


if __name__ == "__main__":

    # -----------------------------
    # Test Product
    # -----------------------------

    issues = [
        {
            "type": "missing_declaration",
            "confidence": 0.95
        },
        {
            "type": "mrp_violation",
            "confidence": 0.90
        },
        {
            "type": "poor_image",
            "confidence": 0.80
        }
    ]

    # -----------------------------
    # Run Complete Analysis
    # -----------------------------

    result = analyze_product(
        issues,
        violation_history=2,
        manufacturer_history=5,
        repeat_violation=True,
        violation_frequency=2
    )

    # -----------------------------
    # Display Result
    # -----------------------------

    print("\nMETRAVISION INTELLIGENCE RESULT")
    print("--------------------------------")

    print("Risk Score:", result["risk_score"])
    print("Risk Level:", result["risk_level"])
    print("Priority Score:", result["priority_score"])
    print("Inspection Priority:", result["inspection_priority"])
    print("Issues Found:", result["issues_count"])

    print("\nRISK COMPONENTS")
    print("----------------")

    print("Severity Score:", result["severity_score"])
    print("Confidence Score:", result["confidence_score"])
    print("History Score:", result["history_score"])
    print("Repeat Violation Score:", result["repeat_score"])

    print("\nHISTORY")
    print("-------")

    print("Violation History:",
          result["violation_history"])

    print("Manufacturer History:",
          result["manufacturer_history"])

    print("Repeat Violation:",
          result["repeat_violation"])

    print("Violation Frequency:",
          result["violation_frequency"])

    print("\nWHY IS THIS RISKY?")
    print("------------------")

    for item in result["explanations"]:
        print("-", item["explanation"])

    print("\nRECOMMENDATION")
    print("--------------")
    print(result["recommendation"])