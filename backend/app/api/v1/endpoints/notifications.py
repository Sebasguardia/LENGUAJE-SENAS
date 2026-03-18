
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app import models
from app.models.notification import Notification
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    limit: int = 10
) -> Any:
    """
    Obtiene las notificaciones del usuario, ordenadas por fecha (más recientes primero).
    """
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(limit).all()
    
    return notifs

@router.patch("/{notification_id}")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Marca una notificación como leída.
    """
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.read = True
    db.commit()
    return {"status": "success"}

@router.post("/mark-all-read")
def mark_all_read(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Marca todas las notificaciones como leídas.
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).update({"read": True})
    
    db.commit()
    return {"status": "success"}
