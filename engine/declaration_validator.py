required_declarations = [
    "manufacturer_name",
    "net_quantity",
    "mrp",
    "consumer_care"
]

detected_declarations = [
    "manufacturer_name",
    "net_quantity",
    "consumer_care"
]

passed = []
violations = []

for declaration in required_declarations:
    if declaration in detected_declarations:
        passed.append(declaration)
    else:
        violations.append(declaration)

if len(violations) == 0:
    status = "COMPLIANT"
else:
    status = "NON_COMPLIANT"

result = {
    "status": status,
    "passed": passed,
    "violations": violations
}

print(result)