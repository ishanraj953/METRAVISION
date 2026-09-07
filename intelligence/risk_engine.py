def calculate_risk_score(issues):
    """
    Calculate risk score using the severity scores
    defined by the METRAVISION rule engine.
    """

    severity_scores = {
        "HIGH": 10,
        "MEDIUM": 5,
        "LOW": 2
    }

    score = 0

    for issue in issues:
        severity = issue.get("severity", "LOW").upper()
        score += severity_scores.get(severity, 0)

    # Convert score to a 0-100 scale
    if score >= 20:
        risk_score = 100
    else:
        risk_score = score * 5

    # Decide risk level
    if risk_score >= 70:
        risk_level = "HIGH"

    elif risk_score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "issues_count": len(issues)
    }


if __name__ == "__main__":

    issues = [
        {"severity": "HIGH"},
        {"severity": "MEDIUM"},
        {"severity": "LOW"}
    ]

    result = calculate_risk_score(issues)

    print(result)
