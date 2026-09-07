def decide_priority(risk_score):
    """
    Decide inspection priority based on risk score.
    """

    if risk_score >= 70:
        return "URGENT"

    elif risk_score >= 40:
        return "HIGH"

    elif risk_score >= 20:
        return "NORMAL"

    else:
        return "LOW"


# Test
if __name__ == "__main__":

    score = 60

    priority = decide_priority(score)

    print("Risk Score:", score)
    print("Priority:", priority)
