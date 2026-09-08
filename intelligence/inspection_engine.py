def calculate_inspection_priority(
    risk_score,
    repeat_violation,
    compliance_drift,
    online_mismatch
):
    """
    Calculate inspection priority using multiple risk factors.
    """

    priority_score = risk_score

    if repeat_violation:
        priority_score += 10

    if compliance_drift:
        priority_score += 10

    if online_mismatch:
        priority_score += 10

    priority_score = min(
        priority_score,
        100
    )

    if priority_score >= 80:
        priority = 1
    elif priority_score >= 60:
        priority = 2
    elif priority_score >= 40:
        priority = 3
    elif priority_score >= 20:
        priority = 4
    else:
        priority = 5

    return {
        "priority_score": priority_score,
        "inspection_priority": priority
    }


def rank_products(products):
    """
    Rank products from highest to lowest inspection priority.
    """

    ranked_products = []

    for product in products:

        result = calculate_inspection_priority(
            product.get("risk_score", 0),
            product.get("repeat_violation", False),
            product.get("compliance_drift", False),
            product.get("online_mismatch", False)
        )

        ranked_products.append({
            "product": product.get(
                "product",
                "Unknown"
            ),
            "risk_level": product.get(
                "risk_level",
                "LOW"
            ),
            "priority_score": result[
                "priority_score"
            ],
            "inspection_priority": result[
                "inspection_priority"
            ]
        })

    ranked_products.sort(
        key=lambda x: x["priority_score"],
        reverse=True
    )

    return ranked_products


# Test
if __name__ == "__main__":

    products = [
        {
            "product": "Product A",
            "risk_score": 86,
            "risk_level": "CRITICAL",
            "repeat_violation": True,
            "compliance_drift": True,
            "online_mismatch": True
        },
        {
            "product": "Product B",
            "risk_score": 65,
            "risk_level": "HIGH",
            "repeat_violation": True,
            "compliance_drift": False,
            "online_mismatch": True
        },
        {
            "product": "Product C",
            "risk_score": 55,
            "risk_level": "HIGH",
            "repeat_violation": False,
            "compliance_drift": True,
            "online_mismatch": False
        },
        {
            "product": "Product D",
            "risk_score": 35,
            "risk_level": "MEDIUM",
            "repeat_violation": False,
            "compliance_drift": False,
            "online_mismatch": False
        },
        {
            "product": "Product E",
            "risk_score": 15,
            "risk_level": "LOW",
            "repeat_violation": False,
            "compliance_drift": False,
            "online_mismatch": False
        }
    ]

    ranked = rank_products(products)

    print("\nMETRAVISION INSPECTION RECOMMENDATION")
    print("-------------------------------------")

    for index, product in enumerate(
        ranked,
        start=1
    ):

        print(
            f"{index}.",
            product["product"],
            "-",
            product["risk_level"],
            "| Score:",
            product["priority_score"],
            "| Priority:",
            product["inspection_priority"]
        )