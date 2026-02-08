from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class HandCaptureBase(BaseModel):
    element_id: int
    landmarks: List[Any] # Lista de 21 dicts {x, y, z}
    image_url: Optional[str] = None

class HandCaptureCreate(HandCaptureBase):
    pass

class HandCapture(HandCaptureBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
