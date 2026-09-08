def detect_compliance_drift(scans):
    """
    Detect changes in product compliance data across multiple scans.
    """

    if len(scans) < 2:
        return {
            "compliance_drift": False,
            "changes": []
        }

    tracked_fields = [
        "mrp",
        "net_quantity",
        "manufacturer",
        "product_name",
        "declaration"
    ]

    changes = []

    for field in tracked_fields:

        previous_value = scans[0].get(field)

        for scan in scans[1:]:

            current_value = scan.get(field)

            if (
                previous_value is not None
                and current_value is not None
                and str(previous_value).strip().lower()
                != str(current_value).strip().lower()
            ):
                changes.append({
                    "field": field,
                    "previous_value": previous_value,
                    "current_value": current_value,
                    "type": "COMPLIANCE_DRIFT"
                })

            previous_value = current_value

    compliance_drift = len(changes) > 0

    return {
        "compliance_drift": compliance_drift,
        "changes": changes
    }


# Test
if __name__ == "__main__":

    scans = [
        {
            "scan_id": 1,
            "mrp": "₹499",
            "net_quantity": "500g",
            "manufacturer": "ABC Foods Pvt Ltd",
            "product_name": "ABC Biscuits",
            "declaration": "Present"
        },
        {
            "scan_id": 2,
            "mrp": "₹499",
            "net_quantity": "500g",
            "manufacturer": "ABC Foods Pvt Ltd",
            "product_name": "ABC Biscuits",
            "declaration": "Present"
        },
        {
            "scan_id": 3,
            "mrp": "₹599",
            "net_quantity": "500g",
            "manufacturer": "ABC Foods Pvt Ltd",
            "product_name": "ABC Biscuits",
            "declaration": "Present"
        }
    ]

    result = detect_compliance_drift(scans)

    print("\nMETRAVISION COMPLIANCE DRIFT")
    print("----------------------------")

    print(
        "Compliance Drift:",
        result["compliance_drift"]
    )

    for change in result["changes"]:
        print("\nField:", change["field"])
        print("Previous:", change["previous_value"])
        print("Current:", change["current_value"])
        print("Type:", change["type"])