violation = {
    "field": "mrp",
    "rule_id": "LM-PC-001"
}

explanation = {
    "what": f"{violation['field'].upper()} not detected",
    "why": "Applicable declaration requirement was not satisfied",
    "rule": violation["rule_id"],
    "evidence": "OCR field missing",
    "confidence": "91%"
}

print(explanation)