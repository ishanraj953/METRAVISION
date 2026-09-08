def create_product_versions(scans):
    """
    Create product versions from multiple scans
    and track changes between versions.
    """

    if not scans:
        return []

    versions = []

    tracked_fields = [
        "mrp",
        "net_quantity",
        "manufacturer",
        "declaration",
        "packaging"
    ]

    for index, scan in enumerate(scans):

        version = {
            "version": index + 1,
            "scan_id": scan.get(
                "scan_id",
                index + 1
            ),
            "changes": {}
        }

        if index == 0:
            version["changes"] = {
                "initial_version": True
            }

        else:
            previous_scan = scans[index - 1]

            for field in tracked_fields:

                previous_value = previous_scan.get(field)
                current_value = scan.get(field)

                if (
                    previous_value != current_value
                    and previous_value is not None
                    and current_value is not None
                ):
                    version["changes"][field] = {
                        "previous": previous_value,
                        "current": current_value
                    }

        versions.append(version)

    return versions


# Test
if __name__ == "__main__":

    scans = [
        {
            "scan_id": 1,
            "mrp": "₹499",
            "net_quantity": "500g",
            "manufacturer": "ABC Foods Pvt Ltd",
            "declaration": "Present",
            "packaging": "Blue Pack"
        },
        {
            "scan_id": 2,
            "mrp": "₹499",
            "net_quantity": "500g",
            "manufacturer": "ABC Foods Pvt Ltd",
            "declaration": "Present",
            "packaging": "Blue Pack"
        },
        {
            "scan_id": 3,
            "mrp": "₹599",
            "net_quantity": "500g",
            "manufacturer": "ABC Foods Pvt Ltd",
            "declaration": "Present",
            "packaging": "New Blue Pack"
        }
    ]

    versions = create_product_versions(scans)

    print("\nMETRAVISION PRODUCT VERSIONING")
    print("------------------------------")

    for version in versions:

        print(
            "\nVersion:",
            version["version"]
        )

        print(
            "Scan ID:",
            version["scan_id"]
        )

        if version["changes"]:
            print("Changes:")

            for field, change in version[
                "changes"
            ].items():

                if isinstance(change, dict):
                    print(
                        field,
                        "->",
                        change["previous"],
                        "to",
                        change["current"]
                    )
                else:
                    print(
                        field,
                        "->",
                        change
                    )
        else:
            print("Changes: None")
            