def create_audit_log(rule_id, action, status):

    audit_log = {
        "rule_id": rule_id,
        "action": action,
        "status": status
    }

    return audit_log


# Testing
if __name__ == "__main__":

    result = create_audit_log(
        "LM-PC-001",
        "VALIDATION_EXECUTED",
        "NON_COMPLIANT"
    )

    print(result)
