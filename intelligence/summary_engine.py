def create_intelligence_summary(
    risk_score,
    risk_level,
    inspection_priority,
    repeat_offender,
    compliance_drift,
    online_mismatch,
    manual_review
):
    """
    Create the final compliance intelligence summary.
    """

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "inspection_priority": inspection_priority,
        "repeat_offender": repeat_offender,
        "compliance_drift": compliance_drift,
        "online_mismatch": online_mismatch,
        "manual_review": manual_review
    }


# Test
if __name__ == "__main__":

    summary = create_intelligence_summary(
        risk_score=86,
        risk_level="CRITICAL",
        inspection_priority=1,
        repeat_offender=True,
        compliance_drift=True,
        online_mismatch=True,
        manual_review=False
    )

    print("\nMETRAVISION COMPLIANCE INTELLIGENCE SUMMARY")
    print("-------------------------------------------")

    for key, value in summary.items():
        print(
            f"{key}: {value}"
        )