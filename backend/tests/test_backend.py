import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app
from database.connection import get_db
from database.base import Base
import models
from seed import seed_database

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_metrax.db"

engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db=db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_metrax.db"):
        try:
            os.remove("./test_metrax.db")
        except Exception:
            pass

client = TestClient(app)

# --- 1. AUTHENTICATION & JWT TESTS ---
def test_login_success():
    response = client.post("/auth/login", json={"email": "shopkeeper@metrax.com", "password": "Shop123!"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "SHOPKEEPER"

def test_login_invalid_password():
    response = client.post("/auth/login", json={"email": "shopkeeper@metrax.com", "password": "WrongPassword"})
    assert response.status_code == 401

def test_get_current_user():
    login_resp = client.post("/auth/login", json={"email": "admin@metrax.gov.in", "password": "Admin123!"}).json()
    token = login_resp["access_token"]
    
    me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "admin@metrax.gov.in"
    assert me_resp.json()["role"] == "ADMIN"


# --- 2. RBAC & SECURITY OWNERSHIP TESTS ---
def test_admin_dashboard_rbac():
    # Shopkeeper should be forbidden
    sk_token = client.post("/auth/login", json={"email": "shopkeeper@metrax.com", "password": "Shop123!"}).json()["access_token"]
    resp = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {sk_token}"})
    assert resp.status_code == 403

    # Admin should succeed
    adm_token = client.post("/auth/login", json={"email": "admin@metrax.gov.in", "password": "Admin123!"}).json()["access_token"]
    resp2 = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {adm_token}"})
    assert resp2.status_code == 200
    assert "total_products" in resp2.json()

def test_shopkeeper_ownership_isolation():
    # Create product as Shopkeeper 1
    sk_token = client.post("/auth/login", json={"email": "shopkeeper@metrax.com", "password": "Shop123!"}).json()["access_token"]
    
    prod_resp = client.post(
        "/products/",
        json={
            "name": "Shopkeeper 1 Exclusive Product",
            "category": "electronics",
            "mrp": "₹999",
            "net_quantity": "1 N"
        },
        headers={"Authorization": f"Bearer {sk_token}"}
    )
    assert prod_resp.status_code == 200
    p_id = prod_resp.json()["id"]

    # Register Shopkeeper 2
    adm_token = client.post("/auth/login", json={"email": "admin@metrax.gov.in", "password": "Admin123!"}).json()["access_token"]
    client.post(
        "/users/",
        json={"email": "shopkeeper2@metrax.com", "password": "Shop123!", "full_name": "Shopkeeper Two", "role": "SHOPKEEPER"},
        headers={"Authorization": f"Bearer {adm_token}"}
    )
    sk2_token = client.post("/auth/login", json={"email": "shopkeeper2@metrax.com", "password": "Shop123!"}).json()["access_token"]

    # Shopkeeper 2 trying to access Shopkeeper 1's product MUST fail with 403 Forbidden!
    forbidden_resp = client.get(f"/products/{p_id}", headers={"Authorization": f"Bearer {sk2_token}"})
    assert forbidden_resp.status_code == 403


# --- 3. PRODUCT & SCANNING PIPELINE TESTS ---
def test_complete_scan_pipeline():
    sk_token = client.post("/auth/login", json={"email": "shopkeeper@metrax.com", "password": "Shop123!"}).json()["access_token"]
    
    # Get a product ID
    my_prods = client.get("/products/my", headers={"Authorization": f"Bearer {sk_token}"}).json()
    assert len(my_prods) > 0
    p_id = my_prods[0]["id"]

    # Perform package image scan upload
    fake_img = b"FAKEOBER_IMAGE_BYTES_FOR_OCR_PIPELINE_TESTING"
    files = {"file": ("package_label.jpg", fake_img, "image/jpeg")}
    
    scan_resp = client.post(f"/products/{p_id}/scan", files=files, headers={"Authorization": f"Bearer {sk_token}"})
    assert scan_resp.status_code == 200
    res = scan_resp.json()
    assert "scan_id" in res
    assert "declarations" in res
    assert "risk" in res
    assert "compliance" in res


# --- 4. INSPECTIONS & CHECKER DECISIONS TESTS ---
def test_inspections_and_checker_decisions():
    chk_token = client.post("/auth/login", json={"email": "checker@metrax.gov.in", "password": "Checker123!"}).json()["access_token"]
    
    # List priority inspections
    insps = client.get("/inspections/priority", headers={"Authorization": f"Bearer {chk_token}"}).json()
    assert len(insps) > 0
    
    # Submit checker decision on violation
    adm_token = client.post("/auth/login", json={"email": "admin@metrax.gov.in", "password": "Admin123!"}).json()["access_token"]
    v_resp = client.get("/violations/1", headers={"Authorization": f"Bearer {adm_token}"})
    if v_resp.status_code == 200:
        v_id = v_resp.json()["id"]
        dec_resp = client.post(
            f"/violations/{v_id}/decision",
            json={"decision": "CONFIRMED", "remarks": "Mandatory importer details missing on package label."},
            headers={"Authorization": f"Bearer {chk_token}"}
        )
        assert dec_resp.status_code == 200
        assert dec_resp.json()["decision"] == "CONFIRMED"


# --- 5. DIGITAL TWIN, DRIFT & CROSS-CHANNEL LISTINGS ---
def test_digital_twin_and_drift():
    sk_token = client.post("/auth/login", json={"email": "shopkeeper@metrax.com", "password": "Shop123!"}).json()["access_token"]
    my_prods = client.get("/products/my", headers={"Authorization": f"Bearer {sk_token}"}).json()
    p_id = my_prods[0]["id"]

    dt_resp = client.get(f"/products/{p_id}/digital-twin", headers={"Authorization": f"Bearer {sk_token}"})
    assert dt_resp.status_code == 200
    dt_data = dt_resp.json()
    assert "identity" in dt_data
    assert "declarations" in dt_data
    assert "compliance_drift" in dt_data

    # Cross channel comparison test
    comp_resp = client.post(f"/products/{p_id}/compare-online", headers={"Authorization": f"Bearer {sk_token}"})
    assert comp_resp.status_code in [200, 404]


# --- 6. REPORTS & ADMIN ANALYTICS ---
def test_reports_and_admin_analytics():
    adm_token = client.post("/auth/login", json={"email": "admin@metrax.gov.in", "password": "Admin123!"}).json()["access_token"]
    
    # Generate Admin JSON Report
    rep_resp = client.post(
        "/reports/",
        json={"report_type": "ADMIN", "format": "JSON"},
        headers={"Authorization": f"Bearer {adm_token}"}
    )
    assert rep_resp.status_code == 200
    rep_id = rep_resp.json()["id"]

    # Download report
    dl_resp = client.get(f"/reports/{rep_id}/download", headers={"Authorization": f"Bearer {adm_token}"})
    assert dl_resp.status_code == 200

    # Analytics endpoints
    assert client.get("/admin/compliance-statistics", headers={"Authorization": f"Bearer {adm_token}"}).status_code == 200
    assert client.get("/admin/violation-statistics", headers={"Authorization": f"Bearer {adm_token}"}).status_code == 200
    assert client.get("/admin/risk-statistics", headers={"Authorization": f"Bearer {adm_token}"}).status_code == 200
    assert client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {adm_token}"}).status_code == 200


# --- 7. INSTANT SCAN & PRESETS TESTS ---
def test_instant_scan_and_presets():
    chk_token = client.post("/auth/login", json={"email": "checker@metrax.gov.in", "password": "Checker123!"}).json()["access_token"]

    # 1. Presets list
    presets_resp = client.get("/scans/presets")
    assert presets_resp.status_code == 200
    assert isinstance(presets_resp.json(), list)

    # 2. Instant Scan with fake image
    fake_img = b"SAMPLE_PACKAGE_BYTES_FOR_DIRECT_INSTANT_SCAN"
    files = {"file": ("direct_sample.jpg", fake_img, "image/jpeg")}
    scan_resp = client.post(
        "/scans/instant",
        files=files,
        data={"product_name": "Direct Test Commodity", "category": "food"},
        headers={"Authorization": f"Bearer {chk_token}"}
    )
    assert scan_resp.status_code == 200
    res = scan_resp.json()
    assert "scan_id" in res
    assert res["status"] in ["COMPLIANT", "NON_COMPLIANT", "INSUFFICIENT_EVIDENCE"]
    assert "risk" in res
    assert "declarations" in res


# --- 8. AUTO-DETECT & STATUTORY PDF REPORTS ---
def test_auto_detect_commodity():
    shp_token = client.post("/auth/login", json={"email": "shopkeeper@metrax.com", "password": "Shop123!"}).json()["access_token"]
    fake_img = b"MOCK_PACKAGING_IMAGE_FOR_AUTO_DETECT"
    files = [("files", ("panel_front.jpg", fake_img, "image/jpeg"))]
    resp = client.post("/products/auto-detect", headers={"Authorization": f"Bearer {shp_token}"}, files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert "is_new_commodity" in data
    assert "detected_fields" in data
    assert "missing_fields" in data

def test_statutory_pdf_report_memo():
    chk_token = client.post("/auth/login", json={"email": "checker@metrax.gov.in", "password": "Checker123!"}).json()["access_token"]
    resp = client.post("/reports/", headers={"Authorization": f"Bearer {chk_token}"}, json={"report_type": "CHECKER", "format": "PDF"})
    assert resp.status_code == 200
    r_data = resp.json()
    assert r_data["format"] == "PDF"
    
    # Download check
    dl = client.get(f"/reports/{r_data['id']}/download", headers={"Authorization": f"Bearer {chk_token}"})
    assert dl.status_code == 200
    assert dl.headers["content-type"] == "application/pdf"



# --- 11. ENFORCEMENT CASES & RESPONSIBILITY ENGINE TESTS ---
def test_enforcement_cases_and_responsibility():
    # Login as admin
    login_res = client.post("/auth/login", json={"email": "admin@metrax.gov.in", "password": "Admin123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Evaluate responsibility preview
    eval_res = client.post(
        "/cases/evaluate-responsibility",
        headers=headers,
        json={
            "extracted_data": {
                "manufacturer": "Pinnacle Consumer Products Pvt Ltd",
                "mrp": "Rs. 250",
                "net_quantity": "200g"
            },
            "violations": [
                {"field": "mrp", "message": "MRP font height non-compliant"}
            ]
        }
    )
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["entity_type"] == "MANUFACTURER"
    assert eval_data["officer_confirmation_required"] is True

    # Get Dashboard KPIs
    kpi_res = client.get("/cases/dashboard/kpi", headers=headers)
    assert kpi_res.status_code == 200
    assert "total_cases" in kpi_res.json()

    # List Cases
    cases_res = client.get("/cases", headers=headers)
    assert cases_res.status_code == 200

    # List Responsible Parties
    parties_res = client.get("/responsible-parties", headers=headers)
    assert parties_res.status_code == 200

    # Responsible Parties Stats
    p_stats_res = client.get("/responsible-parties/stats", headers=headers)
    assert p_stats_res.status_code == 200

    # Notifications List
    notifs_res = client.get("/notifications", headers=headers)
    assert notifs_res.status_code == 200
