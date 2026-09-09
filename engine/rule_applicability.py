import json
def load_rules():
    with open("rules/rules.json", "r") as file:
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