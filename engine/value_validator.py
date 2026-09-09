import re

def validate_values(product_data):

    result = {}

    # MRP Validation
    result["mrp"] = "VALID" if product_data.get("mrp") else "INVALID"

    # Net Quantity Validation
    if re.match(r"^\d+(g|kg|ml|l)$", product_data.get("net_quantity", "").lower()):
        result["net_quantity"] = "VALID"
    else:
        result["net_quantity"] = "INVALID"

    # Date Validation
    if re.match(r"^\d{2}/\d{2}/\d{4}$", product_data.get("date", "")):
        result["date"] = "VALID"
    else:
        result["date"] = "INVALID"

    return result


# Testing
if __name__ == "__main__":

    product_data = {
        "mrp": "₹50",
        "net_quantity": "500g",
        "date": "12/08/2026"
    }

    print(validate_values(product_data))