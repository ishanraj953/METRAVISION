def calculate_manufacturer_risk(
    manufacturer,
    total_inspections,
    total_products,
    violations,
    repeat_violations
):
    """
    Generate an organization-level manufacturer risk profile.
    """

    violation_rate = (
        violations / total_inspections
        if total_inspections > 0
        else 0
    )

    repeat_rate = (
        repeat_violations / violations
        if violations > 0
        else 0
    )

    risk_score = (
        violation_rate * 60
        + repeat_rate * 40
    )

    risk_score = min(
        round(risk_score),
        100
    )

    if risk_score >= 70:
        risk_level = "CRITICAL"
    elif risk_score >= 50:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "manufacturer": manufacturer,
        "total_inspections": total_inspections,
        "total_products": total_products,
        "violations": violations,
        "repeat_violations": repeat_violations,
        "risk_score": risk_score,
        "risk_level": risk_level
    }


# Test
if __name__ == "__main__":

    result = calculate_manufacturer_risk(
        manufacturer="ABC Pvt Ltd",
        total_inspections=10,
        total_products=8,
        violations=8,
        repeat_violations=5
    )

    print("\nMETRAVISION MANUFACTURER RISK PROFILE")
    print("---------------------------------------")

    print(
        "Manufacturer:",
        result["manufacturer"]
    )

    print(
        "Total Inspections:",
        result["total_inspections"]
    )

    print(
        "Total Products:",
        result["total_products"]
    )

    print(
        "Violations:",
        result["violations"]
    )

    print(
        "Repeat Violations:",
        result["repeat_violations"]
    )

    print(
        "Risk Score:",
        result["risk_score"]
    )

    print(
        "Risk Level:",
        result["risk_level"]
    )