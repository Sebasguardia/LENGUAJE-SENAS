from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    element_id = Column(Integer, ForeignKey("elements.id"))
    
    status = Column(String, default="pending") # pending, completed
    confidence_score = Column(Float, default=0.0) # Mejor puntuación histórica
    last_practiced_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="progress")
    element = relationship("Element", back_populates="progress_records")

class UserModuleProgress(Base):
    """Persistencia del progreso y precisión general de un usuario por módulo."""
    __tablename__ = "user_module_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(Integer, ForeignKey("modules.id"))

    progress = Column(Float, default=0.0)    # Progreso de maestría (Regla del 90%)
    precision = Column(Float, default=0.0)   # Promedio de mejores precisiones de elementos
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="module_progress")
    module = relationship("Module")

class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True) # Null si es práctica libre
    
    score = Column(Integer) # 0-100 (Suma de confianzas o similar)
    accuracy = Column(Float)
    duration_seconds = Column(Integer)
    details = Column(Text, nullable=True) # JSON con los resultados de cada elemento en esta sesión
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="sessions")
