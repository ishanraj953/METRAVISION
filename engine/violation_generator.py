def generate_violations(missing_fields):

    violations = []

    for index, field in enumerate(missing_fields, start=1):

        violation = {
            "violation_id": f"V-{1000 + index}",
            "field": field,
            "observed": "Not detected",
            "severity": "HIGH"
        }

        violations.append(violation)

    return violations


# Testing
if __name__ == "__main__":

    missing_fields = [
        "mrp",
        "consumer_care"
    ]

    result = generate_violations(missing_fields)

    for violation in result:
        print(violation)