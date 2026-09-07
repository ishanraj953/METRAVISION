def calculate_risk_score(issues):
    """
    Calculate risk score based on compliance issues.

    issues should be a list of dictionaries.
    Each issue can contain:
    - severity: high, medium, or low
    """

    score = 0

    for issue in issues:
        severity = issue.get("severity", "low").lower()

        if severity == "high":
            score += 30

        elif severity == "medium":
            score += 20

        elif severity == "low":
            score += 10

    # Maximum score is 100
    if score > 100:
        score = 100

    # Decide risk level
    if score >= 70:
        risk_level = "HIGH"

    elif score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "issues_count": len(issues)
    }


# Test data
if __name__ == "__main__":

    issues = [
        {"severity": "high"},
        {"severity": "medium"},
        {"severity": "low"}
    ]

    result = calculate_risk_score(issues)

    print(result)
