import numpy as np
from typing import List, Dict

class GestureProcessor:
    @staticmethod
    def normalize_landmarks(landmarks: List[Dict[str, float]]) -> np.ndarray:
        """
        Convierte los landmarks de MediaPipe a un array de NumPy normalizado.
        Resta el punto de la muñeca (punto 0) de todos los demás para que 
        la posición sea relativa a la mano y no a la pantalla.
        """
        # 21 puntos x 3 coordenadas (x, y, z) = 63 valores
        coords = np.array([[l['x'], l['y'], l['z']] for l in landmarks])
        
        # 1. Centrar: Restar la muñeca (index 0)
        base_point = coords[0]
        relative_coords = coords - base_point
        
        # 2. Escalar: Dividir por la distancia máxima (normalizar entre -1 y 1)
        max_value = np.abs(relative_coords).max()
        if max_value > 0:
            normalized_coords = relative_coords / max_value
        else:
            normalized_coords = relative_coords
            
        return normalized_coords.flatten()

    @staticmethod
    def calculate_distance(v1: np.ndarray, v2: np.ndarray) -> float:
        """Calcula la similitud entre dos vectores de manos."""
        return float(np.linalg.norm(v1 - v2))
