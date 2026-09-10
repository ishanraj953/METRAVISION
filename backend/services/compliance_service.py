import uuid
import datetime
import json
import os
from typing import Optional
from sqlalchemy.orm import Session
from models.product import Product, ProductImage
from models.scan import Scan
from models.declaration import Declaration
from models.violation import Violation
from models.rule import ComplianceCheck
from models.listing import ProductVersion
from models.inspection import Inspection
from services.ai_service import ai_service
from services.rule_service import rule_service
from services.evidence_service import evidence_service
from services.risk_service import risk_service
from utils.image_processing import save_and_process_image


class ComplianceService:
    def scan_direct(
        self,
        db: Session,
        user_id: int,
        image_bytes: bytes,
        filename: str,
        category_hint: Optional[str] = None,
        product_name_hint: Optional[str] = None
    ) -> dict:
        """
        Direct AI Scan for field inspection or self-check without requiring a pre-registered product.
        Automatically provisions a registered commodity record and orchestrates the full pipeline.
        """
        scan_code = f"SCN-{str(uuid.uuid4())[:8].upper()}"
        assigned_name = product_name_hint or f"Package Scan {scan_code}"
        assigned_category = category_hint or "general"

        # Check if an existing product matches this name
        product = db.query(Product).filter(Product.name == assigned_name).first()
        if not product:
            product = Product(
                name=assigned_name,
                brand="Inspected Commodity",
                category=assigned_category,
                country_of_origin="India",
                shopkeeper_id=user_id,
                status="UNDER_REVIEW"
            )
            db.add(product)
            db.commit()
            db.refresh(product)

        return self.scan_product(
            db=db,
            product_id=product.id,
            user_id=user_id,
            image_bytes=image_bytes,
            filename=filename
        )

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

        # 1. Image Processing & Initial Storage
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

        # 3. AI OCR & Declaration Intelligence Pipeline
        ai_res = ai_service.analyze_package_image(
            image_bytes=image_bytes,
            category_hint=product.category,
            product_name_hint=product.name,
            save_annotated_to=img_info["annotated_path"]
        )

        # Update Image Quality Metrics with AI findings if available
        ai_quality = ai_res.quality or {}
        img_quality_score = float(ai_quality.get("quality_score", img_info["quality_score"]))
        blur_val = float(ai_quality.get("blur", {}).get("score", img_info["blur_score"])) if isinstance(ai_quality.get("blur"), dict) else img_info["blur_score"]
        glare_val = float(ai_quality.get("glare", {}).get("glare_ratio", img_info["glare_score"])) if isinstance(ai_quality.get("glare"), dict) else img_info["glare_score"]
        is_usable = ai_quality.get("usable", True) if ai_res.status != "INSUFFICIENT_EVIDENCE" else False

        # Store Original Product Image Metadata
        prod_image = ProductImage(
            product_id=product.id,
            scan_id=scan.id,
            file_path=img_info["original_path"],
            original_filename=img_info["original_filename"],
            file_type=img_info["file_type"],
            file_size=img_info["file_size"],
            image_quality_score=img_quality_score,
            width=img_info["width"],
            height=img_info["height"],
            blur_score=blur_val,
            glare_score=glare_val,
            category="original"
        )
        db.add(prod_image)
        db.commit()
        db.refresh(prod_image)

        scan.raw_ai_response = json.dumps(ai_res.model_dump(), default=str)
        db.commit()

        # 4. Persist Declarations
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
                bbox=json.dumps(f_obj.bbox, default=str),
                is_present=f_obj.is_present
            )
            db.add(decl_db)
        db.commit()

        # Update product's real attributes with verified detected declarations (no dummy data)
        if dict_declarations.get("brand", {}).get("value"):
            product.brand = str(dict_declarations["brand"]["value"])
        if dict_declarations.get("product_name", {}).get("value") and product.name.startswith("Package Scan"):
            product.name = str(dict_declarations["product_name"]["value"])
        if dict_declarations.get("mrp", {}).get("value"):
            product.mrp = str(dict_declarations["mrp"]["value"])
        if dict_declarations.get("net_quantity", {}).get("value"):
            product.net_quantity = str(dict_declarations["net_quantity"]["value"])
        if dict_declarations.get("manufacturer_name", {}).get("value"):
            product.manufacturer_name = str(dict_declarations["manufacturer_name"]["value"])
        if dict_declarations.get("importer_name", {}).get("value"):
            product.importer_name = str(dict_declarations["importer_name"]["value"])
        if dict_declarations.get("consumer_care", {}).get("value"):
            product.consumer_care = str(dict_declarations["consumer_care"]["value"])
        if dict_declarations.get("country_of_origin", {}).get("value"):
            product.country_of_origin = str(dict_declarations["country_of_origin"]["value"])
        db.commit()

        # 5. Dynamic Rule Engine Evaluation
        eval_res = rule_service.evaluate_declarations(
            db=db,
            category=product.category,
            declarations=dict_declarations,
            origin=product.country_of_origin,
            sales_channel="retail",
            product_ref=product,
            image_quality_usable=is_usable
        )

        # 6. Persist ComplianceCheck
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

        # Convert local absolute paths to web URLs for frontend
        orig_filename = os.path.basename(img_info["original_path"])
        annot_filename = os.path.basename(ai_res.annotated_image_path or img_info["annotated_path"])
        orig_web_url = f"/storage/original/{orig_filename}"
        annot_web_url = f"/storage/annotated/{annot_filename}"

        # 7. Create Violations & Evidence Chain
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
                status="DETECTED"
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
                annotated_image_path=annot_web_url
            )

            created_violations.append({
                "violation_id": viol_db.id,
                "violation_code": viol_db.violation_code,
                "rule_code": v.get("rule_code") or "LM-PC-001",
                "rule_reference": v.get("rule_reference") or "PCR 2011 Rule 6(1)",
                "act_section": v.get("act_section") or "Section 36(1) Legal Metrology Act, 2009",
                "penalty_range": v.get("penalty_range") or "Up to ₹25,000 (Jan Vishwas Act, 2023)",
                "source": v.get("source") or "Legal Metrology (Packaged Commodities) Rules, 2011",
                "requirement": v.get("requirement"),
                "field": viol_db.field,
                "expected_value": viol_db.expected_value,
                "observed_value": viol_db.observed_value,
                "severity": viol_db.severity,
                "confidence": viol_db.confidence,
                "status": viol_db.status,
                "message": v.get("message")
            })

            evidence_chain.append({
                "evidence_id": ev_db.id,
                "violation_id": viol_db.id,
                "bbox": bbox,
                "detected_text": ev_db.detected_text,
                "ocr_confidence": ev_db.ocr_confidence,
                "annotated_image": annot_web_url,
                "original_image": orig_web_url
            })

        # 8. Deterministic Risk Intelligence Score Calculation
        risk_res = risk_service.calculate_risk(
            db=db,
            product_id=product.id,
            scan_id=scan.id,
            violations=eval_res["violations"]
        )

        # 9. Update Scan & Product Status
        scan.status = eval_res["status"]
        product.status = eval_res["status"]
        db.commit()

        # 10. Auto-create or Update Inspection Dossier for Checker/Officer
        existing_insp = db.query(Inspection).filter(Inspection.product_id == product.id).first()
        if not existing_insp:
            insp_code = f"INSP-{str(uuid.uuid4())[:8].upper()}"
            new_insp = Inspection(
                inspection_code=insp_code,
                product_id=product.id,
                checker_id=user_id,
                status="UNDER_REVIEW" if eval_res["violations"] else "COMPLIANT",
                priority_score=risk_res["risk_score"],
                remarks=f"Automated AI Scan performed. Risk score: {risk_res['risk_score']}."
            )
            db.add(new_insp)
            db.commit()

        # 11. Create Product Version Snapshot (Digital Twin Drift History)
        version_count = db.query(ProductVersion).filter(ProductVersion.product_id == product.id).count()
        p_version = ProductVersion(
            product_id=product.id,
            scan_id=scan.id,
            version_number=version_count + 1,
            mrp=product.mrp,
            net_quantity=product.net_quantity,
            manufacturer_name=product.manufacturer_name,
            importer_name=product.importer_name,
            snapshot_data=json.dumps(dict_declarations, default=str)
        )
        db.add(p_version)
        db.commit()

        # Synchronize live scan artifacts to MongoDB 8.0
        self._sync_to_mongo(
            scan=scan,
            product=product,
            violations=created_violations,
            inspection=new_insp if not existing_insp else existing_insp
        )

        # Automatically generate official Statutory Inspection Memo PDF after OCR scan
        report_id = None
        pdf_download_url = None
        try:
            from services.report_service import report_service
            user_obj = db.query(User).filter(User.id == user_id).first() if user_id else None
            statutory_rep = report_service.generate_report(
                db=db,
                report_type="CHECKER",
                user=user_obj,
                product_id=product.id,
                report_format="PDF",
                scan_id=scan.id,
                inspection_id=(new_insp if not existing_insp else existing_insp).id
            )
            report_id = statutory_rep.id
            pdf_download_url = f"/api/v1/reports/{statutory_rep.id}/download"
        except Exception:
            pass

        # Automatically generate official Statutory Inspection Memo PDF after OCR scan
        report_id = None
        pdf_download_url = None
        try:
            from services.report_service import report_service
            user_obj = db.query(User).filter(User.id == user_id).first() if user_id else None
            statutory_rep = report_service.generate_report(
                db=db,
                report_type="CHECKER",
                user=user_obj,
                product_id=product.id,
                report_format="PDF",
                scan_id=scan.id,
                inspection_id=(new_insp if not existing_insp else existing_insp).id
            )
            report_id = statutory_rep.id
            pdf_download_url = f"/api/v1/reports/{statutory_rep.id}/download"
        except Exception:
            pass

        return {
            "scan_id": scan.scan_code,
            "numeric_scan_id": scan.id,
            "product_id": product.id,
            "product_name": product.name,
            "brand": product.brand,
            "category": product.category,
            "product": {
                "id": product.id,
                "name": product.name,
                "brand": product.brand,
                "category": product.category,
                "mrp": product.mrp,
                "net_quantity": product.net_quantity,
                "manufacturer": product.manufacturer_name,
                "country_of_origin": product.country_of_origin
            },
            "report_id": report_id,
            "pdf_url": pdf_download_url,
            "inspection_id": (new_insp if not existing_insp else existing_insp).id,
            "status": scan.status,
            "quality": {
                "score": img_quality_score,
                "usable": is_usable,
                "blur_score": blur_val,
                "glare_score": glare_val,
                "status": "USABLE" if is_usable else "INSUFFICIENT_EVIDENCE"
            },
            "declarations": dict_declarations,
            "violations": created_violations,
            "risk": {
                "score": risk_res["risk_score"],
                "level": risk_res["risk_level"],
                "priority": risk_res["inspection_priority"],
                "repeat_offender": risk_res["repeat_offender"],
                "factors": risk_res["factors"]
            },
            "evidence": evidence_chain,
            "compliance": eval_res,
            "images": {
                "original": orig_web_url,
                "annotated": annot_web_url
            },
            "facets": [{
                "facet_index": 0,
                "facet_label": "Single Packaging Image",
                "original_image": orig_web_url,
                "annotated_image": annot_web_url,
                "quality_score": img_quality_score,
                "is_usable": is_usable,
                "image_id": prod_image.id,
                "ocr_count": len(getattr(ai_res, "ocr_regions", []) or [])
            }],
            "raw_ocr_text": getattr(ai_res, "raw_ocr_text", "") or " ".join([f"{k.upper()}: {v.get('value', '')}" for k, v in dict_declarations.items() if v.get("value")]),
            "ocr_regions": getattr(ai_res, "ocr_regions", []) or [
                {"text": f"{k.upper()}: {v.get('value')}", "confidence": v.get("confidence", 0.95), "bbox": v.get("bbox", [50, 50, 200, 80])}
                for k, v in dict_declarations.items() if v.get("value")
            ],
            "scanned_at": scan.scanned_at.isoformat()
        }

    def scan_multi(
        self,
        db: Session,
        user_id: int,
        files_data: list,
        category_hint: Optional[str] = None,
        product_name_hint: Optional[str] = None
    ) -> dict:
        """
        Multi-Facet Packaging Inspection Pipeline under Legal Metrology PCR 2011 Rule 6 & Rule 7.
        Requires at least 4 packaging panels (Front PDP, Back Panel, MRP/Pricing Crimp, MFR/Origin Panel).
        Runs OCR perception across each facet, merges declarations, and produces complete enforcement evidence.
        """
        if len(files_data) < 4:
            raise ValueError(
                "Legal Metrology Protocol requires at least 4 packaging facet photographs "
                "(Front PDP, Back Panel, MRP/Date Crimp, and Manufacturer/Origin Panel). "
                f"Received {len(files_data)} photos. Please upload at least 4 photos."
            )

        scan_code = f"SCN-{str(uuid.uuid4())[:8].upper()}"
        assigned_name = product_name_hint or f"Multi-Facet Package Scan {scan_code}"
        assigned_category = category_hint or "general"

        # Check or create product
        product = db.query(Product).filter(Product.name == assigned_name).first()
        if not product:
            product = Product(
                name=assigned_name,
                brand="Inspected Commodity",
                category=assigned_category,
                country_of_origin="India",
                shopkeeper_id=user_id,
                status="UNDER_REVIEW"
            )
            db.add(product)
            db.commit()
            db.refresh(product)

        scan = Scan(
            scan_code=scan_code,
            product_id=product.id,
            user_id=user_id,
            status="IN_PROGRESS"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        facets_summary = []
        merged_declarations = {}
        all_ocr_regions = []
        all_raw_text_parts = []
        total_quality_score = 0.0
        all_usable = True
        facet_images_db = []

        default_labels = [
            "Facet 1: Front Panel (PDP)",
            "Facet 2: Back Statutory Panel",
            "Facet 3: MRP & Statutory Pricing",
            "Facet 4: Manufacturer & Origin"
        ]

        for idx, item in enumerate(files_data):
            f_bytes = item["bytes"]
            f_name = item.get("filename") or f"facet_{idx+1}.jpg"
            f_label = item.get("facet_label") or (default_labels[idx] if idx < len(default_labels) else f"Facet {idx+1}: Additional Panel")

            img_info = save_and_process_image(f_bytes, f_name)

            ai_res = ai_service.analyze_package_image(
                image_bytes=f_bytes,
                category_hint=product.category,
                product_name_hint=product.name,
                save_annotated_to=img_info["annotated_path"]
            )

            ai_quality = ai_res.quality or {}
            img_quality_score = float(ai_quality.get("quality_score", img_info["quality_score"]))
            blur_val = float(ai_quality.get("blur", {}).get("score", img_info["blur_score"])) if isinstance(ai_quality.get("blur"), dict) else img_info["blur_score"]
            glare_val = float(ai_quality.get("glare", {}).get("glare_ratio", img_info["glare_score"])) if isinstance(ai_quality.get("glare"), dict) else img_info["glare_score"]
            is_usable = ai_quality.get("usable", True) if ai_res.status != "INSUFFICIENT_EVIDENCE" else False
            if not is_usable:
                all_usable = False
            total_quality_score += img_quality_score

            prod_image = ProductImage(
                product_id=product.id,
                scan_id=scan.id,
                file_path=img_info["original_path"],
                original_filename=img_info["original_filename"],
                file_type=img_info["file_type"],
                file_size=img_info["file_size"],
                image_quality_score=img_quality_score,
                width=img_info["width"],
                height=img_info["height"],
                blur_score=blur_val,
                glare_score=glare_val,
                category=f_label
            )
            db.add(prod_image)
            db.commit()
            db.refresh(prod_image)
            facet_images_db.append(prod_image)

            orig_filename = os.path.basename(img_info["original_path"])
            annot_filename = os.path.basename(ai_res.annotated_image_path or img_info["annotated_path"])
            orig_web_url = f"/storage/original/{orig_filename}"
            annot_web_url = f"/storage/annotated/{annot_filename}"

            facet_regions = getattr(ai_res, "ocr_regions", []) or []
            for r in facet_regions:
                r_item = dict(r) if isinstance(r, dict) else {"text": str(r)}
                r_item["facet_index"] = idx
                r_item["facet_label"] = f_label
                all_ocr_regions.append(r_item)

            if getattr(ai_res, "raw_ocr_text", ""):
                all_raw_text_parts.append(f"[{f_label.upper()}]: {ai_res.raw_ocr_text}")

            facets_summary.append({
                "facet_index": idx,
                "facet_label": f_label,
                "original_image": orig_web_url,
                "annotated_image": annot_web_url,
                "quality_score": img_quality_score,
                "is_usable": is_usable,
                "blur_score": blur_val,
                "glare_score": glare_val,
                "image_id": prod_image.id,
                "ocr_count": len(facet_regions)
            })

            # Declaration Aggregation: merge detected fields from this facet
            for f_name, f_obj in ai_res.declarations.items():
                f_dict = f_obj.model_dump()
                val = f_dict.get("value")
                is_pres = f_dict.get("is_present")
                if is_pres and val and str(val).strip() and str(val).upper() not in ["NONE", "MISSING"]:
                    existing = merged_declarations.get(f_name)
                    if not existing or not existing.get("is_present") or (f_dict.get("confidence", 0) > existing.get("confidence", 0)):
                        f_dict["facet_index"] = idx
                        f_dict["facet_label"] = f_label
                        f_dict["image_id"] = prod_image.id
                        f_dict["annotated_image"] = annot_web_url
                        f_dict["original_image"] = orig_web_url
                        merged_declarations[f_name] = f_dict

        # Ensure standard declaration fields exist in merged_declarations
        standard_fields = [
            "mrp",
            "net_quantity",
            "country_of_origin",
            "manufacturer_name",
            "importer_name",
            "consumer_care",
            "manufacturing_date",
            "unit_sale_price"
        ]
        for std_field in standard_fields:
            if std_field not in merged_declarations:
                merged_declarations[std_field] = {
                    "value": None,
                    "confidence": 0.0,
                    "bbox": [0, 0, 0, 0],
                    "is_present": False,
                    "status": "NOT_DETECTED",
                    "rule": "Mandatory statutory declaration under PCR 2011",
                    "facet_index": None,
                    "facet_label": "Not Found Across Any Panel"
                }

        # Update product's real attributes with verified detected declarations (no dummy data)
        if merged_declarations.get("mrp", {}).get("value"):
            product.mrp = str(merged_declarations["mrp"]["value"])
        if merged_declarations.get("net_quantity", {}).get("value"):
            product.net_quantity = str(merged_declarations["net_quantity"]["value"])
        if merged_declarations.get("manufacturer_name", {}).get("value"):
            product.manufacturer_name = str(merged_declarations["manufacturer_name"]["value"])
        if merged_declarations.get("importer_name", {}).get("value"):
            product.importer_name = str(merged_declarations["importer_name"]["value"])
        if merged_declarations.get("consumer_care", {}).get("value"):
            product.consumer_care = str(merged_declarations["consumer_care"]["value"])
        if merged_declarations.get("country_of_origin", {}).get("value"):
            product.country_of_origin = str(merged_declarations["country_of_origin"]["value"])
        db.commit()

        # Persist Declarations into DB
        for f_name, f_dict in merged_declarations.items():
            decl_db = Declaration(
                scan_id=scan.id,
                product_id=product.id,
                field_name=f_name,
                detected_value=f_dict.get("value"),
                expected_value=getattr(product, f_name, None),
                confidence=float(f_dict.get("confidence", 0.0)),
                bbox=json.dumps(f_dict.get("bbox", [0, 0, 0, 0]), default=str),
                is_present=bool(f_dict.get("is_present", False))
            )
            db.add(decl_db)
        db.commit()

        # Dynamic Rule Engine Evaluation
        eval_res = rule_service.evaluate_declarations(
            db=db,
            category=product.category,
            declarations=merged_declarations,
            origin=product.country_of_origin,
            sales_channel="retail",
            product_ref=product,
            image_quality_usable=all_usable
        )

        # Persist ComplianceCheck
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

        # Create Violations & Evidence Chain
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
                status="DETECTED"
            )
            db.add(viol_db)
            db.commit()
            db.refresh(viol_db)

            decl_info = merged_declarations.get(v["field"], {})
            bbox = decl_info.get("bbox", [50, 50, 200, 100])
            matched_image_id = decl_info.get("image_id") or (facet_images_db[0].id if facet_images_db else None)
            matched_annot = decl_info.get("annotated_image") or (facets_summary[0]["annotated_image"] if facets_summary else None)
            matched_orig = decl_info.get("original_image") or (facets_summary[0]["original_image"] if facets_summary else None)

            ev_db = evidence_service.create_evidence_chain(
                db=db,
                violation=viol_db,
                image_id=matched_image_id,
                bbox=bbox,
                detected_text=v["observed_value"],
                confidence=v["confidence"],
                annotated_image_path=matched_annot
            )

            created_violations.append({
                "violation_id": viol_db.id,
                "violation_code": viol_db.violation_code,
                "rule_code": v.get("rule_code") or "LM-PC-001",
                "rule_reference": v.get("rule_reference") or "PCR 2011 Rule 6(1)",
                "act_section": v.get("act_section") or "Section 36(1) Legal Metrology Act, 2009",
                "penalty_range": v.get("penalty_range") or "Up to ₹25,000 (Jan Vishwas Act, 2023)",
                "source": v.get("source") or "Legal Metrology (Packaged Commodities) Rules, 2011",
                "requirement": v.get("requirement"),
                "field": viol_db.field,
                "expected_value": viol_db.expected_value,
                "observed_value": viol_db.observed_value,
                "severity": viol_db.severity,
                "confidence": viol_db.confidence,
                "status": viol_db.status,
                "message": v.get("message"),
                "category": v.get("category"),
                "facet_label": decl_info.get("facet_label", "All Panels Checked"),
                "facet_index": decl_info.get("facet_index")
            })

            evidence_chain.append({
                "evidence_id": ev_db.id,
                "violation_id": viol_db.id,
                "bbox": bbox,
                "detected_text": ev_db.detected_text,
                "ocr_confidence": ev_db.ocr_confidence,
                "annotated_image": matched_annot,
                "original_image": matched_orig,
                "facet_label": decl_info.get("facet_label", "All Panels Checked"),
                "facet_index": decl_info.get("facet_index")
            })

        # Risk Calculation
        risk_res = risk_service.calculate_risk(
            db=db,
            product_id=product.id,
            scan_id=scan.id,
            violations=eval_res["violations"]
        )

        scan.status = eval_res["status"]
        product.status = eval_res["status"]
        db.commit()

        existing_insp = db.query(Inspection).filter(Inspection.product_id == product.id).first()
        if not existing_insp:
            insp_code = f"INSP-{str(uuid.uuid4())[:8].upper()}"
            new_insp = Inspection(
                inspection_code=insp_code,
                product_id=product.id,
                checker_id=user_id,
                status="UNDER_REVIEW" if eval_res["violations"] else "COMPLIANT",
                priority_score=risk_res["risk_score"],
                remarks=f"Multi-Facet AI Scan performed across {len(files_data)} panels. Risk score: {risk_res['risk_score']}."
            )
            db.add(new_insp)
            db.commit()

        version_count = db.query(ProductVersion).filter(ProductVersion.product_id == product.id).count()
        p_version = ProductVersion(
            product_id=product.id,
            scan_id=scan.id,
            version_number=version_count + 1,
            mrp=product.mrp,
            net_quantity=product.net_quantity,
            manufacturer_name=product.manufacturer_name,
            importer_name=product.importer_name,
            snapshot_data=json.dumps(merged_declarations, default=str)
        )
        db.add(p_version)
        db.commit()

        # Synchronize live scan artifacts to MongoDB 8.0
        self._sync_to_mongo(
            scan=scan,
            product=product,
            violations=created_violations,
            inspection=new_insp if not existing_insp else existing_insp
        )

        primary_orig = facets_summary[0]["original_image"] if facets_summary else None
        primary_annot = facets_summary[0]["annotated_image"] if facets_summary else None
        avg_quality = round(total_quality_score / len(files_data), 1) if files_data else 85.0

        # Automatically generate official Statutory Inspection Memo PDF after OCR scan
        report_id = None
        pdf_download_url = None
        try:
            from services.report_service import report_service
            user_obj = db.query(User).filter(User.id == user_id).first() if user_id else None
            statutory_rep = report_service.generate_report(
                db=db,
                report_type="CHECKER",
                user=user_obj,
                product_id=product.id,
                report_format="PDF",
                scan_id=scan.id,
                inspection_id=(new_insp if not existing_insp else existing_insp).id
            )
            report_id = statutory_rep.id
            pdf_download_url = f"/api/v1/reports/{statutory_rep.id}/download"
        except Exception:
            pass

        # Automatically generate official Statutory Inspection Memo PDF after OCR scan
        report_id = None
        pdf_download_url = None
        try:
            from services.report_service import report_service
            user_obj = db.query(User).filter(User.id == user_id).first() if user_id else None
            statutory_rep = report_service.generate_report(
                db=db,
                report_type="CHECKER",
                user=user_obj,
                product_id=product.id,
                report_format="PDF",
                scan_id=scan.id,
                inspection_id=(new_insp if not existing_insp else existing_insp).id
            )
            report_id = statutory_rep.id
            pdf_download_url = f"/api/v1/reports/{statutory_rep.id}/download"
        except Exception:
            pass

        return {
            "scan_id": scan.scan_code,
            "numeric_scan_id": scan.id,
            "product_id": product.id,
            "product_name": product.name,
            "report_id": report_id,
            "pdf_url": pdf_download_url,
            "inspection_id": (new_insp if not existing_insp else existing_insp).id,
            "report_id": report_id,
            "pdf_url": pdf_download_url,
            "inspection_id": (new_insp if not existing_insp else existing_insp).id,
            "category": product.category,
            "status": scan.status,
            "quality": {
                "score": avg_quality,
                "usable": all_usable,
                "facets_count": len(files_data),
                "status": "USABLE" if all_usable else "INSUFFICIENT_EVIDENCE"
            },
            "declarations": merged_declarations,
            "violations": created_violations,
            "risk": {
                "score": risk_res["risk_score"],
                "level": risk_res["risk_level"],
                "priority": risk_res["inspection_priority"],
                "repeat_offender": risk_res["repeat_offender"],
                "factors": risk_res["factors"]
            },
            "evidence": evidence_chain,
            "compliance": eval_res,
            "images": {
                "original": primary_orig,
                "annotated": primary_annot
            },
            "facets": facets_summary,
            "raw_ocr_text": " \n ".join(all_raw_text_parts),
            "ocr_regions": all_ocr_regions,
            "scanned_at": scan.scanned_at.isoformat()
        }

    def _sync_to_mongo(self, scan, product, violations, inspection=None):
        """Dual-write sync of scan results directly into MongoDB collections."""
        try:
            from database.mongo import scans_collection, violations_collection, inspections_collection, products_collection
            scans_col = scans_collection()
            viols_col = violations_collection()
            insps_col = inspections_collection()
            prods_col = products_collection()
            if scans_col is None:
                return

            now = datetime.datetime.utcnow()

            # Product sync
            prods_col.update_one(
                {"id": product.id},
                {"$set": {
                    "id": product.id,
                    "name": product.name,
                    "brand": product.brand,
                    "category": product.category,
                    "mrp": product.mrp,
                    "net_quantity": product.net_quantity,
                    "status": product.status,
                    "shopkeeper_id": product.shopkeeper_id,
                    "updated_at": now
                }},
                upsert=True
            )

            # Scan sync
            scans_col.update_one(
                {"scan_code": scan.scan_code},
                {"$set": {
                    "id": scan.id,
                    "scan_code": scan.scan_code,
                    "product_id": scan.product_id,
                    "user_id": scan.user_id,
                    "status": scan.status,
                    "image_quality_score": scan.image_quality_score,
                    "risk_score": scan.risk_score,
                    "raw_ocr_text": scan.raw_ocr_text,
                    "scanned_at": scan.scanned_at or now
                }},
                upsert=True
            )

            # Violations sync
            for v in (violations or []):
                viols_col.update_one(
                    {"violation_code": v.get("violation_code") or f"VIOL-{v.get('id', scan.id)}"},
                    {"$set": {
                        "id": v.get("id"),
                        "scan_id": scan.id,
                        "product_id": product.id,
                        "field": v.get("field"),
                        "rule_citation": v.get("rule_citation"),
                        "severity": v.get("severity"),
                        "observed_value": v.get("observed_value"),
                        "expected_value": v.get("expected_value"),
                        "status": v.get("status", "DETECTED"),
                        "created_at": now
                    }},
                    upsert=True
                )

            # Inspection sync
            if inspection:
                insps_col.update_one(
                    {"inspection_code": inspection.inspection_code},
                    {"$set": {
                        "id": inspection.id,
                        "inspection_code": inspection.inspection_code,
                        "product_id": inspection.product_id,
                        "checker_id": inspection.checker_id,
                        "status": inspection.status,
                        "priority_score": inspection.priority_score,
                        "remarks": inspection.remarks,
                        "inspected_at": getattr(inspection, 'inspected_at', None) or now
                    }},
                    upsert=True
                )
        except Exception as e:
            print(f"[Mongo Dual Sync] Notice: sync to mongo bypassed: {e}")


compliance_service = ComplianceService()
