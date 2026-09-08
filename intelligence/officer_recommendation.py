def generate_officer_recommendation(
    officer_decision,
    risk_level,
    inspection_priority
):
    """
    Generate an actionable recommendation for the officer.
    """

    if officer_decision == "INSPECT":

        recommendation = (
            "Conduct immediate physical inspection "
            "of the product and verify the detected violations."
        )

    elif officer_decision == "VERIFY":

        recommendation = (
            "Verify the product declarations and "
            "confirm the detected compliance issues."
        )

    elif officer_decision == "REVIEW EVIDENCE":

        recommendation = (
            "Review the available evidence and "
            "verify the information before taking action."
        )

    else:

        recommendation = (
            "Continue monitoring the product for "
            "future compliance issues."
        )

    return {
        "officer_decision": officer_decision,
        "risk_level": risk_level,
        "inspection_priority": inspection_priority,
        "officer_recommendation": recommendation
    }


# Test
if __name__ == "__main__":

    result = generate_officer_recommendation(
        officer_decision="INSPECT",
        risk_level="CRITICAL",
        inspection_priority=1
    )

    print("\nMETRAVISION OFFICER RECOMMENDATION")
    print("----------------------------------")

    print("Risk Level:",
          result["risk_level"])

    print("Inspection Priority:",
          result["inspection_priority"])

    print("Officer Decision:",
          result["officer_decision"])

    print("\nRECOMMENDATION")
    print("--------------")

    print(result["officer_recommendation"])