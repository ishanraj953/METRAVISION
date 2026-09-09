def generate_explanation(violation):

    explanation = {
        "what": f"{violation['field'].upper()} not detected",
        "why": "Applicable declaration requirement was not satisfied",
        "rule": violation["rule_id"],
        "evidence": "OCR field missing",
        "confidence": "91%"
    }

    return explanation


# Testing
if __name__ == "__main__":

    violation = {
        "field": "mrp",
        "rule_id": "LM-PC-001"
    }

    result = generate_explanation(violation)

    print(result)
