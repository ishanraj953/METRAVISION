def make_decision(
    risk_level,
    evidence_confidence,
    evidence_valid,
    inspection_priority
):
    """
    Decide the appropriate officer action.
    """

    # Invalid evidence should not directly lead
    # to an inspection decision.
    if not evidence_valid:
        decision = "REVIEW EVIDENCE"
        reason = "Evidence is incomplete or invalid."

    elif risk_level == "CRITICAL" and evidence_confidence >= 0.80:
        decision = "INSPECT"
        reason = "Critical risk with high-confidence evidence."

    elif risk_level == "HIGH" and evidence_confidence >= 0.80:
        decision = "INSPECT"
        reason = "High risk with reliable evidence."

    elif risk_level == "MEDIUM" and evidence_confidence >= 0.60:
        decision = "VERIFY"
        reason = "Medium risk requires further verification."

    elif risk_level == "LOW":
        decision = "MONITOR"
        reason = "Low risk does not require immediate inspection."

    else:
        decision = "REVIEW EVIDENCE"
        reason = "Evidence confidence is insufficient for a final decision."

    return {
        "officer_decision": decision,
        "decision_reason": reason,
        "inspection_priority": inspection_priority
    }


# Test
if __name__ == "__main__":

    result = make_decision(
        risk_level="CRITICAL",
        evidence_confidence=0.95,
        evidence_valid=True,
        inspection_priority=1
    )

    print("\nMETRAVISION DECISION ENGINE")
    print("---------------------------")

    print("Risk Level:", "CRITICAL")
    print("Evidence Confidence:", 0.95)
    print("Evidence Valid:", True)
    print("Inspection Priority:", 1)

    print("\nOFFICER DECISION")
    print("----------------")

    print("Decision:",
          result["officer_decision"])

    print("Reason:",
          result["decision_reason"])

    print("Inspection Priority:",
          result["inspection_priority"])