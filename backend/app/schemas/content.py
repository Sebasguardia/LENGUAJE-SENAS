from typing import List, Optional
from pydantic import BaseModel

# --- ELEMENTOS ---
class ElementBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_command: bool = False

class ElementCreate(ElementBase):
    module_id: int

class ElementUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_command: Optional[bool] = None

class Element(ElementBase):
    id: int
    module_id: int
    captured_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --- MÓDULOS ---
class ModuleBase(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
    difficulty: Optional[str] = None
    order_index: Optional[int] = 0
    duration: Optional[str] = None
    tags: Optional[str] = None
    is_active: Optional[bool] = True
    is_published: Optional[bool] = False

class ModuleCreate(ModuleBase):
    pass

class ModuleUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    icon_name: Optional[str] = None
    difficulty: Optional[str] = None
    order_index: Optional[int] = None
    duration: Optional[str] = None
    tags: Optional[str] = None
    is_active: Optional[bool] = None
    is_published: Optional[bool] = None

class Module(ModuleBase):
    id: int
    elements: List[Element] = []

    class Config:
        from_attributes = True

class ModuleSimple(ModuleBase):
    id: int
    elements_count: int = 0
    total_captures: int = 0
    is_locked: bool = False
    elements: List[Element] = []
    
    class Config:
        from_attributes = True
