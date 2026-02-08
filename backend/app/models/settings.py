from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True, index=True) # ej: maintenance_mode
    value = Column(Text) # JSON o string simple
    category = Column(String, index=True) # general, security, notifications
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
