from risk_engine import calculate_risk_score
from priority_engine import calculate_priority_score
from recommendation_engine import (
    generate_recommendation,
    generate_explanation
)
from evidence_engine import create_evidence_chain
from evidence_engine import validate_evidence
from decision_engine import make_decision
from officer_recommendation import (
    generate_officer_recommendation
)
from comparison_engine import (
    compare_products,
    get_mismatches,
    requires_manual_verification
)


def analyze_product(
    issues,
    violation_history=0,
    manufacturer_history=0,
    repeat_violation=False,
    violation_frequency=0,
    physical_product=None,
    online_product=None
):
    """
    Complete METRAVISION intelligence analysis.
    """

    # -----------------------------
    # 1. Calculate Risk
    # -----------------------------

    risk_result = calculate_risk_score(
        issues,
        violation_history=violation_history,
        repeat_violation=repeat_violation
    )

    risk_score = risk_result["risk_score"]
    risk_level = risk_result["risk_level"]

    # -----------------------------
    # 2. Calculate Inspection Priority
    # -----------------------------

    priority_result = calculate_priority_score(
        risk_score=risk_score,
        repeat_violation=repeat_violation,
        severity_score=risk_result["severity_score"],
        violation_frequency=violation_frequency
    )

    priority_score = priority_result["priority_score"]

    inspection_priority = priority_result[
        "inspection_priority"
    ]

    # -----------------------------
    # 3. Create Evidence Chain
    # -----------------------------

    evidence_chain = create_evidence_chain(
        issues
    )

    # -----------------------------
    # 4. Validate Evidence
    # -----------------------------

    validated_evidence = []

    for evidence in evidence_chain:

        validation = validate_evidence(
            evidence
        )

        evidence["valid"] = validation["valid"]

        evidence["validation_errors"] = (
            validation["errors"]
        )

        validated_evidence.append(evidence)

    # -----------------------------
    # 5. Overall Evidence Confidence
    # -----------------------------

    if len(validated_evidence) > 0:

        total_confidence = 0

        for evidence in validated_evidence:

            total_confidence += evidence[
                "evidence_confidence"
            ]

        overall_confidence = round(
            total_confidence
            / len(validated_evidence),
            2
        )

    else:

        overall_confidence = 0.0

    # -----------------------------
    # 6. Check Overall Evidence
    # -----------------------------

    evidence_valid = all(
        evidence["valid"]
        for evidence in validated_evidence
    )

    # -----------------------------
    # 7. Human-in-the-Loop
    # -----------------------------

    manual_review_required = (
        overall_confidence < 0.70
    )

    if manual_review_required:

        manual_review_message = (
            "MANUAL REVIEW REQUIRED"
        )

    else:

        manual_review_message = (
            "Automatic evidence processing allowed."
        )

    # -----------------------------
    # 8. Cross-Channel Comparison
    # -----------------------------

    comparison_results = []

    confirmed_mismatches = []

    comparison_manual_reviews = []

    if (
        physical_product is not None
        and online_product is not None
    ):

        comparison_results = compare_products(
            physical_product,
            online_product
        )

        confirmed_mismatches = get_mismatches(
            comparison_results
        )

        comparison_manual_reviews = (
            requires_manual_verification(
                comparison_results
            )
        )

    # -----------------------------
    # 9. Decision Engine
    # -----------------------------

    decision_result = make_decision(
        risk_level=risk_level,
        evidence_confidence=overall_confidence,
        evidence_valid=evidence_valid,
        inspection_priority=inspection_priority
    )

    officer_decision = decision_result[
        "officer_decision"
    ]

    decision_reason = decision_result[
        "decision_reason"
    ]

    # -----------------------------
    # 10. Officer Recommendation
    # -----------------------------

    officer_result = generate_officer_recommendation(
        officer_decision=officer_decision,
        risk_level=risk_level,
        inspection_priority=inspection_priority
    )

    # -----------------------------
    # 11. Explanations
    # -----------------------------

    explanations = generate_explanation(
        issues
    )

    # -----------------------------
    # 12. General Recommendation
    # -----------------------------

    recommendation = generate_recommendation(
        risk_level,
        "URGENT"
        if inspection_priority == 1
        else "HIGH",
        issues
    )

    # -----------------------------
    # 13. Final Intelligence Output
    # -----------------------------

    return {

        # -------------------------
        # Risk
        # -------------------------

        "risk": {

            "risk_score": risk_score,

            "risk_level": risk_level,

            "severity_score": risk_result[
                "severity_score"
            ],

            "confidence_score": risk_result[
                "confidence_score"
            ],

            "history_score": risk_result[
                "history_score"
            ],

            "repeat_score": risk_result[
                "repeat_score"
            ]
        },

        # -------------------------
        # Evidence
        # -------------------------

        "evidence": {

            "overall_confidence":
                overall_confidence,

            "evidence_valid":
                evidence_valid,

            "records":
                validated_evidence
        },

        # -------------------------
        # Human-in-the-Loop
        # -------------------------

        "manual_review": {

            "required":
                manual_review_required,

            "message":
                manual_review_message
        },

        # -------------------------
        # Cross-Channel Comparison
        # -------------------------

        "comparison": {

            "results":
                comparison_results,

            "confirmed_mismatches":
                confirmed_mismatches,

            "manual_verification":
                comparison_manual_reviews
        },

        # -------------------------
        # History
        # -------------------------

        "history": {

            "violation_history":
                violation_history,

            "manufacturer_history":
                manufacturer_history,

            "repeat_violation":
                repeat_violation,

            "violation_frequency":
                violation_frequency
        },

        # -------------------------
        # Inspection
        # -------------------------

        "inspection": {

            "priority_score":
                priority_score,

            "inspection_priority":
                inspection_priority
        },

        # -------------------------
        # Officer Decision
        # -------------------------

        "decision": {

            "officer_decision":
                officer_decision,

            "decision_reason":
                decision_reason
        },

        # -------------------------
        # Explanation
        # -------------------------

        "explanations":
            explanations,

        # -------------------------
        # Recommendation
        # -------------------------

        "recommendation":
            recommendation,

        # -------------------------
        # Officer Recommendation
        # -------------------------

        "officer_recommendation":
            officer_result[
                "officer_recommendation"
            ]
    }


