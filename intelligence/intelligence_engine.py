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

# Day 3 imports
from drift_engine import detect_compliance_drift
from version_engine import create_product_versions
from offender_engine import analyze_repeat_offenders
from manufacturer_engine import calculate_manufacturer_risk
from inspection_engine import rank_products
from summary_engine import create_intelligence_summary


def analyze_product(
    issues,
    violation_history=0,
    manufacturer_history=0,
    repeat_violation=False,
    violation_frequency=0,
    physical_product=None,
    online_product=None,
    scans=None,
    offender_records=None,
    manufacturer_profile=None,
    product_risk_data=None
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
    # 9. Compliance Drift Detection
    # -----------------------------

    drift_result = {
        "compliance_drift": False,
        "changes": []
    }

    if scans is not None:

        drift_result = detect_compliance_drift(
            scans
        )

    # -----------------------------
    # 10. Product Versioning
    # -----------------------------

    product_versions = []

    if scans is not None:

        product_versions = create_product_versions(
            scans
        )

    # -----------------------------
    # 11. Repeat Offender Intelligence
    # -----------------------------

    offender_results = []

    if offender_records is not None:

        offender_results = analyze_repeat_offenders(
            offender_records
        )

    repeat_offender_detected = (
        repeat_violation
        or any(
            item["repeat_offender"]
            for item in offender_results
        )
    )

    # -----------------------------
    # 12. Manufacturer Risk Profile
    # -----------------------------

    manufacturer_risk = {}

    if manufacturer_profile is not None:

        manufacturer_risk = calculate_manufacturer_risk(

            manufacturer=manufacturer_profile.get(
                "manufacturer",
                "Unknown"
            ),

            total_inspections=manufacturer_profile.get(
                "total_inspections",
                0
            ),

            total_products=manufacturer_profile.get(
                "total_products",
                0
            ),

            violations=manufacturer_profile.get(
                "violations",
                0
            ),

            repeat_violations=manufacturer_profile.get(
                "repeat_violations",
                0
            )
        )

    # -----------------------------
    # 13. Inspection Recommendation
    # -----------------------------

    inspection_recommendations = []

    if product_risk_data is not None:

        inspection_recommendations = rank_products(
            product_risk_data
        )

    # -----------------------------
    # 14. Decision Engine
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
    # 15. Officer Recommendation
    # -----------------------------

    officer_result = generate_officer_recommendation(
        officer_decision=officer_decision,
        risk_level=risk_level,
        inspection_priority=inspection_priority
    )

    # -----------------------------
    # 16. Explanations
    # -----------------------------

    explanations = generate_explanation(
        issues
    )

    # -----------------------------
    # 17. General Recommendation
    # -----------------------------

    recommendation = generate_recommendation(
        risk_level,
        "URGENT"
        if inspection_priority == 1
        else "HIGH",
        issues
    )

    # -----------------------------
    # 18. Final Intelligence Summary
    # -----------------------------

    online_mismatch_detected = (
        len(confirmed_mismatches) > 0
    )

    final_inspection_priority = (
        inspection_priority
    )

    if inspection_recommendations:

        final_inspection_priority = (
            inspection_recommendations[0][
                "inspection_priority"
            ]
        )

    intelligence_summary = (
        create_intelligence_summary(

            risk_score=risk_score,

            risk_level=risk_level,

            inspection_priority=final_inspection_priority,

            repeat_offender=repeat_offender_detected,

            compliance_drift=drift_result[
                "compliance_drift"
            ],

            online_mismatch=online_mismatch_detected,

            manual_review=manual_review_required
        )
    )

    # -----------------------------
    # 19. Final Intelligence Output
    # -----------------------------

    return {

        # Risk
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

        # Evidence
        "evidence": {

            "overall_confidence":
                overall_confidence,

            "evidence_valid":
                evidence_valid,

            "records":
                validated_evidence
        },

        # Human-in-the-Loop
        "manual_review": {

            "required":
                manual_review_required,

            "message":
                manual_review_message
        },

        # Cross-Channel Comparison
        "comparison": {

            "results":
                comparison_results,

            "confirmed_mismatches":
                confirmed_mismatches,

            "manual_verification":
                comparison_manual_reviews
        },

        # Day 3 - Compliance Drift
        "compliance_drift":
            drift_result,

        # Day 3 - Product Versions
        "product_versions":
            product_versions,

        # Day 3 - Repeat Offender
        "repeat_offender":
            offender_results,

        # Day 3 - Manufacturer Risk
        "manufacturer_risk":
            manufacturer_risk,

        # Day 3 - Inspection Recommendation
        "inspection_recommendations":
            inspection_recommendations,

        # History
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

        # Inspection
        "inspection": {

            "priority_score":
                priority_score,

            "inspection_priority":
                inspection_priority
        },

        # Officer Decision
        "decision": {

            "officer_decision":
                officer_decision,

            "decision_reason":
                decision_reason
        },

        # Explanation
        "explanations":
            explanations,

        # Recommendation
        "recommendation":
            recommendation,

        # Officer Recommendation
        "officer_recommendation":
            officer_result[
                "officer_recommendation"
            ],

        # Final Day 3 Summary
        "intelligence_summary":
            intelligence_summary
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
            "type":
                "mrp_violation",

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
            "type":
                "missing_declaration",

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
    # Phase 12 - Scan History
    # ---------------------------------

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

    # ---------------------------------
    # Phase 14 - Offender Records
    # ---------------------------------

    offender_records = [

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
            "violation_type": "Online mismatch"
        }
    ]

    # ---------------------------------
    # Phase 15 - Manufacturer Profile
    # ---------------------------------

    manufacturer_profile = {

        "manufacturer":
            "ABC Pvt Ltd",

        "total_inspections":
            10,

        "total_products":
            8,

        "violations":
            8,

        "repeat_violations":
            5
    }

    # ---------------------------------
    # Phase 16 - Product Risk Data
    # ---------------------------------

    product_risk_data = [

        {
            "product":
                "Product A",

            "risk_score":
                86,

            "risk_level":
                "CRITICAL",

            "repeat_violation":
                True,

            "compliance_drift":
                True,

            "online_mismatch":
                True
        },

        {
            "product":
                "Product B",

            "risk_score":
                65,

            "risk_level":
                "HIGH",

            "repeat_violation":
                True,

            "compliance_drift":
                False,

            "online_mismatch":
                True
        },

        {
            "product":
                "Product C",

            "risk_score":
                55,

            "risk_level":
                "HIGH",

            "repeat_violation":
                False,

            "compliance_drift":
                True,

            "online_mismatch":
                False
        },

        {
            "product":
                "Product D",

            "risk_score":
                35,

            "risk_level":
                "MEDIUM",

            "repeat_violation":
                False,

            "compliance_drift":
                False,

            "online_mismatch":
                False
        },

        {
            "product":
                "Product E",

            "risk_score":
                15,

            "risk_level":
                "LOW",

            "repeat_violation":
                False,

            "compliance_drift":
                False,

            "online_mismatch":
                False
        }
    ]

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

        online_product=online_product,

        scans=scans,

        offender_records=offender_records,

        manufacturer_profile=manufacturer_profile,

        product_risk_data=product_risk_data
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

    # ---------------------------------
    # HUMAN-IN-THE-LOOP
    # ---------------------------------

    print("\nHUMAN-IN-THE-LOOP")
    print("-----------------")

    print(
        "Manual Review Required:",
        result["manual_review"]["required"]
    )

    print(
        "Status:",
        result["manual_review"]["message"]
    )

    # ---------------------------------
    # CROSS-CHANNEL
    # ---------------------------------

    print("\nCROSS-CHANNEL COMPARISON")
    print("------------------------")

    for item in result[
        "comparison"
    ]["results"]:

        print(
            item["field"],
            ":",
            item["physical_value"],
            "vs",
            item["online_value"],
            "->",
            item["status"]
        )

    # ---------------------------------
    # PHASE 12
    # ---------------------------------

    print("\nCOMPLIANCE DRIFT")
    print("----------------")

    print(
        "Drift Detected:",
        result["compliance_drift"][
            "compliance_drift"
        ]
    )

    for change in result[
        "compliance_drift"
    ]["changes"]:

        print(
            change["field"],
            ":",
            change["previous_value"],
            "->",
            change["current_value"]
        )

    # ---------------------------------
    # PHASE 13
    # ---------------------------------

    print("\nPRODUCT VERSIONING")
    print("-------------------")

    for version in result[
        "product_versions"
    ]:

        print(
            "Version",
            version["version"],
            "| Scan",
            version["scan_id"],
            "| Changes:",
            version["changes"]
        )

    # ---------------------------------
    # PHASE 14
    # ---------------------------------

    print("\nREPEAT OFFENDER INTELLIGENCE")
    print("----------------------------")

    for offender in result[
        "repeat_offender"
    ]:

        print(
            offender["manufacturer"],
            "|",
            offender["product"],
            "| Total Violations:",
            offender["total_violations"],
            "| Repeat Offender:",
            offender["repeat_offender"]
        )

    # ---------------------------------
    # PHASE 15
    # ---------------------------------

    print("\nMANUFACTURER RISK PROFILE")
    print("--------------------------")

    if result["manufacturer_risk"]:

        print(
            "Manufacturer:",
            result["manufacturer_risk"][
                "manufacturer"
            ]
        )

        print(
            "Inspections:",
            result["manufacturer_risk"][
                "total_inspections"
            ]
        )

        print(
            "Products:",
            result["manufacturer_risk"][
                "total_products"
            ]
        )

        print(
            "Violations:",
            result["manufacturer_risk"][
                "violations"
            ]
        )

        print(
            "Repeat Violations:",
            result["manufacturer_risk"][
                "repeat_violations"
            ]
        )

        print(
            "Risk Score:",
            result["manufacturer_risk"][
                "risk_score"
            ]
        )

        print(
            "Risk Level:",
            result["manufacturer_risk"][
                "risk_level"
            ]
        )

    # ---------------------------------
    # PHASE 16
    # ---------------------------------

    print("\nINSPECTION RECOMMENDATION")
    print("-------------------------")

    for index, product in enumerate(
        result["inspection_recommendations"],
        start=1
    ):

        print(
            index,
            ".",
            product["product"],
            "|",
            product["risk_level"],
            "| Score:",
            product["priority_score"],
            "| Priority:",
            product["inspection_priority"]
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
    # FINAL DAY 3 SUMMARY
    # ---------------------------------

    print("\nCOMPLIANCE INTELLIGENCE SUMMARY")
    print("--------------------------------")

    for key, value in result[
        "intelligence_summary"
    ].items():

        print(
            key + ":",
            value
        )

    # ---------------------------------
    # GENERAL RECOMMENDATION
    # ---------------------------------

    print("\nGENERAL RECOMMENDATION")
    print("----------------------")

    print(
        result["recommendation"]
    )