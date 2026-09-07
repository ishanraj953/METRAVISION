from risk_engine import calculate_risk_score
from priority_engine import decide_priority
from recommendation_engine import generate_recommendation, generate_explanation


def analyze_product(issues):

    # Calculate risk
    risk_result = calculate_risk_score(issues)

    risk_score = risk_result["risk_score"]
    risk_level = risk_result["risk_level"]

    # Decide priority
    priority = decide_priority(risk_score)

    # Generate recommendation
    recommendation = generate_recommendation(
        risk_level,
        priority,
        issues
    )
    explanations = generate_explanation(issues)

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "priority": priority,
        "issues_count": len(issues),
        "explanations": explanations,
        "recommendation": recommendation
    }


if __name__ == "__main__":

    issues = [
        {
            "field": "mrp",
            "severity": "HIGH"
        },
        {
            "field": "consumer_care",
            "severity": "MEDIUM"
        },
        {
            "field": "net_quantity",
            "severity": "LOW"
        }
    ]

    result = analyze_product(issues)

    print("\nMETRAVISION INTELLIGENCE RESULT")
    print("--------------------------------")
    print("Risk Score:", result["risk_score"])
    print("Risk Level:", result["risk_level"])
    print("Priority:", result["priority"])
    print("Issues Found:", result["issues_count"])
    print("\nWHY IS THIS RISKY?")

    for item in result["explanations"]:
        print("-", item["explanation"])

    print("\nRECOMMENDATION:")
    print(result["recommendation"])

