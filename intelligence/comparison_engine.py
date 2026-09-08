def compare_products(physical, online):
    """
    Compare physical package data with online listing data.
    """

    fields = [
        "product_name",
        "mrp",
        "net_quantity",
        "manufacturer",
        "importer",
        "country_of_origin",
        "consumer_care",
        "unit_sale_price"
    ]

    comparisons = []

    for field in fields:

        physical_value = physical.get(field)
        online_value = online.get(field)

        physical_confidence = physical.get(
            field + "_confidence",
            0.0
        )

        online_confidence = online.get(
            field + "_confidence",
            0.0
        )

        if physical_value is None or online_value is None:

            status = "INSUFFICIENT_DATA"

        elif str(physical_value).strip().lower() == \
                str(online_value).strip().lower():

            status = "MATCH"

        else:

            status = "MISMATCH"

        comparison_confidence = round(
            (
                physical_confidence
                + online_confidence
            ) / 2,
            2
        )

        if comparison_confidence >= 0.70:

            confidence_level = "HIGH"

        elif comparison_confidence >= 0.50:

            confidence_level = "MEDIUM"

        else:

            confidence_level = "LOW"

        if status == "MISMATCH":

            if comparison_confidence < 0.70:

                final_status = (
                    "MANUAL_VERIFICATION_RECOMMENDED"
                )

            else:

                final_status = "CONFIRMED_MISMATCH"

        else:

            final_status = status

        comparisons.append({

            "field": field,

            "physical_value":
                physical_value,

            "online_value":
                online_value,

            "physical_confidence":
                physical_confidence,

            "online_confidence":
                online_confidence,

            "comparison_confidence":
                comparison_confidence,

            "confidence_level":
                confidence_level,

            "status":
                final_status
        })

    return comparisons


def get_mismatches(comparisons):
    """
    Return confirmed mismatches only.
    """

    return [
        item
        for item in comparisons
        if item["status"] == "CONFIRMED_MISMATCH"
    ]


def requires_manual_verification(comparisons):
    """
    Return fields where comparison confidence is low.
    """

    return [
        item
        for item in comparisons
        if item["status"]
        == "MANUAL_VERIFICATION_RECOMMENDED"
    ]


# =====================================================
# TEST
# =====================================================

if __name__ == "__main__":

    physical_product = {

        "product_name":
            "ABC Biscuits",

        "product_name_confidence":
            0.95,

        "mrp":
            "₹499",

        "mrp_confidence":
            0.95,

        "net_quantity":
            "500g",

        "net_quantity_confidence":
            0.94,

        "manufacturer":
            "ABC Foods Pvt Ltd",

        "manufacturer_confidence":
            0.92,

        "importer":
            "ABC Imports",

        "importer_confidence":
            0.90,

        "country_of_origin":
            "India",

        "country_of_origin_confidence":
            0.96,

        "consumer_care":
            "1800123456",

        "consumer_care_confidence":
            0.91,

        "unit_sale_price":
            "₹99.80/kg",

        "unit_sale_price_confidence":
            0.90
    }


    online_product = {

        "product_name":
            "ABC Biscuits",

        "product_name_confidence":
            0.94,

        "mrp":
            "₹599",

        "mrp_confidence":
            0.94,

        "net_quantity":
            "500g",

        "net_quantity_confidence":
            0.93,

        "manufacturer":
            "ABC Foods Pvt Ltd",

        "manufacturer_confidence":
            0.92,

        "importer":
            "ABC Imports",

        "importer_confidence":
            0.89,

        "country_of_origin":
            "India",

        "country_of_origin_confidence":
            0.95,

        "consumer_care":
            "1800123456",

        "consumer_care_confidence":
            0.90,

        "unit_sale_price":
            "₹119.80/kg",

        "unit_sale_price_confidence":
            0.90
    }


    comparisons = compare_products(
        physical_product,
        online_product
    )


    print("\nMETRAVISION CROSS-CHANNEL COMPARISON")
    print("-------------------------------------")


    for item in comparisons:

        print("\nField:",
              item["field"])

        print("Physical:",
              item["physical_value"])

        print("Online:",
              item["online_value"])

        print("Comparison Confidence:",
              item["comparison_confidence"])

        print("Confidence Level:",
              item["confidence_level"])

        print("Status:",
              item["status"])


    confirmed = get_mismatches(
        comparisons
    )

    manual = requires_manual_verification(
        comparisons
    )


    print("\nCONFIRMED MISMATCHES")
    print("--------------------")

    for item in confirmed:

        print(
            item["field"],
            "->",
            item["status"]
        )


    print("\nMANUAL VERIFICATION")
    print("-------------------")

    for item in manual:

        print(
            item["field"],
            "->",
            item["status"]
        )