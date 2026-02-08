from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"
    category: str = "system"

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    read: Optional[bool] = None

class Notification(NotificationBase):
    id: int
    user_id: int
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True
