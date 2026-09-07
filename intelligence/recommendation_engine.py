def generate_recommendation(risk_level, priority, issues):
    """
    Generate an action recommendation based on
    risk level, priority and detected issues.
    """

    if risk_level == "HIGH" and priority == "URGENT":
        return "Inspect product immediately"

    elif risk_level == "HIGH":
        return "Schedule product inspection"

    elif risk_level == "MEDIUM":
        return "Review violations and verify declarations"

    elif len(issues) > 0:
        return "Correct the detected compliance issues"

    else:
        return "No immediate action required"


if __name__ == "__main__":

    issues = [
        {"severity": "HIGH"}
    ]

    recommendation = generate_recommendation(
        "HIGH",
        "URGENT",
        issues
    )

    print("Recommendation:", recommendation)
