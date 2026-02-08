from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True) # ej: module_master_gold
    title = Column(String)
    description = Column(String)
    icon = Column(String)
    
    # Lógica de desbloqueo
    condition_type = Column(String) # total_xp, modules_completed
    condition_value = Column(Integer)
    
    user_associations = relationship("UserAchievement", back_populates="achievement")

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), primary_key=True)
    
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_associations")
