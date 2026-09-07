import json
from sqlalchemy.orm import Session
from models.audit import AuditLog
from models.user import User

def log_audit(
    db: Session,
    action: str,
    entity: str,
    entity_id: str = None,
    user: User = None,
    metadata: dict = None
):
    try:
        audit_entry = AuditLog(
            user_id=user.id if user else None,
            user_email=user.email if user else "SYSTEM",
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id is not None else None,
            metadata_json=json.dumps(metadata) if metadata else None
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Audit log failed: {e}")
