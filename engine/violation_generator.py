missing_fields = [
    "mrp",
    "consumer_care"
]

violations = []

for index, field in enumerate(missing_fields, start=1):

    violation = {
        "violation_id": f"V-{1000 + index}",
        "field": field,
        "observed": "Not detected",
        "severity": "HIGH"
    }

    violations.append(violation)

for violation in violations:
    print(violation)