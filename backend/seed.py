import json
import datetime
from database.connection import SessionLocal, engine
from database.base import Base
import models
from models.user import User, UserRole
from models.product import Product, ProductImage
from models.scan import Scan
from models.declaration import Declaration
from models.rule import Rule, RuleVersion, ComplianceCheck
from models.violation import Violation
from models.evidence import Evidence
from models.inspection import Inspection, OfficerDecision
from models.risk import RiskScore
from models.listing import OnlineListing, ProductVersion, Report
from models.audit import AuditLog
from auth.jwt import get_password_hash

def seed_database(db=None):
    close_at_end = False
    if db is None:
        print("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_at_end = True

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@metrax.gov.in").first():
            print("Database already seeded!")
            return

        print("Seeding Users...")
        admin = User(
            email="admin@metrax.gov.in",
            hashed_password=get_password_hash("Admin123!"),
            full_name="Chief Compliance Administrator",
            role=UserRole.ADMIN
        )
        shopkeeper = User(
            email="shopkeeper@metrax.com",
            hashed_password=get_password_hash("Shop123!"),
            full_name="Ramesh Electronics & Grocery",
            role=UserRole.SHOPKEEPER
        )
        checker = User(
            email="checker@metrax.gov.in",
            hashed_password=get_password_hash("Checker123!"),
            full_name="Inspector Vikram Singh",
            role=UserRole.CHECKER
        )
        db.add_all([admin, shopkeeper, checker])
        db.commit()
        db.refresh(admin)
        db.refresh(shopkeeper)
        db.refresh(checker)

        print("Seeding Compliance Rules...")
        rules = [
            Rule(rule_code="LM-001", category="electronics", field_name="mrp", rule_description="MRP must be clearly declared in INR inclusive of all taxes.", severity="HIGH"),
            Rule(rule_code="LM-002", category="electronics", field_name="net_quantity", rule_description="Standard Net Quantity declaration required.", severity="HIGH"),
            Rule(rule_code="LM-003", category="electronics", field_name="country_of_origin", rule_description="Country of Origin mandatory for pre-packaged commodities.", severity="HIGH"),
            Rule(rule_code="LM-004", category="electronics", field_name="manufacturer_name", rule_description="Full Manufacturer/Packer name and address required.", severity="HIGH"),
            Rule(rule_code="LM-005", category="electronics", field_name="importer_name", rule_description="Importer details mandatory for imported commodities.", severity="MEDIUM"),
            Rule(rule_code="LM-006", category="electronics", field_name="consumer_care", rule_description="Consumer care email address or helpline number required.", severity="HIGH")
        ]
        db.add_all(rules)
        db.commit()

        print("Seeding Products...")
        p1 = Product(
            name="MetraSound Wireless Headphones X10",
            brand="MetraSound",
            category="electronics",
            mrp="₹499",
            net_quantity="1 N",
            country_of_origin="India",
            manufacturer_name="MetraTech Pvt Ltd",
            importer_name="MetraTech Imports Ltd",
            consumer_care="support@metratech.com",
            shopkeeper_id=shopkeeper.id,
            status="COMPLIANT"
        )
        p2 = Product(
            name="UltraSmart Power Bank 20000mAh",
            brand="UltraSmart",
            category="electronics",
            mrp="₹1499",
            net_quantity="1 N",
            country_of_origin="China",
            manufacturer_name="Global Tech Corp",
            importer_name=None, # Missing Importer -> Non-compliant!
            consumer_care="support@ultrasmart.com",
            shopkeeper_id=shopkeeper.id,
            status="NON_COMPLIANT"
        )
        p3 = Product(
            name="AlphaCharge Fast Car Charger",
            brand="AlphaCharge",
            category="electronics",
            mrp="₹299",
            net_quantity=None, # Missing Net Qty & MRP -> High Risk!
            country_of_origin="India",
            manufacturer_name="Alpha Devices",
            importer_name=None,
            consumer_care=None,
            shopkeeper_id=shopkeeper.id,
            status="NON_COMPLIANT"
        )
        db.add_all([p1, p2, p3])
        db.commit()
        db.refresh(p1)
        db.refresh(p2)
        db.refresh(p3)

        print("Seeding Product Versions & Drift...")
        v1 = ProductVersion(product_id=p1.id, version_number=1, mrp="₹499", net_quantity="1 N", manufacturer_name="MetraTech Pvt Ltd")
        v2 = ProductVersion(product_id=p1.id, version_number=2, mrp="₹599", net_quantity="1 N", manufacturer_name="MetraTech Pvt Ltd") # Drift detected!
        db.add_all([v1, v2])

        print("Seeding Online Listings (Cross-Channel)...")
        l1 = OnlineListing(
            product_id=p1.id,
            platform_name="Flipazon Ecommerce",
            listing_url="https://flipazon.com/p/metrasound-x10",
            product_name="MetraSound Wireless Headphones X10",
            mrp="₹599", # Mismatch with physical MRP ₹499!
            net_quantity="1 N",
            manufacturer_name="MetraTech Pvt Ltd",
            country_of_origin="India"
        )
        l2 = OnlineListing(
            product_id=p2.id,
            platform_name="QuickMart Online",
            listing_url="https://quickmart.com/p/ultrasmart-20000",
            product_name="UltraSmart Power Bank 20000mAh",
            mrp="₹1499",
            net_quantity="1 N",
            manufacturer_name="Global Tech Corp",
            country_of_origin="China"
        )
        db.add_all([l1, l2])

        print("Seeding Scans, Violations & Evidence...")
        scan1 = Scan(scan_code="SCN-SEED01", product_id=p2.id, user_id=shopkeeper.id, status="NON_COMPLIANT")
        db.add(scan1)
        db.commit()
        db.refresh(scan1)

        v_item = Violation(
            violation_code="VIOL-SEED01",
            product_id=p2.id,
            scan_id=scan1.id,
            rule_id=rules[4].id,
            field="importer_name",
            expected_value="Global Tech Imports Pvt Ltd",
            observed_value="MISSING / UNREADABLE",
            severity="HIGH",
            confidence=0.96,
            status="OPEN"
        )
        db.add(v_item)
        db.commit()
        db.refresh(v_item)

        ev_item = Evidence(
            violation_id=v_item.id,
            bbox="[100, 200, 300, 250]",
            detected_text="MISSING IMPORTER DECLARATION",
            ocr_confidence=0.96,
            annotated_image="/storage/annotated/seed_sample.jpg"
        )
        db.add(ev_item)

        print("Seeding Risk Scores & Inspections...")
        risk = RiskScore(
            product_id=p2.id,
            scan_id=scan1.id,
            risk_score=85.0,
            risk_level="HIGH",
            inspection_priority=1,
            repeat_offender=True,
            factors=json.dumps(["Missing mandatory importer declaration", "Repeat manufacturer violation history"])
        )
        db.add(risk)

        insp = Inspection(
            inspection_code="INSP-SEED01",
            product_id=p2.id,
            checker_id=checker.id,
            status="ASSIGNED",
            priority_score=85.0,
            remarks="High priority inspection due to missing importer details on imported power bank."
        )
        db.add(insp)

        # Audit log entry
        audit = AuditLog(
            user_id=admin.id,
            user_email=admin.email,
            action="SYSTEM_SEED",
            entity="System",
            entity_id="1",
            metadata_json=json.dumps({"seeded": True, "timestamp": datetime.datetime.utcnow().isoformat()})
        )
        db.add(audit)

        db.commit()
        print("SEEDING COMPLETED SUCCESSFULLY!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        if close_at_end:
            db.close()

if __name__ == "__main__":
    seed_database()
