import json


def create_risk_data(
    risk_score,
    risk_level,
    issues,
    violation_history=0,
    manufacturer_history=0,
    repeat_violation=False,
    inspection_priority=3
):
    """
    Create a structured risk data model for a product.
    """

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "issues_count": len(issues),
        "violation_history": violation_history,
        "manufacturer_history": manufacturer_history,
        "repeat_violation": repeat_violation,
        "inspection_priority": inspection_priority
    }


def calculate_risk_score(
    issues,
    violation_history=0,
    repeat_violation=False
):
    """
    Calculate a deterministic and explainable risk score.

    Risk is based on:
    1. Violation severity
    2. Detection confidence
    3. Previous violation history
    4. Repeat violation
    """

    # Load severity scores from Rule Engine
    with open("rules/severity.json", "r") as file:
        severity_data = json.load(file)

    # -----------------------------
    # 1. Severity Score
    # -----------------------------

    severity_score = 0

    for issue in issues:

        violation_type = issue.get(
            "type",
            "missing_declaration"
        )

        score = severity_data.get(
            violation_type,
            {}
        ).get("score", 0)

        severity_score += score

    # -----------------------------
    # 2. Confidence Score
    # -----------------------------

    confidence_score = 0

    for issue in issues:

        confidence = issue.get("confidence", 0.0)

        if confidence >= 0.90:
            confidence_score += 5

        elif confidence >= 0.75:
            confidence_score += 3

        elif confidence >= 0.50:
            confidence_score += 1

    # -----------------------------
    # 3. Violation History Score
    # -----------------------------

    history_score = min(
        violation_history * 5,
        15
    )

    # -----------------------------
    # 4. Repeat Violation Score
    # -----------------------------

    repeat_score = 20 if repeat_violation else 0

    # -----------------------------
    # 5. Final Risk Score
    # -----------------------------

    risk_score = min(
        severity_score
        + confidence_score
        + history_score
        + repeat_score,
        100
    )

    # -----------------------------
    # 6. Risk Level
    # -----------------------------

    if risk_score <= 30:
        risk_level = "LOW"

    elif risk_score <= 60:
        risk_level = "MEDIUM"

    elif risk_score <= 80:
        risk_level = "HIGH"

    else:
        risk_level = "CRITICAL"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "issues_count": len(issues),
        "severity_score": severity_score,
        "confidence_score": confidence_score,
        "history_score": history_score,
        "repeat_score": repeat_score
    }


if __name__ == "__main__":

    # --------------------------------
    # Test Product Violations
    # --------------------------------

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

    # --------------------------------
    # Calculate Risk
    # --------------------------------

    result = calculate_risk_score(
        issues,
        violation_history=2,
        repeat_violation=True
    )

    # --------------------------------
    # Create Complete Risk Data
    # --------------------------------

    risk_data = create_risk_data(
        result["risk_score"],
        result["risk_level"],
        issues,
        violation_history=2,
        manufacturer_history=5,
        repeat_violation=True,
        inspection_priority=1
    )

    # --------------------------------
    # Display Result
    # --------------------------------

    print("\nMETRAVISION RISK ANALYSIS")
    print("-------------------------")

    print("Risk Score:", risk_data["risk_score"])
    print("Risk Level:", risk_data["risk_level"])
    print("Issues Count:", risk_data["issues_count"])

    print("\nRISK COMPONENTS")
    print("----------------")

    print("Severity Score:", result["severity_score"])
    print("Confidence Score:", result["confidence_score"])
    print("History Score:", result["history_score"])
    print("Repeat Violation Score:", result["repeat_score"])

    print("\nHISTORY")
    print("-------")

    print("Violation History:",
          risk_data["violation_history"])

    print("Manufacturer History:",
          risk_data["manufacturer_history"])

    print("Repeat Violation:",
          risk_data["repeat_violation"])

    print("Inspection Priority:",
          risk_data["inspection_priority"])