def apply_conditional_rules(product):

    applicable_rules = []

    if product.get("origin") == "IMPORTED":
        applicable_rules.extend([
            "LM-PC-006",
            "LM-PC-007",
            "LM-PC-008"
        ])

    if product.get("channel") == "E_COMMERCE":
        applicable_rules.append("LM-PC-009")

    return applicable_rules


# Testing
if __name__ == "__main__":

    product = {
        "origin": "IMPORTED",
        "channel": "E_COMMERCE"
    }

    result = apply_conditional_rules(product)

    print("Applicable Rules:", result)
