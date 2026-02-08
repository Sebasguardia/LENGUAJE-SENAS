from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Roles: super_admin, admin, user
    role = Column(String, default="user")
    permissions = Column(Text, nullable=True) # JSON Stored: {"dashboard": true, ...}
    
    avatar_initials = Column(String)
    xp = Column(Integer, default=0)
    
    # Nuevos campos de perfil
    dni = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    position = Column(String, nullable=True) # Cargo: Analista, Soporte, etc.
    
    # Estado: active, inactive, banned
    status = Column(String, default="active")
    
    # Estadísticas
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    global_progress = Column(Float, default=0.0)
    global_precision = Column(Float, default=0.0)
    last_active_at = Column(DateTime(timezone=True), nullable=True)
    
    # Seguridad
    is_2fa_enabled = Column(Boolean, default=False)
    last_password_change = Column(DateTime(timezone=True), server_default=func.now())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones (se definirán en los otros modelos para evitar ciclos circulares si es posible, 
    # o usaremos strings para lazy loading)
    progress = relationship("UserProgress", back_populates="user")
    module_progress = relationship("UserModuleProgress", back_populates="user")
    sessions = relationship("PracticeSession", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
