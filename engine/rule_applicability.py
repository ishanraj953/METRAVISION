import json
import os

def load_rules():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_path = os.path.join(base_dir, "rules", "rules.json")
    if not os.path.exists(target_path):
        target_path = "rules/rules.json"
    with open(target_path, "r", encoding="utf-8") as file:
        rules = json.load(file)
    return rules

def get_applicable_rules(product):
    rules = load_rules()

    applicable_rules = []

    for rule in rules:
        for category in product["category"]:
            if category in rule["category"]:
                applicable_rules.append(rule)

    return applicable_rules

# Testing
if __name__ == "__main__":
    product = {
        "category": ["IMPORTED", "E_COMMERCE"]
    }

    result = get_applicable_rules(product)

    print("Applicable Rules:")
    for rule in result:
        print(rule["rule_id"])
