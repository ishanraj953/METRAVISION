def apply_officer_override(
    violation_id,
    system_decision,
    officer_override,
    reason
):

    decision = {
        "violation_id": violation_id,
        "system_decision": system_decision,
        "officer_override": officer_override,
        "reason": reason
    }

    return decision


# Testing
if __name__ == "__main__":

    result = apply_officer_override(
        "V-1001",
        "NON_COMPLIANT",
        "COMPLIANT",
        "MRP visible in image but OCR failed"
    )

    print(result)