from risk_engine import calculate_risk_score
from priority_engine import decide_priority
from recommendation_engine import generate_recommendation


def analyze_product(issues):
    """
    Analyze product compliance issues and generate
    risk, priority and recommendation.
    """

    # Step 1: Calculate risk
    risk_result = calculate_risk_score(issues)

    risk_score = risk_result["risk_score"]
    risk_level = risk_result["risk_level"]

    # Step 2: Decide priority
    priority = decide_priority(risk_score)

    # Step 3: Generate recommendation
    recommendation = generate_recommendation(
        risk_level,
        priority
    )

    # Final intelligence result
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "priority": priority,
        "issues_count": risk_result["issues_count"],
        "recommendation": recommendation
    }


# Test
if __name__ == "__main__":

    issues = [
        {"severity": "high"},
        {"severity": "medium"},
        {"severity": "low"}
    ]

    result = analyze_product(issues)

    print("METRAVISION INTELLIGENCE RESULT")
    print("--------------------------------")
    print("Risk Score:", result["risk_score"])
    print("Risk Level:", result["risk_level"])
    print("Priority:", result["priority"])
    print("Issues Found:", result["issues_count"])
    print("Recommendation:", result["recommendation"])
