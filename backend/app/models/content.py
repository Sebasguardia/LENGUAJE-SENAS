from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True) # ej: vocals
    title = Column(String, nullable=False)
    description = Column(Text)
    icon_name = Column(String) # Referencia a icono frontend
    difficulty = Column(String) 
    order_index = Column(Integer)
    duration = Column(String, nullable=True) # ej: '1h 30m'
    tags = Column(String, nullable=True) # ej: 'básico,vocales'
    is_active = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)
    
    # Relación con elementos
    elements = relationship("Element", back_populates="module")

class Element(Base):
    __tablename__ = "elements"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"))
    
    name = Column(String, nullable=False) # ej: 'A', 'Hola'
    description = Column(Text)
    image_url = Column(String, nullable=True) # Referencia visual
    
    is_command = Column(Boolean, default=False) # True para ESPACIO, BORRAR
    
    # Relaciones
    module = relationship("Module", back_populates="elements")
    progress_records = relationship("UserProgress", back_populates="element")
    captures = relationship("HandCapture", back_populates="element")

