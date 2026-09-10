import os
import json
import datetime
from sqlalchemy.orm import Session
from models.listing import Report
from models.user import User, UserRole
from models.product import Product
from models.violation import Violation
from models.scan import Scan
from models.declaration import Declaration
from models.inspection import Inspection
from config import settings

class ReportService:
    def generate_report(
        self,
        db: Session,
        report_type: str,
        user: User,
        product_id: int = None,
        report_format: str = "PDF",
        inspection_id: int = None,
        scan_id: int = None
    ) -> Report:
        os.makedirs(os.path.join(settings.STORAGE_DIR, "reports"), exist_ok=True)
        report_type_upper = report_type.upper()
        
        report_data = {}
        if scan_id:
            report_data = self._build_scan_data(db, scan_id, user)
        elif inspection_id:
            report_data = self._build_inspection_data(db, inspection_id, user)
        elif report_type_upper == "CHECKER":
            report_data = self._build_checker_data(db, product_id)
        elif report_type_upper == "SHOPKEEPER":
            report_data = self._build_shopkeeper_data(db, user, product_id)
        else: # ADMIN
            report_data = self._build_admin_data(db)

        filename = f"memo_{report_type_upper.lower()}_{int(datetime.datetime.utcnow().timestamp())}"
        file_path = None

        if report_format.upper() == "PDF":
            file_path = os.path.join(settings.STORAGE_DIR, "reports", f"{filename}.pdf")
            self._create_pdf_file(file_path, report_type_upper, report_data)
        else:
            file_path = os.path.join(settings.STORAGE_DIR, "reports", f"{filename}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(report_data, f, indent=2, default=str)

        user_id = user.id if user and hasattr(user, "id") else None

        report_db = Report(
            report_type=report_type_upper,
            generated_by=user_id,
            file_path=file_path,
            format=report_format.upper(),
            data=json.dumps(report_data, default=str)
        )
        db.add(report_db)
        db.commit()
        db.refresh(report_db)

        # Dual-persist to MongoDB reports collection
        self._sync_report_to_mongo(report_db, report_data)

        return report_db

    def _sync_report_to_mongo(self, report_db: Report, report_data: dict):
        try:
            from database.mongo import reports_collection, audit_logs_collection
            rep_col = reports_collection()
            if rep_col is not None:
                rep_col.update_one(
                    {"id": report_db.id},
                    {"$set": {
                        "id": report_db.id,
                        "report_type": report_db.report_type,
                        "generated_by": report_db.generated_by,
                        "file_path": report_db.file_path,
                        "format": report_db.format,
                        "data": report_data,
                        "created_at": report_db.created_at or datetime.datetime.utcnow()
                    }},
                    upsert=True
                )
            audit_col = audit_logs_collection()
            if audit_col is not None:
                audit_col.insert_one({
                    "action": "GENERATE_STATUTORY_REPORT",
                    "entity": "Report",
                    "entity_id": str(report_db.id),
                    "user_id": report_db.generated_by,
                    "metadata": {"type": report_db.report_type, "format": report_db.format},
                    "timestamp": datetime.datetime.utcnow()
                })
        except Exception:
            pass

    def _get_rule_citation(self, field: str) -> str:
        rule_map = {
            "mrp": "MRP Declaration Font Size / Visibility Deficient (Rule 6(1)(d) & Rule 18)",
            "net_quantity": "Net Quantity Statement Deficient / Non-Standard Unit (Rule 6(1)(a) & Rule 12)",
            "manufacturer_name": "Manufacturer / Packer Address Incomplete (Rule 6(1)(b))",
            "importer_name": "Importer Name / Country of Origin Missing (Rule 6(1)(c))",
            "consumer_care": "Customer Care Email / Helpline Contact Missing (Rule 6(1)(h))",
            "country_of_origin": "Country of Origin Declaration Missing (Rule 6(1)(a)(iv))",
            "manufacturing_date": "Month & Year of Manufacture/Packing Deficient (Rule 6(1)(f))",
            "unit_sale_price": "Unit Sale Price (USP) Missing or Non-Standard (Rule 6(1)(k))"
        }
        return rule_map.get(field.lower() if field else "", f"{field.replace('_', ' ').title()} Declaration Deficient")

    def _build_scan_data(self, db: Session, scan_id: int, user: User) -> dict:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return self._build_checker_data(db, None)
        
        product = db.query(Product).filter(Product.id == scan.product_id).first()
        violations = db.query(Violation).filter(Violation.scan_id == scan_id).all()
        if not violations and product:
            violations = db.query(Violation).filter(Violation.product_id == product.id).all()
        
        declarations = db.query(Declaration).filter(Declaration.scan_id == scan_id).all()

        establishment_name = "Gupta Kirana & Daily Needs"
        jurisdiction_loc = "Shop #14, Sector 9, Guntur, AP"
        if user and getattr(user, "company_name", None):
            establishment_name = user.company_name
        if product and getattr(product, "jurisdiction", None):
            jurisdiction_loc = product.jurisdiction

        insp_name = "R. Sharma (CHK-109)"
        if user and getattr(user, "role", None) == UserRole.CHECKER:
            insp_name = f"{user.full_name or 'Enforcement Officer'} (CHK-{user.id:03d})"
        elif user and getattr(user, "full_name", None):
            insp_name = f"{user.full_name} (LEGAL-METROLOGY)"

        memo_id = f"CMP-LM-{datetime.datetime.utcnow().year}-{scan.id:03d}"
        timestamp_str = (scan.scanned_at or datetime.datetime.utcnow()).strftime("%d %b %Y, %I:%M %p")
        status_str = "PENDING_REVIEW" if violations else "COMPLIANT"

        commodity_str = product.name if product else "Packaged Commodity"
        if product and product.net_quantity:
            commodity_str += f" ({product.net_quantity})"

        viol_texts = []
        for v in violations:
            f_clean = v.field.replace("_", " ").title()
            if "mrp" in v.field.lower():
                viol_texts.append("MRP Declaration Font Size Deficient")
            elif "care" in v.field.lower():
                viol_texts.append("Customer Care Email / Contact Missing")
            elif "mfr" in v.field.lower() or "manufacturer" in v.field.lower():
                viol_texts.append("Manufacturer / Packer Address Incomplete")
            elif "origin" in v.field.lower():
                viol_texts.append("Country of Origin Declaration Missing")
            elif "quantity" in v.field.lower():
                viol_texts.append("Net Quantity Statutory Declaration Missing")
            elif "date" in v.field.lower():
                viol_texts.append("Date of Manufacture / Packaging Deficient")
            else:
                viol_texts.append(f"{f_clean} Statutory Declaration Deficient")

        if not viol_texts:
            viol_texts = ["All PCR 2011 Mandatory Declarations Verified & Found Compliant"]

        penalty_amount = f"INR {(len(violations) * 25000):,}" if violations else "INR 0"
        penalty_amount_display = f"Rs. {(len(violations) * 25000):,}" if violations else "Rs. 0"

        return {
            "memo_id": memo_id,
            "timestamp": timestamp_str,
            "inspector": insp_name,
            "status": status_str,
            "establishment": establishment_name,
            "jurisdiction": jurisdiction_loc,
            "commodity": commodity_str,
            "violations": viol_texts,
            "penalty": penalty_amount_display,
            "is_compliant": len(violations) == 0,
            "product_id": product.id if product else None,
            "scan_id": scan.id
        }

    def _build_inspection_data(self, db: Session, inspection_id: int, user: User) -> dict:
        insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not insp:
            return self._build_checker_data(db, None)
        
        product = db.query(Product).filter(Product.id == insp.product_id).first()
        violations = db.query(Violation).filter(Violation.product_id == insp.product_id).all()

        establishment_name = "Gupta Kirana & Daily Needs"
        jurisdiction_loc = "Shop #14, Sector 9, Guntur, AP"
        if product and getattr(product, "jurisdiction", None):
            jurisdiction_loc = product.jurisdiction

        insp_name = "R. Sharma (CHK-109)"
        if user and getattr(user, "full_name", None):
            insp_name = f"{user.full_name} (CHK-{getattr(user, 'id', 109):03d})"

        memo_id = insp.inspection_code or f"CMP-LM-{datetime.datetime.utcnow().year}-{insp.id:03d}"
        timestamp_str = (insp.inspected_at or datetime.datetime.utcnow()).strftime("%d %b %Y, %I:%M %p")
        status_str = insp.status or ("PENDING_REVIEW" if violations else "COMPLIANT")

        commodity_str = product.name if product else "Packaged Commodity"
        if product and product.net_quantity:
            commodity_str += f" ({product.net_quantity})"

        viol_texts = []
        for v in violations:
            if "mrp" in v.field.lower():
                viol_texts.append("MRP Declaration Font Size Deficient")
            elif "care" in v.field.lower():
                viol_texts.append("Customer Care Email / Contact Missing")
            elif "mfr" in v.field.lower() or "manufacturer" in v.field.lower():
                viol_texts.append("Manufacturer / Packer Address Incomplete")
            elif "origin" in v.field.lower():
                viol_texts.append("Country of Origin Declaration Missing")
            elif "quantity" in v.field.lower():
                viol_texts.append("Net Quantity Statutory Declaration Missing")
            elif "date" in v.field.lower():
                viol_texts.append("Date of Manufacture / Packaging Deficient")
            else:
                viol_texts.append(f"{v.field.replace('_', ' ').title()} Statutory Declaration Deficient")

        if not viol_texts:
            viol_texts = ["All PCR 2011 Mandatory Declarations Verified & Found Compliant"]

        penalty_display = f"Rs. {(len(violations) * 25000):,}" if violations else "Rs. 0"

        return {
            "memo_id": memo_id,
            "timestamp": timestamp_str,
            "inspector": insp_name,
            "status": status_str,
            "establishment": establishment_name,
            "jurisdiction": jurisdiction_loc,
            "commodity": commodity_str,
            "violations": viol_texts,
            "penalty": penalty_display,
            "is_compliant": len(violations) == 0,
            "product_id": product.id if product else None,
            "inspection_id": insp.id
        }

    def _build_checker_data(self, db: Session, product_id: int) -> dict:
        product = db.query(Product).filter(Product.id == product_id).first() if product_id else None
        violations = db.query(Violation).filter(Violation.product_id == product_id).all() if product_id else []

        commodity_str = product.name if product else "Field Inspected Packaged Commodity"
        if product and product.net_quantity:
            commodity_str += f" ({product.net_quantity})"

        viol_texts = []
        for v in violations:
            if "mrp" in v.field.lower():
                viol_texts.append("MRP Declaration Font Size Deficient")
            elif "care" in v.field.lower():
                viol_texts.append("Customer Care Email / Contact Missing")
            elif "mfr" in v.field.lower() or "manufacturer" in v.field.lower():
                viol_texts.append("Manufacturer / Packer Address Incomplete")
            elif "origin" in v.field.lower():
                viol_texts.append("Country of Origin Declaration Missing")
            elif "quantity" in v.field.lower():
                viol_texts.append("Net Quantity Statutory Declaration Missing")
            elif "date" in v.field.lower():
                viol_texts.append("Date of Manufacture / Packaging Deficient")
            else:
                viol_texts.append(f"{v.field.replace('_', ' ').title()} Statutory Declaration Deficient")

        if not viol_texts:
            viol_texts = ["All PCR 2011 Mandatory Declarations Verified & Found Compliant"]

        penalty_display = f"Rs. {(len(violations) * 25000):,}" if violations else "Rs. 0"

        return {
            "memo_id": f"CMP-LM-{datetime.datetime.utcnow().year}-{(product_id or 101):03d}",
            "timestamp": datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
            "inspector": "R. Sharma (CHK-109)",
            "status": "PENDING_REVIEW" if violations else "COMPLIANT",
            "establishment": "Gupta Kirana & Daily Needs",
            "jurisdiction": "Shop #14, Sector 9, Guntur, AP",
            "commodity": commodity_str,
            "violations": viol_texts,
            "penalty": penalty_display,
            "is_compliant": len(violations) == 0,
            "product_id": product_id
        }

    def _build_shopkeeper_data(self, db: Session, user: User, product_id: int) -> dict:
        product = db.query(Product).filter(Product.id == product_id).first() if product_id else None
        if not product and user:
            product = db.query(Product).filter(Product.shopkeeper_id == user.id).first()

        violations = db.query(Violation).filter(Violation.product_id == product.id).all() if product else []

        commodity_str = product.name if product else "Retail Commodity"
        if product and product.net_quantity:
            commodity_str += f" ({product.net_quantity})"

        establishment_name = getattr(user, "company_name", None) or "Gupta Kirana & Daily Needs"

        viol_texts = []
        for v in violations:
            if "mrp" in v.field.lower():
                viol_texts.append("MRP Declaration Font Size Deficient")
            elif "care" in v.field.lower():
                viol_texts.append("Customer Care Email / Contact Missing")
            elif "mfr" in v.field.lower() or "manufacturer" in v.field.lower():
                viol_texts.append("Manufacturer / Packer Address Incomplete")
            elif "origin" in v.field.lower():
                viol_texts.append("Country of Origin Declaration Missing")
            elif "quantity" in v.field.lower():
                viol_texts.append("Net Quantity Statutory Declaration Missing")
            else:
                viol_texts.append(f"{v.field.replace('_', ' ').title()} Statutory Declaration Deficient")

        if not viol_texts:
            viol_texts = ["All PCR 2011 Mandatory Declarations Verified & Found Compliant"]

        penalty_display = f"Rs. {(len(violations) * 25000):,}" if violations else "Rs. 0"

        return {
            "memo_id": f"CMP-LM-{datetime.datetime.utcnow().year}-{(product.id if product else 81):03d}",
            "timestamp": datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
            "inspector": "Authorized Legal Metrology Inspector",
            "status": "COMPLIANT" if not violations else "PENDING_REVIEW",
            "establishment": establishment_name,
            "jurisdiction": "Shop #14, Sector 9, Guntur, AP",
            "commodity": commodity_str,
            "violations": viol_texts,
            "penalty": penalty_display,
            "is_compliant": len(violations) == 0,
            "product_id": product.id if product else None
        }

    def _build_admin_data(self, db: Session) -> dict:
        total_violations = db.query(Violation).count()
        recent_violation = db.query(Violation).order_by(Violation.id.desc()).first()
        prod = db.query(Product).filter(Product.id == recent_violation.product_id).first() if recent_violation else None

        commodity_str = prod.name if prod else "Sana Coconut Chips (140g)"
        if prod and prod.net_quantity and prod.net_quantity not in commodity_str:
            commodity_str += f" ({prod.net_quantity})"

        return {
            "memo_id": f"CMP-LM-{datetime.datetime.utcnow().year}-081",
            "timestamp": datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
            "inspector": "R. Sharma (CHK-109)",
            "status": "PENDING_REVIEW" if total_violations > 0 else "COMPLIANT",
            "establishment": "Gupta Kirana & Daily Needs",
            "jurisdiction": "Shop #14, Sector 9, Guntur, AP",
            "commodity": commodity_str,
            "violations": [
                "MRP Declaration Font Size Deficient",
                "Customer Care Email / Contact Missing"
            ] if total_violations > 0 else ["All PCR 2011 Mandatory Declarations Verified & Found Compliant"],
            "penalty": "Rs. 25,000" if total_violations > 0 else "Rs. 0",
            "is_compliant": total_violations == 0
        }

    def _create_pdf_file(self, file_path: str, report_type: str, data: dict):
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont

            # Register clean font if present
            font_path = "C:/Windows/Fonts/segoeui.ttf"
            font_bold_path = "C:/Windows/Fonts/segoeuib.ttf"
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont("SegoeUI", font_path))
            if os.path.exists(font_bold_path):
                pdfmetrics.registerFont(TTFont("SegoeUI-Bold", font_bold_path))

            font_name = "SegoeUI" if os.path.exists(font_path) else "Helvetica"
            font_bold_name = "SegoeUI-Bold" if os.path.exists(font_bold_path) else "Helvetica-Bold"

            def draw_page_border(canv, doc):
                canv.saveState()
                canv.setStrokeColor(colors.HexColor("#0c3b6b"))
                canv.setLineWidth(1.5)
                margin = 28
                width = doc.pagesize[0] - (2 * margin)
                height = doc.pagesize[1] - (2 * margin)
                canv.roundRect(margin, margin, width, height, 8, stroke=1, fill=0)
                canv.restoreState()

            doc = SimpleDocTemplate(
                file_path,
                pagesize=letter,
                leftMargin=44,
                rightMargin=44,
                topMargin=44,
                bottomMargin=44
            )

            styles = getSampleStyleSheet()
            c_navy = colors.HexColor("#0c3b6b")
            c_slate = colors.HexColor("#1e293b")
            c_red = colors.HexColor("#b91c1c")

            emblem_text_style = ParagraphStyle(
                "EmblemText",
                parent=styles["Normal"],
                fontName=font_name,
                fontSize=8,
                leading=10,
                alignment=1,
                textColor=colors.HexColor("#475569")
            )

            gov_title_style = ParagraphStyle(
                "GovTitle",
                parent=styles["Normal"],
                fontName=font_bold_name,
                fontSize=11.5,
                leading=14,
                alignment=1,
                textColor=c_navy
            )

            gov_sub_style = ParagraphStyle(
                "GovSub",
                parent=styles["Normal"],
                fontName=font_bold_name,
                fontSize=8.5,
                leading=11,
                alignment=1,
                textColor=c_slate
            )

            gov_wing_style = ParagraphStyle(
                "GovWing",
                parent=styles["Normal"],
                fontName=font_bold_name,
                fontSize=8,
                leading=10,
                alignment=1,
                textColor=colors.HexColor("#475569")
            )

            doc_title_style = ParagraphStyle(
                "DocTitle",
                parent=styles["Normal"],
                fontName=font_name,
                fontSize=7.5,
                leading=9,
                alignment=1,
                textColor=colors.HexColor("#64748b")
            )

            meta_style = ParagraphStyle(
                "MetaStyle",
                parent=styles["Normal"],
                fontName=font_name,
                fontSize=8.5,
                leading=12,
                textColor=c_slate
            )

            sec_title_red = ParagraphStyle(
                "SecTitleRed",
                parent=styles["Normal"],
                fontName=font_bold_name,
                fontSize=9,
                leading=12,
                textColor=c_red
            )

            viol_bullet_style = ParagraphStyle(
                "ViolBullet",
                parent=styles["Normal"],
                fontName=font_name,
                fontSize=8.5,
                leading=13,
                textColor=c_slate
            )

            fine_label_style = ParagraphStyle(
                "FineLabel",
                parent=styles["Normal"],
                fontName=font_bold_name,
                fontSize=9,
                leading=12,
                textColor=c_red
            )

            fine_val_style = ParagraphStyle(
                "FineVal",
                parent=styles["Normal"],
                fontName=font_bold_name,
                fontSize=10.5,
                leading=13,
                alignment=2,
                textColor=c_red
            )

            sig_style = ParagraphStyle(
                "SigStyle",
                parent=styles["Normal"],
                fontName=font_name,
                fontSize=8,
                leading=10,
                textColor=c_slate
            )

            elements = []

            # 1. National Emblem
            emblem_path = "d:/AI ML/METRAVISION/src/assets/india.png"
            if os.path.exists(emblem_path):
                img = RLImage(emblem_path, width=28, height=36)
                img.hAlign = 'CENTER'
                elements.append(img)
                elements.append(Spacer(1, 3))

            elements.append(Paragraph("सत्यमेव जयते", emblem_text_style))
            elements.append(Spacer(1, 2))
            elements.append(Paragraph("GOVERNMENT OF INDIA", gov_title_style))
            elements.append(Paragraph("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION", gov_sub_style))
            elements.append(Paragraph("LEGAL METROLOGY ENFORCEMENT WING", gov_wing_style))
            elements.append(Paragraph("OFFICIAL INSPECTION & SEIZURE MEMO (PCR RULES, 2011)", doc_title_style))
            elements.append(Spacer(1, 10))

            # 2. Metadata Section with horizontal rules
            memo_id = data.get("memo_id", "CMP-LM-2026-081")
            ts = data.get("timestamp", datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p"))
            insp = data.get("inspector", "R. Sharma (CHK-109)")
            st = data.get("status", "PENDING_REVIEW")
            st_color = "#166534" if st == "COMPLIANT" else "#991b1b"

            meta_rows = [
                [
                    Paragraph(f"<b>Memo ID:</b> {memo_id}", meta_style),
                    Paragraph(f"<b>Timestamp:</b> {ts}", ParagraphStyle("R1", parent=meta_style, alignment=2))
                ],
                [
                    Paragraph(f"<b>Assigned Inspector:</b> {insp}", meta_style),
                    Paragraph(f"<b>Enforcement Status:</b> <font color='{st_color}'><b>{st}</b></font>", ParagraphStyle("R2", parent=meta_style, alignment=2))
                ]
            ]
            meta_table = Table(meta_rows, colWidths=[264, 260])
            meta_table.setStyle(TableStyle([
                ("LINEABOVE", (0, 0), (-1, 0), 1.2, c_navy),
                ("LINEBELOW", (0, -1), (-1, -1), 1.2, c_navy),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ]))
            elements.append(meta_table)
            elements.append(Spacer(1, 12))

            # 3. Establishment & Audited Commodity Box
            est_name = data.get("establishment", "Gupta Kirana & Daily Needs")
            jur_loc = data.get("jurisdiction", "Shop #14, Sector 9, Guntur, AP")
            com_name = data.get("commodity", "Sana Coconut Chips (140g)")

            est_rows = [
                [Paragraph(f"<b>Retail Establishment:</b> {est_name}", meta_style)],
                [Paragraph(f"<b>Jurisdiction Location:</b> {jur_loc}", meta_style)],
                [Paragraph(f"<b>Commodity Audited:</b> {com_name}", meta_style)]
            ]
            est_table = Table(est_rows, colWidths=[524])
            est_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]))
            elements.append(est_table)
            elements.append(Spacer(1, 14))

            # 4. Contraventions / Violations Recorded
            elements.append(Paragraph("CONTRAVENTIONS / VIOLATIONS RECORDED:", sec_title_red))
            elements.append(Spacer(1, 6))

            violations = data.get("violations", ["• All PCR 2011 Mandatory Declarations Verified & Found Compliant"])
            for v in violations:
                bullet_text = v if v.startswith("•") else f"• {v}"
                elements.append(Paragraph(bullet_text, viol_bullet_style))
                elements.append(Spacer(1, 3))

            elements.append(Spacer(1, 12))

            # 5. Proposed Compounding Penalty Fine Highlight Box
            pen_text = data.get("penalty", "Rs. 25,000")
            penalty_box = [
                [
                    Paragraph("PROPOSED COMPOUNDING PENALTY FINE:", fine_label_style),
                    Paragraph(pen_text, fine_val_style)
                ]
            ]
            pen_table = Table(penalty_box, colWidths=[376, 148])
            pen_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff1f2")),
                ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#fda4af")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]))
            elements.append(pen_table)
            elements.append(Spacer(1, 65))

            # 6. Signatures Section
            sig_rows = [
                [
                    Paragraph("_____________________________<br/><b>Authorized Inspector Signature</b><br/><font color='#64748b'>Legal Metrology Wing</font>", sig_style),
                    Paragraph("_____________________________<br/><b>Store Manager / Owner Seal</b><br/><font color='#64748b'>Establishment Acknowledgment</font>", ParagraphStyle("SigR", parent=sig_style, alignment=2))
                ]
            ]
            sig_table = Table(sig_rows, colWidths=[262, 262])
            sig_table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]))
            elements.append(sig_table)

            doc.build(elements, onFirstPage=draw_page_border)
        except Exception as e:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"METRAVISION OFFICIAL INSPECTION MEMO\n\n" + json.dumps(data, indent=2, default=str))

    @classmethod
    def generate_statutory_inspection_memo(
        cls,
        product_data: dict,
        violations: list,
        officer_name: str = "Authorized Inspector",
        officer_badge: str = "CHK-109",
        station: str = "Legal Metrology Enforcement Headquarters"
    ) -> bytes:
        import io
        buffer = io.BytesIO()
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.pdfgen import canvas
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont

            # Register clean font if present
            font_path = "C:/Windows/Fonts/segoeui.ttf"
            font_bold_path = "C:/Windows/Fonts/segoeuib.ttf"
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont("SegoeUI-Stat", font_path))
                except Exception:
                    pass
            if os.path.exists(font_bold_path):
                try:
                    pdfmetrics.registerFont(TTFont("SegoeUI-Bold-Stat", font_bold_path))
                except Exception:
                    pass

            font_name = "SegoeUI-Stat" if "SegoeUI-Stat" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
            font_bold_name = "SegoeUI-Bold-Stat" if "SegoeUI-Bold-Stat" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"

            def draw_page_border(canv, doc):
                canv.saveState()
                canv.setStrokeColor(colors.HexColor("#0c3b6b"))
                canv.setLineWidth(1.5)
                margin = 28
                width = doc.pagesize[0] - (2 * margin)
                height = doc.pagesize[1] - (2 * margin)
                canv.roundRect(margin, margin, width, height, 8, stroke=1, fill=0)
                canv.restoreState()

            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                leftMargin=44,
                rightMargin=44,
                topMargin=44,
                bottomMargin=44
            )

            styles = getSampleStyleSheet()
            c_navy = colors.HexColor("#0c3b6b")
            c_slate = colors.HexColor("#1e293b")
            c_red = colors.HexColor("#b91c1c")

            elements = []

            # 1. National Emblem Header
            emblem_path = "d:/AI ML/METRAVISION/src/assets/india.png"
            if os.path.exists(emblem_path):
                img = RLImage(emblem_path, width=28, height=36)
                img.hAlign = 'CENTER'
                elements.append(img)
                elements.append(Spacer(1, 3))

            elements.append(Paragraph("सत्यमेव जयते", ParagraphStyle("E1", alignment=1, fontName=font_name, fontSize=8, textColor=colors.HexColor("#475569"))))
            elements.append(Paragraph("GOVERNMENT OF INDIA", ParagraphStyle("E2", alignment=1, fontName=font_bold_name, fontSize=11.5, textColor=c_navy)))
            elements.append(Paragraph("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION", ParagraphStyle("E3", alignment=1, fontName=font_bold_name, fontSize=8.5, textColor=c_slate)))
            elements.append(Paragraph("LEGAL METROLOGY ENFORCEMENT WING", ParagraphStyle("E4", alignment=1, fontName=font_bold_name, fontSize=8, textColor=colors.HexColor("#475569"))))
            is_compliant = not violations
            memo_title = "OFFICIAL STATUTORY COMPLIANCE CLEARANCE CERTIFICATE (PCR RULES, 2011)" if is_compliant else "OFFICIAL STATUTORY INSPECTION MEMO & NOTICE (PCR RULES, 2011)"
            elements.append(Paragraph(memo_title, ParagraphStyle("E5", alignment=1, fontName=font_name, fontSize=8, textColor=colors.HexColor("#166534" if is_compliant else "#64748b"))))
            elements.append(Spacer(1, 10))

            # 2. Metadata Section
            ts = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
            status_text = "<font color='#166534'><b>COMPLIANT (ZERO VIOLATIONS)</b></font>" if is_compliant else "<font color='#991b1b'><b>NON-COMPLIANT</b></font>"
            meta_rows = [
                [
                    Paragraph(f"<b>Issuing Station:</b> {station}", ParagraphStyle("M1", fontName=font_name, fontSize=8.5)),
                    Paragraph(f"<b>Timestamp:</b> {ts}", ParagraphStyle("M2", fontName=font_name, fontSize=8.5, alignment=2))
                ],
                [
                    Paragraph(f"<b>Inspection Officer:</b> {officer_name} ({officer_badge})", ParagraphStyle("M3", fontName=font_name, fontSize=8.5)),
                    Paragraph(f"<b>Statutory Status:</b> {status_text}", ParagraphStyle("M4", fontName=font_name, fontSize=8.5, alignment=2))
                ]
            ]
            meta_table = Table(meta_rows, colWidths=[264, 260])
            meta_table.setStyle(TableStyle([
                ("LINEABOVE", (0, 0), (-1, 0), 1.2, c_navy),
                ("LINEBELOW", (0, -1), (-1, -1), 1.2, c_navy),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            elements.append(meta_table)
            elements.append(Spacer(1, 12))

            # 3. Commodity details
            p_name = product_data.get("name", "Pre-Packaged Commodity")
            p_brand = product_data.get("brand", "N/A")
            p_cat = product_data.get("category", "Packaged Goods")
            p_barcode = product_data.get("barcode", "N/A")
            com_rows = [
                [Paragraph(f"<b>Audited Commodity:</b> {p_name} | <b>Brand:</b> {p_brand}", ParagraphStyle("C1", fontName=font_name, fontSize=8.5))],
                [Paragraph(f"<b>Category:</b> {p_cat} | <b>Barcode / SKU:</b> {p_barcode}", ParagraphStyle("C2", fontName=font_name, fontSize=8.5))]
            ]
            com_table = Table(com_rows, colWidths=[524])
            com_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]))
            elements.append(com_table)
            elements.append(Spacer(1, 14))

            # 4. Compliance Determination or Contraventions Recorded
            if is_compliant:
                elements.append(Paragraph("<b>STATUTORY COMPLIANCE DETERMINATION: FULLY COMPLIANT</b>", ParagraphStyle("V1", fontName=font_bold_name, fontSize=9, textColor=colors.HexColor("#166534"))))
                elements.append(Spacer(1, 6))
                elements.append(Paragraph("• <b>Rule 6(1) PCR 2011 Verified:</b> All mandatory declarations (Commodity Generic Name, Net Quantity, MRP, Unit Sale Price, Manufacturer Coordinates, Consumer Care, Month/Year of Packing, and Traceable Batch/Lot Number) are present and conform strictly to statutory standards.", ParagraphStyle("V2", fontName=font_name, fontSize=8, leading=11, textColor=colors.HexColor("#14532d"))))
                elements.append(Spacer(1, 4))
                elements.append(Paragraph("• <b>Zero Non-Compliance:</b> No violations detected under the Legal Metrology Act, 2009 or Legal Metrology (Packaged Commodities) Rules, 2011. Total statutory penalty applicable: <b>₹0 (Zero)</b>.", ParagraphStyle("V2b", fontName=font_name, fontSize=8, leading=11, textColor=colors.HexColor("#14532d"))))
                elements.append(Spacer(1, 8))
                elements.append(Paragraph(
                    "<b>STATUTORY CLEARANCE:</b> Certified that the audited pre-packaged commodity satisfies the provisions of Section 18 of the Legal Metrology Act, 2009. "
                    "No show-cause notice, compounding application, or prosecution is initiated. This document constitutes an official Statutory Compliance Clearance Certificate.",
                    ParagraphStyle("NoticeComp", fontName=font_name, fontSize=7.5, leading=10, textColor=colors.HexColor("#15803d"))
                ))
            else:
                elements.append(Paragraph("<b>CONTRAVENTIONS / NON-COMPLIANCE RECORDED:</b>", ParagraphStyle("V1", fontName=font_bold_name, fontSize=9, textColor=c_red)))
                elements.append(Spacer(1, 6))
                for v in violations:
                    if isinstance(v, dict):
                        rule = v.get("rule_code") or v.get("rule_id", "PCR-2011")
                        field = v.get("field", "Declaration")
                        msg = v.get("message", "Non-compliance recorded")
                        rule_ref = v.get("rule_reference", "PCR 2011 Rule 6(1)")
                        act_sec = v.get("act_section", "Section 36(1) Legal Metrology Act, 2009")
                        pen_rng = v.get("penalty_range", "Up to ₹25,000 (Jan Vishwas Act, 2023)")
                        sev = v.get("severity", "HIGH")
                        elements.append(Paragraph(
                            f"• <b>[{rule}] {field.upper()}:</b> {msg}<br/>"
                            f"&nbsp;&nbsp;<i>Statutory Authority: {rule_ref} | {act_sec}</i><br/>"
                            f"&nbsp;&nbsp;<font color='#991b1b'><b>Statutory Penalty:</b> {pen_rng} (Severity: {sev})</font>",
                            ParagraphStyle("V3", fontName=font_name, fontSize=8, leading=11, textColor=c_slate)
                        ))
                    else:
                        elements.append(Paragraph(f"• {v}", ParagraphStyle("V4", fontName=font_name, fontSize=8.5, textColor=c_slate)))
                    elements.append(Spacer(1, 4))

                # Jan Vishwas Act Compounding Advisory
                elements.append(Spacer(1, 6))
                elements.append(Paragraph(
                    "<b>STATUTORY LEGAL NOTICE:</b> Notice is hereby issued under Section 36(1) / Section 36(2) of the Legal Metrology Act, 2009. "
                    "The responsible entity is called upon to show cause within the stipulated timeline or submit an application for compounding under "
                    "Section 48 read with the Jan Vishwas (Amendment of Provisions) Act, 2023 before the authorized Legal Metrology Controller.",
                    ParagraphStyle("Notice", fontName=font_name, fontSize=7.5, leading=10, textColor=colors.HexColor("#475569"))
                ))
            elements.append(Spacer(1, 14))

            # 5. Signatures
            sig_rows = [
                [
                    Paragraph("_____________________________<br/><b>Authorized Inspector Signature</b><br/><font color='#64748b'>Legal Metrology Wing</font>", ParagraphStyle("S1", fontName=font_name, fontSize=8, textColor=c_slate)),
                    Paragraph("_____________________________<br/><b>Responsible Entity Seal / Sign</b><br/><font color='#64748b'>Acknowledgment</font>", ParagraphStyle("S2", fontName=font_name, fontSize=8, alignment=2, textColor=c_slate))
                ]
            ]
            sig_table = Table(sig_rows, colWidths=[262, 262])
            sig_table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]))
            elements.append(sig_table)

            doc.build(elements, onFirstPage=draw_page_border)
            return buffer.getvalue()
        except Exception as e:
            return f"%PDF-1.4\n% MetraVision Inspection Memo\nCommodity: {product_data.get('name')}\nInspector: {officer_name}\nViolations: {len(violations)}".encode("utf-8")

report_service = ReportService()
