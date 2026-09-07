import os
import json
import datetime
from sqlalchemy.orm import Session
from models.listing import Report
from models.user import User, UserRole
from models.product import Product
from models.violation import Violation
from models.scan import Scan
from models.inspection import Inspection
from config import settings

class ReportService:
    def generate_report(
        self,
        db: Session,
        report_type: str,
        user: User,
        product_id: int = None,
        report_format: str = "JSON"
    ) -> Report:
        os.makedirs(os.path.join(settings.STORAGE_DIR, "reports"), exist_ok=True)
        report_type_upper = report_type.upper()
        
        report_data = {}
        if report_type_upper == "CHECKER":
            report_data = self._build_checker_data(db, product_id)
        elif report_type_upper == "SHOPKEEPER":
            report_data = self._build_shopkeeper_data(db, user, product_id)
        else: # ADMIN
            report_data = self._build_admin_data(db)

        filename = f"report_{report_type_upper.lower()}_{int(datetime.datetime.utcnow().timestamp())}"
        file_path = None

        if report_format.upper() == "PDF":
            file_path = os.path.join(settings.STORAGE_DIR, "reports", f"{filename}.pdf")
            self._create_pdf_file(file_path, report_type_upper, report_data)
        else:
            file_path = os.path.join(settings.STORAGE_DIR, "reports", f"{filename}.json")
            with open(file_path, "w") as f:
                json.dump(report_data, f, indent=2)

        report_db = Report(
            report_type=report_type_upper,
            generated_by=user.id,
            file_path=file_path,
            format=report_format.upper(),
            data=json.dumps(report_data)
        )
        db.add(report_db)
        db.commit()
        db.refresh(report_db)

        return report_db

    def _build_checker_data(self, db: Session, product_id: int) -> dict:
        product = db.query(Product).filter(Product.id == product_id).first() if product_id else None
        violations = db.query(Violation).filter(Violation.product_id == product_id).all() if product_id else []
        inspections = db.query(Inspection).filter(Inspection.product_id == product_id).all() if product_id else []
        
        return {
            "title": "Legal Metrology Inspection Checker Report",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "product": {
                "id": product.id if product else None,
                "name": product.name if product else "N/A",
                "category": product.category if product else "N/A",
                "mrp": product.mrp if product else "N/A",
                "manufacturer": product.manufacturer_name if product else "N/A"
            } if product else None,
            "violations_count": len(violations),
            "violations": [
                {
                    "id": v.id,
                    "field": v.field,
                    "expected": v.expected_value,
                    "observed": v.observed_value,
                    "status": v.status,
                    "severity": v.severity
                } for v in violations
            ],
            "inspections_count": len(inspections)
        }

    def _build_shopkeeper_data(self, db: Session, user: User, product_id: int) -> dict:
        products = db.query(Product).filter(Product.shopkeeper_id == user.id).all()
        return {
            "title": "Shopkeeper Compliance Report",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "shopkeeper_email": user.email,
            "total_products": len(products),
            "compliant_products": sum(1 for p in products if p.status == "COMPLIANT"),
            "non_compliant_products": sum(1 for p in products if p.status != "COMPLIANT")
        }

    def _build_admin_data(self, db: Session) -> dict:
        total_products = db.query(Product).count()
        total_scans = db.query(Scan).count()
        total_violations = db.query(Violation).count()
        total_inspections = db.query(Inspection).count()

        return {
            "title": "METRA-X Executive Admin Compliance Report",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "total_products": total_products,
            "total_scans": total_scans,
            "total_violations": total_violations,
            "total_inspections": total_inspections,
            "compliance_rate": round(100.0 * (1.0 - (total_violations / max(1, total_scans))), 2)
        }

    def _create_pdf_file(self, file_path: str, report_type: str, data: dict):
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas

            c = canvas.Canvas(file_path, pagesize=letter)
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, 750, f"METRA-X {report_type} REPORT")
            c.setFont("Helvetica", 10)
            c.drawString(50, 735, f"Generated: {data.get('timestamp')}")

            y = 700
            for k, v in data.items():
                if y < 80:
                    c.showPage()
                    y = 750
                line = f"{k}: {v}"
                if len(line) > 80:
                    line = line[:80] + "..."
                c.drawString(50, y, line)
                y -= 20

            c.save()
        except Exception:
            # Fallback text format if pdf generation fails
            with open(file_path, "w") as f:
                f.write(f"METRA-X {report_type} REPORT\n\n" + json.dumps(data, indent=2))

report_service = ReportService()
