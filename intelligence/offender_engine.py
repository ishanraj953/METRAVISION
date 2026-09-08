def analyze_repeat_offenders(records):
    """
    Analyze repeated violations across manufacturers,
    brands, products, and violation types.
    """

    grouped = {}

    for record in records:

        manufacturer = record.get(
            "manufacturer",
            "Unknown"
        )

        brand = record.get(
            "brand",
            "Unknown"
        )

        product = record.get(
            "product",
            "Unknown"
        )

        violation_type = record.get(
            "violation_type",
            "Unknown"
        )

        key = (
            manufacturer,
            brand,
            product
        )

        if key not in grouped:
            grouped[key] = {
                "manufacturer": manufacturer,
                "brand": brand,
                "product": product,
                "violations": {},
                "total_violations": 0
            }

        if violation_type not in grouped[key]["violations"]:
            grouped[key]["violations"][violation_type] = 0

        grouped[key]["violations"][violation_type] += 1
        grouped[key]["total_violations"] += 1

    results = []

    for data in grouped.values():

        repeat_offender = (
            data["total_violations"] >= 2
        )

        results.append({
            "manufacturer": data["manufacturer"],
            "brand": data["brand"],
            "product": data["product"],
            "violations": data["violations"],
            "total_violations": data["total_violations"],
            "repeat_offender": repeat_offender
        })

    return results


# Test
if __name__ == "__main__":

    records = [
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "MRP violation"
        },
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "MRP violation"
        },
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "MRP violation"
        },
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "Missing declaration"
        },
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "Missing declaration"
        },
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "Online mismatch"
        },
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "Online mismatch"
        },
        {
            "manufacturer": "ABC Pvt Ltd",
            "brand": "ABC",
            "product": "ABC Biscuits",
            "violation_type": "Online mismatch"
        }
    ]

    results = analyze_repeat_offenders(records)

    print("\nMETRAVISION REPEAT OFFENDER INTELLIGENCE")
    print("----------------------------------------")

    for result in results:

        print(
            "\nManufacturer:",
            result["manufacturer"]
        )

        print(
            "Brand:",
            result["brand"]
        )

        print(
            "Product:",
            result["product"]
        )

        print(
            "Violations:",
            result["violations"]
        )

        print(
            "Total Violations:",
            result["total_violations"]
        )

        print(
            "Repeat Offender:",
            result["repeat_offender"]
        )