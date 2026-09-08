import re

product_data = {
    "mrp": "₹50",
    "net_quantity": "500g",
    "date": "12/08/2026"
}

# MRP Validation
if product_data["mrp"]:
    print("MRP: VALID")
else:
    print("MRP: INVALID")

# Net Quantity Validation
if re.match(r"^\d+(g|kg|ml|l)$", product_data["net_quantity"]):
    print("Net Quantity: VALID")
else:
    print("Net Quantity: INVALID")

# Date Validation
if re.match(r"^\d{2}/\d{2}/\d{4}$", product_data["date"]):
    print("Date: VALID")
else:
    print("Date: INVALID")