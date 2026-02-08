from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class HandCapture(Base):
    __tablename__ = "hand_captures"

    id = Column(Integer, primary_key=True, index=True)
    element_id = Column(Integer, ForeignKey("elements.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Datos de la mano: 21 puntos (x, y, z) guardados como JSON
    landmarks = Column(JSON, nullable=False)
    
    # Metadatos
    image_url = Column(String, nullable=True) # Miniatura de la captura
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    element = relationship("Element", back_populates="captures")
    user = relationship("User")
