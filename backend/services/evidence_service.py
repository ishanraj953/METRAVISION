import json
from sqlalchemy.orm import Session
from models.evidence import Evidence
from models.violation import Violation

class EvidenceService:
    def create_evidence_chain(
        self,
        db: Session,
        violation: Violation,
        image_id: int,
        bbox: list,
        detected_text: str,
        confidence: float,
        annotated_image_path: str
    ) -> Evidence:
        evidence = Evidence(
            violation_id=violation.id,
            image_id=image_id,
            bbox=json.dumps(bbox) if bbox else None,
            detected_text=detected_text,
            ocr_confidence=confidence,
            annotated_image=annotated_image_path
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        return evidence

    def get_violation_evidence(self, db: Session, violation_id: int) -> list:
        return db.query(Evidence).filter(Evidence.violation_id == violation_id).all()

evidence_service = EvidenceService()
