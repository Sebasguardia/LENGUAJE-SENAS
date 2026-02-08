from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class Landmark(BaseModel):
    x: float
    y: float
    z: float

class PredictionRequest(BaseModel):
    landmarks: List[Landmark]
    module_slug: Optional[str] = None # Para filtrar señas por módulo activo
    expected_label: Optional[str] = None # Para comparar específicamente contra una seña (Modo Práctica)

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    is_valid: bool
    message: Optional[str] = None
    top_3: Optional[List[Dict[str, Any]]] = None