# =====================================================
# TEST
# =====================================================

if __name__ == "__main__":

    # ---------------------------------
    # Violation Data
    # ---------------------------------

    issues = [

        {
            "type": "mrp_violation",

            "detected_text":
                "MRP ₹999",

            "bounding_box":
                [120, 250, 180, 50],

            "rule_id":
                "LM-PC-001",

            "reason":
                "MRP declaration is required.",

            "confidence":
                0.94,

            "image_quality":
                0.90,

            "rule_certainty":
                1.00
        },

        {
            "type": "missing_declaration",

            "detected_text":
                "",

            "bounding_box":
                [300, 400, 200, 60],

            "rule_id":
                "LM-PC-002",

            "reason":
                "Manufacturer name is required.",

            "confidence":
                0.70,

            "image_quality":
                0.60,

            "rule_certainty":
                1.00
        }
    ]

    # ---------------------------------
    # Physical Product
    # ---------------------------------

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

    # ---------------------------------
    # Online Product
    # ---------------------------------

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

    # ---------------------------------
    # Run Complete Analysis
    # ---------------------------------

    result = analyze_product(

        issues,

        violation_history=2,

        manufacturer_history=5,

        repeat_violation=True,

        violation_frequency=2,

        physical_product=physical_product,

        online_product=online_product
    )

    # ---------------------------------
    # Final Output
    # ---------------------------------

    print("\nMETRAVISION FINAL INTELLIGENCE")
    print("--------------------------------")

    # ---------------------------------
    # RISK
    # ---------------------------------

    print("\nRISK")
    print("----")

    print(
        "Risk Score:",
        result["risk"]["risk_score"]
    )

    print(
        "Risk Level:",
        result["risk"]["risk_level"]
    )

    print(
        "Severity Score:",
        result["risk"]["severity_score"]
    )

    print(
        "Confidence Score:",
        result["risk"]["confidence_score"]
    )

    # ---------------------------------
    # EVIDENCE
    # ---------------------------------

    print("\nEVIDENCE")
    print("--------")

    print(
        "Overall Confidence:",
        result["evidence"]["overall_confidence"]
    )

    print(
        "Evidence Valid:",
        result["evidence"]["evidence_valid"]
    )

    for evidence in result[
        "evidence"
    ]["records"]:

        print(
            "\nViolation:",
            evidence["violation"]
        )

        print(
            "Detected Text:",
            evidence["detected_text"]
        )

        print(
            "Bounding Box:",
            evidence["bounding_box"]
        )

        print(
            "Rule:",
            evidence["rule_id"]
        )

        print(
            "Reason:",
            evidence["reason"]
        )

        print(
            "OCR Confidence:",
            evidence["ocr_confidence"]
        )

        print(
            "Image Quality:",
            evidence["image_quality"]
        )

        print(
            "Rule Certainty:",
            evidence["rule_certainty"]
        )

        print(
            "Evidence Confidence:",
            evidence["evidence_confidence"]
        )

        print(
            "Confidence Level:",
            evidence["confidence_level"]
        )

        print(
            "Valid:",
            evidence["valid"]
        )

    # ---------------------------------
    # HUMAN-IN-THE-LOOP
    # ---------------------------------

    print("\nHUMAN-IN-THE-LOOP")
    print("-----------------")

    print(
        "Evidence Confidence:",
        result["evidence"]["overall_confidence"]
    )

    print(
        "Manual Review Required:",
        result["manual_review"]["required"]
    )

    print(
        "Status:",
        result["manual_review"]["message"]
    )

    # ---------------------------------
    # CROSS-CHANNEL COMPARISON
    # ---------------------------------

    print("\nCROSS-CHANNEL COMPARISON")
    print("------------------------")

    for item in result[
        "comparison"
    ]["results"]:

        print(
            "\nField:",
            item["field"]
        )

        print(
            "Physical:",
            item["physical_value"]
        )

        print(
            "Online:",
            item["online_value"]
        )

        print(
            "Comparison Confidence:",
            item["comparison_confidence"]
        )

        print(
            "Confidence Level:",
            item["confidence_level"]
        )

        print(
            "Status:",
            item["status"]
        )

    # ---------------------------------
    # CONFIRMED MISMATCHES
    # ---------------------------------

    print("\nCONFIRMED MISMATCHES")
    print("--------------------")

    for item in result[
        "comparison"
    ]["confirmed_mismatches"]:

        print(
            item["field"],
            "->",
            item["physical_value"],
            "vs",
            item["online_value"]
        )

    # ---------------------------------
    # COMPARISON MANUAL VERIFICATION
    # ---------------------------------

    print("\nCOMPARISON MANUAL VERIFICATION")
    print("------------------------------")

    for item in result[
        "comparison"
    ]["manual_verification"]:

        print(
            item["field"],
            "->",
            item["status"]
        )

    # ---------------------------------
    # INSPECTION
    # ---------------------------------

    print("\nINSPECTION")
    print("----------")

    print(
        "Priority Score:",
        result["inspection"]["priority_score"]
    )

    print(
        "Inspection Priority:",
        result["inspection"]["inspection_priority"]
    )

    # ---------------------------------
    # OFFICER DECISION
    # ---------------------------------

    print("\nOFFICER DECISION")
    print("----------------")

    print(
        "Decision:",
        result["decision"]["officer_decision"]
    )

    print(
        "Reason:",
        result["decision"]["decision_reason"]
    )

    # ---------------------------------
    # OFFICER RECOMMENDATION
    # ---------------------------------

    print("\nOFFICER RECOMMENDATION")
    print("----------------------")

    print(
        result["officer_recommendation"]
    )

    # ---------------------------------
    # WHY IS THIS RISKY?
    # ---------------------------------

    print("\nWHY IS THIS RISKY?")
    print("------------------")

    for item in result["explanations"]:

        print(
            "-",
            item["explanation"]
        )

    # ---------------------------------
    # GENERAL RECOMMENDATION
    # ---------------------------------

    print("\nGENERAL RECOMMENDATION")
    print("----------------------")

    print(
        result["recommendation"]
    )