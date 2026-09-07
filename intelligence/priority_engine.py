def calculate_priority_score(
    risk_score,
    repeat_violation=False,
    severity_score=0,
    violation_frequency=0
):
    """
    Calculate inspection priority score.

    Factors:
    - Risk score
    - Repeat violation
    - Violation severity
    - Violation frequency
    """

    # Risk contribution
    risk_component = risk_score

    # Repeat violation contribution
    repeat_component = 20 if repeat_violation else 0

    # Severity contribution
    severity_component = min(severity_score, 20)

    # Frequency contribution
    frequency_component = min(
        violation_frequency * 5,
        15
    )

    # Final priority score
    priority_score = min(
        risk_component
        + repeat_component
        + severity_component
        + frequency_component,
        100
    )

    # Decide inspection priority
    if priority_score >= 70:
        priority = 1

    elif priority_score >= 40:
        priority = 2

    else:
        priority = 3

    return {
        "priority_score": priority_score,
        "inspection_priority": priority
    }


# Test
if __name__ == "__main__":

    result = calculate_priority_score(
        risk_score=93,
        repeat_violation=True,
        severity_score=50,
        violation_frequency=2
    )

    print("\nMETRAVISION INSPECTION PRIORITY")
    print("--------------------------------")

    print("Priority Score:", result["priority_score"])
    print("Inspection Priority:", result["inspection_priority"])

    if result["inspection_priority"] == 1:
        print("Action: Inspect First")

    elif result["inspection_priority"] == 2:
        print("Action: Inspect Next")

    else:
        print("Action: Lower Priority")