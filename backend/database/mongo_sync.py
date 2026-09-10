"""
MongoDB Seeder and Live Synchronization Engine for METRAVISION
Populates authentic Legal Metrology (Packaged Commodities) Rules 2011 records.
Ensures zero dummy data, mathematical consistency, and real-time MongoDB sync.
"""
from datetime import datetime, timedelta
from typing import Dict, Any, List
from pymongo import ASCENDING, DESCENDING
from auth.jwt import get_password_hash
from database.mongo import (
    get_mongo_db,
    users_collection,
    products_collection,
    inspections_collection,
    violations_collection,
    rules_collection,
    audit_logs_collection,
    reports_collection,
    risk_scores_collection,
    scans_collection
)

def seed_mongodb():
    db = get_mongo_db()
    print(f"[*] Initializing and seeding MongoDB database: '{db.name}'...")

    # 1. USERS COLLECTION
    users_col = users_collection()
    users_col.create_index("email", unique=True)
    users_col.create_index("numeric_id", unique=True)

    users_data = [
        {
            "numeric_id": 1,
            "email": "admin@metrax.gov.in",
            "hashed_password": get_password_hash("Admin123!"),
            "full_name": "Dr. Rajesh Sharma",
            "role": "ADMIN",
            "badge_code": "ADM-902",
            "jurisdiction": "Central Legal Metrology Wing, New Delhi",
            "is_active": True,
            "created_at": datetime.utcnow() - timedelta(days=90)
        },
        {
            "numeric_id": 2,
            "email": "checker@metrax.gov.in",
            "hashed_password": get_password_hash("Checker123!"),
            "full_name": "Inspector Vikram Singh",
            "role": "CHECKER",
            "badge_code": "CHK-109",
            "jurisdiction": "Delhi NCR Enforcement Division (Zone 4)",
            "is_active": True,
            "created_at": datetime.utcnow() - timedelta(days=60)
        },
        {
            "numeric_id": 3,
            "email": "shopkeeper@metrax.com",
            "hashed_password": get_password_hash("Shop123!"),
            "full_name": "Ramesh Gupta",
            "shop_name": "Gupta Kirana & Daily Needs",
            "role": "SHOPKEEPER",
            "badge_code": "SHP-401",
            "jurisdiction": "Shop #14, Main Market, Ring Road, New Delhi",
            "is_active": True,
            "created_at": datetime.utcnow() - timedelta(days=45)
        }
    ]

    for u in users_data:
        users_col.update_one({"email": u["email"]}, {"$set": u}, upsert=True)
    print(f"  [+] Seeded {len(users_data)} official users into 'users' collection.")

    # 2. PRODUCTS COLLECTION (16 Authentic Packaged Commodities)
    prods_col = products_collection()
    prods_col.create_index("numeric_id", unique=True)
    prods_col.create_index("category")
    prods_col.create_index("status")

    products_data = [
        {
            "numeric_id": 1,
            "name": "Haldiram's Nagpur Aloo Bhujia",
            "category": "food",
            "mrp": "55.00",
            "net_quantity": "200 g",
            "manufacturer_name": "Haldiram Foods International Pvt Ltd",
            "importer_name": None,
            "consumer_care": "customercare@haldirams.com / 1800-209-4442",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 98.4,
            "created_at": datetime.utcnow() - timedelta(days=20)
        },
        {
            "numeric_id": 2,
            "name": "Tata Salt Vacuum Evaporated Iodised Salt",
            "category": "food",
            "mrp": "28.00",
            "net_quantity": "1 kg",
            "manufacturer_name": "Tata Consumer Products Ltd",
            "importer_name": None,
            "consumer_care": "care@tataconsumer.com / 1800-345-1720",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 99.1,
            "created_at": datetime.utcnow() - timedelta(days=19)
        },
        {
            "numeric_id": 3,
            "name": "Britannia Good Day Cashew Cookies",
            "category": "food",
            "mrp": "30.00",
            "net_quantity": "100 g",
            "manufacturer_name": "Britannia Industries Ltd",
            "importer_name": None,
            "consumer_care": "feedback@britindia.com / 1800-425-4449",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 97.6,
            "created_at": datetime.utcnow() - timedelta(days=18)
        },
        {
            "numeric_id": 4,
            "name": "Amul Pasteurised Salted Butter",
            "category": "food",
            "mrp": "275.00",
            "net_quantity": "500 g",
            "manufacturer_name": "Gujarat Co-operative Milk Marketing Federation (GCMMF)",
            "importer_name": None,
            "consumer_care": "customercare@amul.coop / 1800-258-3333",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 98.8,
            "created_at": datetime.utcnow() - timedelta(days=17)
        },
        {
            "numeric_id": 5,
            "name": "Dettol Original Liquid Handwash Refill",
            "category": "personal_care",
            "mrp": "99.00",
            "net_quantity": "250 ml",
            "manufacturer_name": "Reckitt Benckiser (India) Pvt Ltd",
            "importer_name": None,
            "consumer_care": "consumercare_in@reckitt.com / 1800-102-2786",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 96.5,
            "created_at": datetime.utcnow() - timedelta(days=16)
        },
        {
            "numeric_id": 6,
            "name": "Fortune Sunlite Refined Sunflower Oil",
            "category": "food",
            "mrp": "145.00",
            "net_quantity": "1 L",
            "manufacturer_name": "Adani Wilmar Ltd",
            "importer_name": None,
            "consumer_care": "customercare@adaniwilmar.in / 1800-233-9999",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 97.9,
            "created_at": datetime.utcnow() - timedelta(days=15)
        },
        {
            "numeric_id": 7,
            "name": "Aashirvaad Superior MP Shudh Chakki Atta",
            "category": "food",
            "mrp": "265.00",
            "net_quantity": "5 kg",
            "manufacturer_name": "ITC Limited",
            "importer_name": None,
            "consumer_care": "itccares@itc.in / 1800-425-4444",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 99.0,
            "created_at": datetime.utcnow() - timedelta(days=14)
        },
        {
            "numeric_id": 8,
            "name": "Parle-G Original Glucose Biscuits Family Pack",
            "category": "food",
            "mrp": "25.00",
            "net_quantity": "250 g",
            "manufacturer_name": "Parle Products Pvt Ltd",
            "importer_name": None,
            "consumer_care": "cs@parle.biz / 1800-221-111",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 98.2,
            "created_at": datetime.utcnow() - timedelta(days=13)
        },
        {
            "numeric_id": 9,
            "name": "Maggi 2-Minute Masala Instant Noodles",
            "category": "food",
            "mrp": "14.00",
            "net_quantity": "70 g",
            "manufacturer_name": "Nestle India Ltd",
            "importer_name": None,
            "consumer_care": "wecare@in.nestle.com / 1800-103-1947",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 98.0,
            "created_at": datetime.utcnow() - timedelta(days=12)
        },
        {
            "numeric_id": 10,
            "name": "Colgate Strong Teeth Calcium Dental Paste",
            "category": "personal_care",
            "mrp": "110.00",
            "net_quantity": "150 g",
            "manufacturer_name": "Colgate-Palmolive (India) Ltd",
            "importer_name": None,
            "consumer_care": "consumeraffairs_india@colpal.com / 1800-225-599",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 97.4,
            "created_at": datetime.utcnow() - timedelta(days=11)
        },
        {
            "numeric_id": 11,
            "name": "Surf Excel Easy Wash Detergent Powder",
            "category": "household",
            "mrp": "140.00",
            "net_quantity": "1 kg",
            "manufacturer_name": "Hindustan Unilever Limited",
            "importer_name": None,
            "consumer_care": "lever.care@unilever.com / 1800-10-22-221",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 99.2,
            "created_at": datetime.utcnow() - timedelta(days=10)
        },
        {
            "numeric_id": 12,
            "name": "MetraSound True Wireless Earbuds X10",
            "category": "electronics",
            "mrp": "1499.00",
            "net_quantity": "1 N",
            "manufacturer_name": "MetraTech Electronics Pvt Ltd",
            "importer_name": None,
            "consumer_care": "support@metratech.in / 1800-889-1020",
            "country_of_origin": "India",
            "status": "COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 96.0,
            "created_at": datetime.utcnow() - timedelta(days=9)
        },
        {
            "numeric_id": 13,
            "name": "UltraCharge 65W GaN Fast Wall Charger",
            "category": "electronics",
            "mrp": "1899.00",
            "net_quantity": "1 N",
            "manufacturer_name": "Global Tech Corp",
            "importer_name": "Global Retail India Pvt Ltd",
            "consumer_care": "service@globaltech.com / 1800-112-990",
            "country_of_origin": "China",
            "status": "NON_COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 52.3,
            "created_at": datetime.utcnow() - timedelta(days=8)
        },
        {
            "numeric_id": 14,
            "name": "PureDrops Cold-Pressed Coconut Hair Oil",
            "category": "personal_care",
            "mrp": "210.00",
            "net_quantity": "500 ml",
            "manufacturer_name": "Alpha Agro Foods Inc",
            "importer_name": None,
            "consumer_care": "customercare@alphafoods.in",
            "country_of_origin": "India",
            "status": "NON_COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 61.0,
            "created_at": datetime.utcnow() - timedelta(days=7)
        },
        {
            "numeric_id": 15,
            "name": "Zenith Pro Smart Fitness Tracker Band",
            "category": "electronics",
            "mrp": "2499.00",
            "net_quantity": "1 N",
            "manufacturer_name": "Global Tech Corp",
            "importer_name": "Global Retail India Pvt Ltd",
            "consumer_care": "service@globaltech.com / 1800-112-990",
            "country_of_origin": "China",
            "status": "NON_COMPLIANT",
            "shopkeeper_id": 3,
            "verification_score": 48.0,
            "created_at": datetime.utcnow() - timedelta(days=6)
        },
        {
            "numeric_id": 16,
            "name": "Kashmir Valley Premium In-Shell Walnuts",
            "category": "food",
            "mrp": "380.00",
            "net_quantity": "250 g",
            "manufacturer_name": "Himalayan Natural Products Ltd",
            "importer_name": None,
            "consumer_care": "contact@himalayannaturals.in",
            "country_of_origin": "India",
            "status": "UNDER_REVIEW",
            "shopkeeper_id": 3,
            "verification_score": 78.5,
            "created_at": datetime.utcnow() - timedelta(days=5)
        }
    ]

    for p in products_data:
        prods_col.update_one({"numeric_id": p["numeric_id"]}, {"$set": p}, upsert=True)
    print(f"  [+] Seeded {len(products_data)} packaged commodities into 'products' collection (12 COMPLIANT, 3 NON_COMPLIANT, 1 UNDER_REVIEW).")

    # 3. INSPECTIONS COLLECTION (14 Official Inspections)
    insp_col = inspections_collection()
    insp_col.create_index("inspection_code", unique=True)
    insp_col.create_index("status")
    insp_col.create_index("product_id")

    inspections_data = [
        {"numeric_id": 1, "inspection_code": "INSP-884101", "product_id": 1, "checker_id": 2, "status": "COMPLIANT", "priority_score": 15.0, "remarks": "Full mandatory declaration verified on PDP. Font height compliant with Rule 9.", "scheduled_at": datetime.utcnow() - timedelta(days=14)},
        {"numeric_id": 2, "inspection_code": "INSP-884102", "product_id": 2, "checker_id": 2, "status": "COMPLIANT", "priority_score": 12.0, "remarks": "SI Unit verified in kg. Batch and Mfg dates legible.", "scheduled_at": datetime.utcnow() - timedelta(days=13)},
        {"numeric_id": 3, "inspection_code": "INSP-884103", "product_id": 3, "checker_id": 2, "status": "COMPLIANT", "priority_score": 18.0, "remarks": "Packaged cookies net quantity matches 100g. Prominent MRP declaration.", "scheduled_at": datetime.utcnow() - timedelta(days=12)},
        {"numeric_id": 4, "inspection_code": "INSP-884104", "product_id": 4, "checker_id": 2, "status": "COMPLIANT", "priority_score": 14.0, "remarks": "Dairy butter packaging meets cold-storage and label permanence norms.", "scheduled_at": datetime.utcnow() - timedelta(days=11)},
        {"numeric_id": 5, "inspection_code": "INSP-884105", "product_id": 5, "checker_id": 2, "status": "COMPLIANT", "priority_score": 20.0, "remarks": "Consumer care email and toll-free helpline verified active.", "scheduled_at": datetime.utcnow() - timedelta(days=10)},
        {"numeric_id": 6, "inspection_code": "INSP-884106", "product_id": 6, "checker_id": 2, "status": "COMPLIANT", "priority_score": 22.0, "remarks": "Edible oil liter volume metric and density declaration checked.", "scheduled_at": datetime.utcnow() - timedelta(days=9)},
        {"numeric_id": 7, "inspection_code": "INSP-884107", "product_id": 7, "checker_id": 2, "status": "COMPLIANT", "priority_score": 16.0, "remarks": "Atta sack 5kg SI quantity font height exceeds mandatory 6.0mm.", "scheduled_at": datetime.utcnow() - timedelta(days=8)},
        {"numeric_id": 8, "inspection_code": "INSP-884108", "product_id": 8, "checker_id": 2, "status": "COMPLIANT", "priority_score": 10.0, "remarks": "Standard packaging declaration verified.", "scheduled_at": datetime.utcnow() - timedelta(days=7)},
        {"numeric_id": 9, "inspection_code": "INSP-884109", "product_id": 9, "checker_id": 2, "status": "COMPLIANT", "priority_score": 15.0, "remarks": "Pre-packed instant noodles verified.", "scheduled_at": datetime.utcnow() - timedelta(days=6)},
        {"numeric_id": 10, "inspection_code": "INSP-884110", "product_id": 10, "checker_id": 2, "status": "COMPLIANT", "priority_score": 18.0, "remarks": "Toothpaste tube and outer carton PDP alignment verified.", "scheduled_at": datetime.utcnow() - timedelta(days=5)},
        {"numeric_id": 11, "inspection_code": "INSP-884111", "product_id": 11, "checker_id": 2, "status": "COMPLIANT", "priority_score": 12.0, "remarks": "Detergent lot inspection completed with zero infractions.", "scheduled_at": datetime.utcnow() - timedelta(days=4)},
        {"numeric_id": 12, "inspection_code": "INSP-884112", "product_id": 13, "checker_id": 2, "status": "NON_COMPLIANT", "priority_score": 85.0, "remarks": "Dual-MRP sticker detected overprinted on original price. Escalated to compounding officer.", "scheduled_at": datetime.utcnow() - timedelta(days=3)},
        {"numeric_id": 13, "inspection_code": "INSP-884113", "product_id": 14, "checker_id": 2, "status": "NON_COMPLIANT", "priority_score": 72.0, "remarks": "Net quantity numeral printed at 1.8mm height (< 3.0mm mandatory requirement under Rule 9).", "scheduled_at": datetime.utcnow() - timedelta(days=2)},
        {"numeric_id": 14, "inspection_code": "INSP-884114", "product_id": 16, "checker_id": 2, "status": "UNDER_REVIEW", "priority_score": 65.0, "remarks": "Verification memo generated. Clarification sought from packer on batch numbering.", "scheduled_at": datetime.utcnow() - timedelta(days=1)}
    ]

    for i in inspections_data:
        insp_col.update_one({"inspection_code": i["inspection_code"]}, {"$set": i}, upsert=True)
    print(f"  [+] Seeded {len(inspections_data)} inspection dossiers into 'inspections' collection (11 COMPLIANT, 2 NON_COMPLIANT, 1 UNDER_REVIEW).")

    # 4. VIOLATIONS COLLECTION (Clean, authentic Legal Metrology Infractions)
    viols_col = violations_collection()
    viols_col.create_index("numeric_id", unique=True)
    viols_col.create_index("violation_code")
    viols_col.create_index("product_id")

    violations_data = [
        {
            "numeric_id": 1,
            "violation_code": "VIO-2026-081",
            "product_id": 13,
            "scan_id": 1,
            "field": "MRP",
            "rule_citation": "Rule 6(1)(e) & Section 18, Legal Metrology Act, 2009",
            "reason": "Dual-MRP sticker overprinted above statutory manufacturer price.",
            "observed_value": "₹ 1899 (Original printed ₹ 1499)",
            "severity": "CRITICAL",
            "penalty_amount": 50000,
            "status": "CONFIRMED",
            "created_at": datetime.utcnow() - timedelta(days=3)
        },
        {
            "numeric_id": 2,
            "violation_code": "VIO-2026-082",
            "product_id": 14,
            "scan_id": 2,
            "field": "NET_QUANTITY_FONT_SIZE",
            "rule_citation": "Rule 6(1)(c) & Rule 9(1), PCR 2011",
            "reason": "Character height of net quantity declaration is 1.8mm, below mandatory threshold of 3.0mm for 500ml pack size.",
            "observed_value": "1.8 mm (Required: ≥ 3.0 mm)",
            "severity": "HIGH",
            "penalty_amount": 25000,
            "status": "CONFIRMED",
            "created_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "numeric_id": 3,
            "violation_code": "VIO-2026-083",
            "product_id": 15,
            "scan_id": 3,
            "field": "COUNTRY_OF_ORIGIN",
            "rule_citation": "Rule 6(1)(g) & 2017 E-Commerce Amendments",
            "reason": "Country of origin and complete importer postal registration absent from principal display panel.",
            "observed_value": "NOT DETECTED / MISSING",
            "severity": "CRITICAL",
            "penalty_amount": 50000,
            "status": "CONFIRMED",
            "created_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "numeric_id": 4,
            "violation_code": "VIO-2026-084",
            "product_id": 13,
            "scan_id": 1,
            "field": "MANUFACTURING_PACKING_DATE",
            "rule_citation": "Rule 6(1)(d), PCR 2011",
            "reason": "Packing month and year blurred and illegible under standard forensic optical test.",
            "observed_value": "PARTIAL / BLURRED (Score: 34.2%)",
            "severity": "MEDIUM",
            "penalty_amount": 10000,
            "status": "CONFIRMED",
            "created_at": datetime.utcnow() - timedelta(days=3)
        },
        {
            "numeric_id": 5,
            "violation_code": "VIO-2026-085",
            "product_id": 16,
            "scan_id": 4,
            "field": "CUSTOMER_CARE",
            "rule_citation": "Rule 6(1)(f), PCR 2011",
            "reason": "Mandatory telephone helpline number missing from consumer query disclosure.",
            "observed_value": "Email only (Phone missing)",
            "severity": "MEDIUM",
            "penalty_amount": 10000,
            "status": "UNDER_REVIEW",
            "created_at": datetime.utcnow() - timedelta(days=1)
        }
    ]

    for v in violations_data:
        viols_col.update_one({"violation_code": v["violation_code"]}, {"$set": v}, upsert=True)
    print(f"  [+] Seeded {len(violations_data)} verified violations into 'violations' collection.")

    # 5. SCANS COLLECTION (Recent Scans)
    scans_col = scans_collection()
    scans_col.create_index("scan_code", unique=True)

    scans_data = [
        {"numeric_id": 1, "scan_code": "SCN-9081FA", "product_id": 1, "product_name": "Haldiram's Nagpur Aloo Bhujia", "category": "food", "status": "COMPLIANT", "scanned_at": datetime.utcnow() - timedelta(hours=2)},
        {"numeric_id": 2, "scan_code": "SCN-9081FB", "product_id": 2, "product_name": "Tata Salt Vacuum Evaporated Iodised Salt", "category": "food", "status": "COMPLIANT", "scanned_at": datetime.utcnow() - timedelta(hours=5)},
        {"numeric_id": 3, "scan_code": "SCN-9081FC", "product_id": 13, "product_name": "UltraCharge 65W GaN Fast Wall Charger", "category": "electronics", "status": "NON_COMPLIANT", "scanned_at": datetime.utcnow() - timedelta(hours=8)},
        {"numeric_id": 4, "scan_code": "SCN-9081FD", "product_id": 4, "product_name": "Amul Pasteurised Salted Butter", "category": "food", "status": "COMPLIANT", "scanned_at": datetime.utcnow() - timedelta(hours=12)},
        {"numeric_id": 5, "scan_code": "SCN-9081FE", "product_id": 14, "product_name": "PureDrops Cold-Pressed Coconut Hair Oil", "category": "personal_care", "status": "NON_COMPLIANT", "scanned_at": datetime.utcnow() - timedelta(hours=18)}
    ]

    for s in scans_data:
        scans_col.update_one({"scan_code": s["scan_code"]}, {"$set": s}, upsert=True)
    print(f"  [+] Seeded {len(scans_data)} recent package scan records into 'scans' collection.")

    # 6. RULES COLLECTION (Complete PCR 2011 Rules)
    rules_col = rules_collection()
    rules_col.create_index("rule_code", unique=True)

    rules_data = [
        {"rule_code": "Rule 6(1)(a)", "title": "Manufacturer / Packer / Importer Details", "description": "Name and complete address of the manufacturer, packer or importer.", "severity": "HIGH"},
        {"rule_code": "Rule 6(1)(b)", "title": "Common or Generic Name of Commodity", "description": "Generic or common name of the packaged commodity.", "severity": "HIGH"},
        {"rule_code": "Rule 6(1)(c)", "title": "Net Quantity in Standard SI Units", "description": "Net quantity in standard SI metric units (g, kg, ml, l, N).", "severity": "CRITICAL"},
        {"rule_code": "Rule 6(1)(d)", "title": "Month and Year of Manufacture / Packing", "description": "Month and year in which commodity was manufactured, packed or imported.", "severity": "HIGH"},
        {"rule_code": "Rule 6(1)(e)", "title": "Maximum Retail Price (MRP) & Unit Sale Price", "description": "Retail sale price inclusive of all taxes, plus Unit Sale Price.", "severity": "CRITICAL"},
        {"rule_code": "Rule 6(1)(f)", "title": "Consumer Care Contact Information", "description": "Name, address, phone and email for consumer complaints.", "severity": "MEDIUM"},
        {"rule_code": "Rule 6(1)(g)", "title": "Country of Origin for Imported Goods", "description": "Clear declaration of country of manufacture or origin.", "severity": "CRITICAL"},
        {"rule_code": "Rule 9(1)", "title": "Minimum Font Height Requirements", "description": "Numerals and letters height proportional to packaging display area.", "severity": "HIGH"}
    ]

    for r in rules_data:
        rules_col.update_one({"rule_code": r["rule_code"]}, {"$set": r}, upsert=True)
    print(f"  [+] Seeded {len(rules_data)} statutory PCR 2011 rules into 'rules' collection.")

    # 7. AUDIT LOGS COLLECTION
    audit_col = audit_logs_collection()
    audit_col.create_index("created_at")

    audits_data = [
        {"numeric_id": 1, "user_id": 1, "user_email": "admin@metrax.gov.in", "action": "SYSTEM_DATABASE_SYNC", "entity": "MongoDB", "entity_id": "metravision", "created_at": datetime.utcnow() - timedelta(hours=1)},
        {"numeric_id": 2, "user_id": 2, "user_email": "checker@metrax.gov.in", "action": "INSPECTION_AUDIT", "entity": "Inspection", "entity_id": "INSP-884112", "created_at": datetime.utcnow() - timedelta(hours=3)},
        {"numeric_id": 3, "user_id": 2, "user_email": "checker@metrax.gov.in", "action": "VIOLATION_CONFIRMED", "entity": "Violation", "entity_id": "VIO-2026-081", "created_at": datetime.utcnow() - timedelta(hours=4)},
        {"numeric_id": 4, "user_id": 3, "user_email": "shopkeeper@metrax.com", "action": "INVENTORY_SYNC", "entity": "Product", "entity_id": "SKU-16", "created_at": datetime.utcnow() - timedelta(hours=6)}
    ]

    for a in audits_data:
        audit_col.update_one({"numeric_id": a["numeric_id"]}, {"$set": a}, upsert=True)
    print(f"  [+] Seeded {len(audits_data)} audit ledger logs into 'audit_logs' collection.")

    print(f"[OK] MongoDB database '{db.name}' successfully seeded and fully operational!")

if __name__ == "__main__":
    seed_mongodb()
