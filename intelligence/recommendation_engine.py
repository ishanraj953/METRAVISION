def generate_explanation(issues):
    """
    Explain why each detected issue is important.
    """

    explanations = []

    for issue in issues:

        violation_type = issue.get(
            "type",
            "unknown"
        )

        severity = issue.get(
            "severity",
            "UNKNOWN"
        ).upper()

        if violation_type == "missing_declaration":
            explanation = "Required product declaration is missing."

        elif violation_type == "mrp_violation":
            explanation = "MRP declaration is missing or incorrect."

        elif violation_type == "font_readability":
            explanation = "Required information is difficult to read."

        elif violation_type == "online_mismatch":
            explanation = "Online product information does not match the package."

        elif violation_type == "poor_image":
            explanation = "Poor image quality may affect reliable verification."

        elif violation_type == "repeat_violation":
            explanation = "The manufacturer has a history of repeated violations."

        else:
            explanation = (
                f"{violation_type} has a compliance issue."
            )

        explanations.append({
            "type": violation_type,
            "severity": severity,
            "explanation": explanation
        })

    return explanations


def generate_recommendation(
    risk_level,
    priority,
    issues
):
    """
    Generate an action recommendation.
    """

    if len(issues) == 0:
        return (
            "No compliance issues detected. "
            "No immediate action required."
        )

    issue_types = []

    for issue in issues:

        violation_type = issue.get(
            "type",
            "unknown"
        )

        issue_types.append(violation_type)

    issue_types = list(dict.fromkeys(issue_types))

    issue_text = ", ".join(issue_types)

    if risk_level == "CRITICAL":
        return (
            f"Immediate inspection required. "
            f"Critical compliance issues detected: {issue_text}."
        )

    elif risk_level == "HIGH":
        return (
            f"Schedule product inspection. "
            f"High-risk issues detected: {issue_text}."
        )

    elif risk_level == "MEDIUM":
        return (
            f"Review and verify the following issues: "
            f"{issue_text}."
        )

    else:
        return (
            f"Correct the detected compliance issues: "
            f"{issue_text}."
        )


if __name__ == "__main__":

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

    explanations = generate_explanation(issues)

    print("\nWHY IS THIS RISKY?")
    print("------------------")

    for item in explanations:
        print("-", item["explanation"])

    recommendation = generate_recommendation(
        "CRITICAL",
        "URGENT",
        issues
    )

    print("\nRECOMMENDATION")
    print("--------------")
    print(recommendation)