violation = {
    "rule_id": "LM-PC-001",
    "field": "mrp"
}

evidence = {
    "field": "mrp",
    "ocr_text": "",
    "image_region": "top_right"
}

report = {
    "rule_id": violation["rule_id"],
    "field": violation["field"],
    "evidence": evidence
}

print(report)