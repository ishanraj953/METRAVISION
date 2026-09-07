
def generate_explanation(issues):
    """
    Explain why each detected issue is important.
    """

    explanations = []

    for issue in issues:

        field = issue.get("field", "unknown")
        severity = issue.get("severity", "LOW").upper()

        if field == "mrp":
            explanation = "MRP declaration is missing or invalid."

        elif field == "net_quantity":
            explanation = "Net quantity declaration is missing or invalid."

        elif field == "consumer_care":
            explanation = "Consumer care contact details are missing or invalid."

        elif field == "manufacturer_name":
            explanation = "Manufacturer name declaration is missing or invalid."

        else:
            explanation = f"{field} declaration has a compliance issue."

        explanations.append({
            "field": field,
            "severity": severity,
            "explanation": explanation
        })

    return explanations


def generate_recommendation(risk_level, priority, issues):
    """
    Generate an action recommendation.
    """

    if len(issues) == 0:
        return "No compliance issues detected. No immediate action required."

    fields = []

    for issue in issues:
        field = issue.get("field", "unknown")
        fields.append(field)

    fields = list(dict.fromkeys(fields))
    issue_text = ", ".join(fields)

    if risk_level == "HIGH" and priority == "URGENT":
        return (
            f"Immediate inspection required. "
            f"Critical compliance issues detected in: {issue_text}."
        )

    elif risk_level == "HIGH":
        return (
            f"Schedule product inspection. "
            f"High-risk issues detected in: {issue_text}."
        )

    elif risk_level == "MEDIUM":
        return (
            f"Review and verify the following declarations: {issue_text}."
        )

    else:
        return (
            f"Correct the detected compliance issues: {issue_text}."
        )


if __name__ == "__main__":

    issues = [
        {
            "field": "mrp",
            "severity": "HIGH"
        },
        {
            "field": "consumer_care",
            "severity": "MEDIUM"
        }
    ]

    explanations = generate_explanation(issues)

    print("WHY IS THIS RISKY?")

    for item in explanations:
        print("-", item["explanation"])

    recommendation = generate_recommendation(
        "HIGH",
        "URGENT",
        issues
    )

    print("\nRECOMMENDATION:")
    print(recommendation)