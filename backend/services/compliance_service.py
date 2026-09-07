import uuid
import datetime
import json
from sqlalchemy.orm import Session
from models.product import Product, ProductImage
from models.scan import Scan
from models.declaration import Declaration
from models.violation import Violation
from models.rule import ComplianceCheck
from models.listing import ProductVersion
from services.ai_service import ai_service
from services.rule_service import rule_service
from services.evidence_service import evidence_service
from services.risk_service import risk_service
from utils.image_processing import save_and_process_image

class ComplianceService:
    def scan_product(
        self,
        db: Session,
        product_id: int,
        user_id: int,
        image_bytes: bytes,
        filename: str
    ) -> dict:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")

        # 1. Image Processing & Quality Storage
        img_info = save_and_process_image(image_bytes, filename)

        # 2. Create Scan Record
        scan_code = f"SCN-{str(uuid.uuid4())[:8].upper()}"
        scan = Scan(
            scan_code=scan_code,
            product_id=product.id,
            user_id=user_id,
            status="IN_PROGRESS"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        # 3. Store Original Product Image Metadata
        prod_image = ProductImage(
            product_id=product.id,
            scan_id=scan.id,
            file_path=img_info["original_path"],
            original_filename=img_info["original_filename"],
            file_type=img_info["file_type"],
            file_size=img_info["file_size"],
            image_quality_score=img_info["quality_score"],
            width=img_info["width"],
            height=img_info["height"],
            blur_score=img_info["blur_score"],
            glare_score=img_info["glare_score"],
            category="original"
        )
        db.add(prod_image)
        db.commit()
        db.refresh(prod_image)

        # 4. AI OCR & Declaration Extraction
        ai_res = ai_service.analyze_package_image(
            image_bytes=image_bytes,
            category_hint=product.category,
            product_name_hint=product.name
        )

        scan.raw_ai_response = json.dumps(ai_res.model_dump())
        db.commit()

        # 5. Persist Declarations
        dict_declarations = {}
        for f_name, f_obj in ai_res.declarations.items():
            dict_declarations[f_name] = f_obj.model_dump()
            decl_db = Declaration(
                scan_id=scan.id,
                product_id=product.id,
                field_name=f_name,
                detected_value=f_obj.value,
                expected_value=getattr(product, f_name, None),
                confidence=f_obj.confidence,
                bbox=json.dumps(f_obj.bbox),
                is_present=f_obj.is_present
            )
            db.add(decl_db)
        db.commit()

        # 6. Rule Engine Evaluation
        eval_res = rule_service.evaluate_declarations(
            db=db,
            category=product.category,
            declarations=dict_declarations,
            origin=product.country_of_origin,
            product_ref=product
        )

        # 7. Persist ComplianceCheck
        check_db = ComplianceCheck(
            scan_id=scan.id,
            product_id=product.id,
            overall_status=eval_res["status"],
            passed_count=len(eval_res["passed"]),
            warning_count=len(eval_res["warnings"]),
            violation_count=len(eval_res["violations"])
        )
        db.add(check_db)
        db.commit()

        # 8. Create Violations & Evidence Chain
        created_violations = []
        evidence_chain = []

        for idx, v in enumerate(eval_res["violations"]):
            v_code = f"VIOL-{scan.id}-{idx+1}"
            viol_db = Violation(
                violation_code=v_code,
                product_id=product.id,
                scan_id=scan.id,
                rule_id=v.get("rule_id"),
                field=v["field"],
                expected_value=str(v.get("expected_value")),
                observed_value=str(v.get("observed_value")),
                severity=v.get("severity", "HIGH"),
                confidence=v.get("confidence", 0.95),
                status="OPEN"
            )
            db.add(viol_db)
            db.commit()
            db.refresh(viol_db)

            # Create Evidence record linked to Image & BBox
            decl_info = dict_declarations.get(v["field"], {})
            bbox = decl_info.get("bbox", [50, 50, 200, 100])
            
            ev_db = evidence_service.create_evidence_chain(
                db=db,
                violation=viol_db,
                image_id=prod_image.id,
                bbox=bbox,
                detected_text=v["observed_value"],
                confidence=v["confidence"],
                annotated_image_path=img_info["annotated_path"]
            )
            
            created_violations.append({
                "violation_id": viol_db.id,
                "violation_code": viol_db.violation_code,
                "field": viol_db.field,
                "expected_value": viol_db.expected_value,
                "observed_value": viol_db.observed_value,
                "severity": viol_db.severity,
                "status": viol_db.status
            })

            evidence_chain.append({
                "evidence_id": ev_db.id,
                "violation_id": viol_db.id,
                "bbox": bbox,
                "detected_text": ev_db.detected_text,
                "ocr_confidence": ev_db.ocr_confidence,
                "annotated_image": ev_db.annotated_image
            })

        # 9. Risk Intelligence Score Calculation
        risk_res = risk_service.calculate_risk(
            db=db,
            product_id=product.id,
            scan_id=scan.id,
            violations=eval_res["violations"]
        )

        # 10. Update Scan & Product Status
        scan.status = eval_res["status"]
        product.status = eval_res["status"]
        db.commit()

        # 11. Create Product Version Snapshot
        version_count = db.query(ProductVersion).filter(ProductVersion.product_id == product.id).count()
        p_version = ProductVersion(
            product_id=product.id,
            scan_id=scan.id,
            version_number=version_count + 1,
            mrp=product.mrp,
            net_quantity=product.net_quantity,
            manufacturer_name=product.manufacturer_name,
            importer_name=product.importer_name,
            snapshot_data=json.dumps(dict_declarations)
        )
        db.add(p_version)
        db.commit()

        return {
            "scan_id": scan.scan_code,
            "numeric_scan_id": scan.id,
            "product_id": product.id,
            "status": scan.status,
            "declarations": dict_declarations,
            "violations": created_violations,
            "risk": {
                "score": risk_res["risk_score"],
                "level": risk_res["risk_level"],
                "priority": risk_res["risk_level"]  # e.g. HIGH/MEDIUM/LOW
            },
            "evidence": evidence_chain,
            "compliance": eval_res,
            "scanned_at": scan.scanned_at.isoformat()
        }

compliance_service = ComplianceService()
