product = {
    "origin": "IMPORTED",
    "channel": "E_COMMERCE"
}

applicable_rules = []

if product["origin"] == "IMPORTED":
    applicable_rules.extend([
        "LM-PC-006",
        "LM-PC-007",
        "LM-PC-008"
    ])

if product["channel"] == "E_COMMERCE":
    applicable_rules.append("LM-PC-009")

print("Applicable Rules:", applicable_rules)