def generate_recommendation(risk_level, priority):
    """
    Generate an action recommendation for the officer.
    """

    if risk_level == "HIGH" and priority == "URGENT":
        return "Inspect product immediately"

    elif risk_level == "HIGH":
        return "Schedule product inspection"

    elif risk_level == "MEDIUM":
        return "Review the product and verify declarations"

    else:
        return "No immediate action required"


# Test
if __name__ == "__main__":

    risk_level = "HIGH"
    priority = "URGENT"

    recommendation = generate_recommendation(
        risk_level,
        priority
    )

    print("Recommendation:", recommendation)
