def link_evidence(violation, evidence):

    report = {
        "rule_id": violation["rule_id"],
        "field": violation["field"],
        "evidence": evidence
    }

    return report


# Testing
if __name__ == "__main__":

    violation = {
        "rule_id": "LM-PC-001",
        "field": "mrp"
    }

    evidence = {
        "field": "mrp",
        "ocr_text": "",
        "image_region": "top_right"
    }

    result = link_evidence(violation, evidence)

    print(result)
