"""
Notification service for officer operations.
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.notification import Notification

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        title: str,
        message: str,
        type: str = "ALERT",
        severity: str = "MEDIUM",
        case_id: Optional[int] = None,
        entity_id: Optional[int] = None,
        action_url: Optional[str] = None
    ) -> Notification:
        notif = Notification(
            title=title,
            message=message,
            type=type,
            severity=severity,
            case_id=case_id,
            responsible_party_id=entity_id,
            action_url=action_url,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def list_notifications(
        db: Session,
        unread_only: bool = False,
        limit: int = 30,
        offset: int = 0
    ) -> List[Notification]:
        q = db.query(Notification)
        if unread_only:
            q = q.filter(Notification.is_read == False)
        return q.order_by(desc(Notification.created_at)).offset(offset).limit(limit).all()

    @staticmethod
    def get_unread_count(db: Session) -> int:
        return db.query(Notification).filter(Notification.is_read == False).count()

    @staticmethod
    def mark_read(db: Session, notification_id: int) -> Optional[Notification]:
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if notif:
            notif.is_read = True
            db.commit()
            db.refresh(notif)
        return notif

    @staticmethod
    def mark_all_read(db: Session) -> int:
        updated = db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
        db.commit()
        return updated
