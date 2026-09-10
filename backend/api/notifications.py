from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database.connection import get_db
from models.notification import Notification
from models.user import User
from schemas.notification import NotificationResponse, NotificationListResponse
from auth.dependencies import get_current_user
from services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Officer Notifications"])

@router.get("", response_model=NotificationListResponse)
def list_notifications(
    unread_only: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    unread_count = NotificationService.get_unread_count(db)
    items = NotificationService.list_notifications(
        db=db,
        unread_only=unread_only,
        limit=limit,
        offset=(page - 1) * limit
    )
    return {
        "items": items,
        "unread_count": unread_count,
        "page": page,
        "limit": limit
    }

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = NotificationService.get_unread_count(db)
    return {"unread_count": count}

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = NotificationService.mark_read(db, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_count = NotificationService.mark_all_read(db)
    return {"status": "success", "marked_read_count": updated_count}
