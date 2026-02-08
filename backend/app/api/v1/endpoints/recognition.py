from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas
from app.api import deps
from app.services.gesture_recognition.classifier import GestureClassifier

router = APIRouter()
classifier = GestureClassifier()

@router.post("/predict", response_model=schemas.PredictionResponse)
def predict_gesture(
    data: schemas.PredictionRequest,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Recibe landmarks y devuelve la seña detectada comparándola con los datos reales.
    """
    # Convertir Pydantic a lista de dicts para el clasificador
    landmarks_list = [l.model_dump() for l in data.landmarks]
    
    result = classifier.predict(
        landmarks_list, 
        db=db, 
        module_slug=data.module_slug,
        expected_label=data.expected_label
    )
    
    return result
