import json
def load_rules():
    with open("rules/rules.json", "r") as file:
        rules = json.load(file)
    return rules
rules = load_rules()
print("Total Rules Loaded:", len(rules))

product = {
    "category": ["IMPORTED", "E_COMMERCE"]
}
applicable_rules = []
for rule in rules:
    for category in product["category"]:
        if category in rule["category"]:
            applicable_rules.append(rule["rule_id"])
print("Applicable Rules:", applicable_rules)