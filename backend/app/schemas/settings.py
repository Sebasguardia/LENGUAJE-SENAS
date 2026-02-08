from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class SystemSettingBase(BaseModel):
    key: str
    value: str
    category: str = "general"

class SystemSettingUpdate(BaseModel):
    value: str
    category: Optional[str] = None

class SystemSetting(SystemSettingBase):
    updated_at: datetime

    class Config:
        from_attributes = True
