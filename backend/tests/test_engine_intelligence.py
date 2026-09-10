import pytest
import os
import json
from engine import (
    validate_values,
    apply_conditional_rules,
    validate_declarations,
    generate_explanation,
    apply_officer_override,
    create_audit_log,
)
from intelligence import analyze_product, calculate_risk_score, calculate_priority_score


def test_engine_value_validator():
    data_valid = {"mrp": "₹500", "net_quantity": "500g", "date": "12/08/2026"}
    res_valid = validate_values(data_valid)
    assert res_valid["mrp"] == "VALID"
    assert res_valid["net_quantity"] == "VALID"
    assert res_valid["date"] == "VALID"

    data_invalid = {"mrp": None, "net_quantity": "invalid_qty", "date": "2026-08-12"}
    res_invalid = validate_values(data_invalid)
    assert res_invalid["mrp"] == "INVALID"
    assert res_invalid["net_quantity"] == "INVALID"
    assert res_invalid["date"] == "INVALID"


def test_engine_conditional_rules():
    prod_imported = {"origin": "IMPORTED", "channel": "E_COMMERCE"}
    rules = apply_conditional_rules(prod_imported)
    assert "LM-PC-006" in rules
    assert "LM-PC-009" in rules


def test_engine_declaration_and_explanation():
    req = ["manufacturer_name", "net_quantity", "mrp"]
    det = ["manufacturer_name", "net_quantity"]
    dec_res = validate_declarations(req, det)
    assert dec_res["status"] == "NON_COMPLIANT"
    assert "mrp" in dec_res["violations"]

    exp = generate_explanation({"field": "mrp", "rule_id": "LM-PC-001"})
    assert exp["rule"] == "LM-PC-001"
    assert "MRP" in exp["what"]


def test_engine_officer_override_and_audit():
    override = apply_officer_override(
        violation_id="V-1001",
        system_decision="NON_COMPLIANT",
        officer_override="COMPLIANT",
        reason="Manual inspection verified clear sticker"
    )
    assert override["officer_override"] == "COMPLIANT"

    audit = create_audit_log("LM-PC-001", "OVERRIDE_APPLIED", "COMPLIANT")
    assert audit["status"] == "COMPLIANT"


def test_intelligence_orchestrator():
    issues = [
        {
            "type": "mrp_violation",
            "detected_text": "MRP 999",
            "bounding_box": [10, 10, 100, 30],
            "rule_id": "LM-PC-001",
            "reason": "MRP required",
            "confidence": 0.95,
            "image_quality": 0.90,
            "rule_certainty": 1.00
        }
    ]

    analysis = analyze_product(
        issues,
        violation_history=1,
        manufacturer_history=2,
        repeat_violation=True,
        violation_frequency=1
    )

    assert "risk" in analysis
    assert "decision" in analysis
    assert "officer_recommendation" in analysis
    assert analysis["decision"]["officer_decision"] in ["INSPECT", "VERIFY", "MONITOR", "REVIEW EVIDENCE"]
