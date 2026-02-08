from typing import List, Dict, Optional
import numpy as np
from sqlalchemy.orm import Session
from .processor import GestureProcessor
from app.models.dataset import HandCapture
from app.models.content import Element

class GestureClassifier:
    def __init__(self):
        self.processor = GestureProcessor()
        self.is_trained = False
        self.global_templates = {}  # Templates globales
        self.module_cache = {}      # Cache de {module_slug: templates_dict}
        self.templates = {}         # Templates activos de la última operación

    def load_templates(self, db: Session, module_slug: Optional[str] = None):
        """
        ENTRENAMIENTO: Carga capturas y genera modelos maestros (templates).
        Implementa caché para evitar re-entrenamiento constante.
        """
        # Si ya tenemos este módulo en caché, no re-entrenar
        if module_slug and module_slug in self.module_cache:
            self.templates = self.module_cache[module_slug]
            return
        elif not module_slug and self.is_trained:
            self.templates = self.global_templates
            return

        try:
            query = db.query(HandCapture)
            if module_slug:
                from app.models.content import Module
                query = query.join(Element).join(Module).filter(Module.slug == module_slug)
            
            captures = query.all()
            
            if not captures:
                # Si no hay capturas para el módulo, usamos las globales como fallback
                if module_slug:
                    self.load_templates(db, None)
                return

            new_templates = {}
            temp_data = {}
            
            # 1. Agrupar y normalizar
            for cap in captures:
                label = cap.element.name.lower()
                if not label: continue 
                if label not in temp_data:
                    temp_data[label] = []
                
                normalized = self.processor.normalize_landmarks(cap.landmarks)
                temp_data[label].append(normalized)
            
            # 2. Refinamiento Estadístico
            for label, vectors in temp_data.items():
                if not vectors: continue
                vector_stack = np.array(vectors)
                initial_mean = np.mean(vector_stack, axis=0)
                
                distances = np.linalg.norm(vector_stack - initial_mean, axis=1)
                mean_dist = np.mean(distances)
                std_dist = np.std(distances)
                threshold = mean_dist + (1.5 * std_dist)
                
                clean_vectors = vector_stack[distances < threshold]
                
                if len(clean_vectors) > 0:
                    new_templates[label] = np.mean(clean_vectors, axis=0)
                else:
                    new_templates[label] = initial_mean
            
            # 3. Guardar en Caché
            if module_slug:
                self.module_cache[module_slug] = new_templates
                self.templates = new_templates
            else:
                self.global_templates = new_templates
                self.templates = new_templates
                self.is_trained = True
                
            print(f"--- Entrenamiento completado para: {module_slug or 'Global'} ({len(new_templates)} clases) ---")
            
        except Exception as e:
            print(f"Error Crítico en Entrenamiento: {e}")

    def predict(self, raw_landmarks: List[Dict[str, float]], db: Optional[Session] = None, module_slug: Optional[str] = None, expected_label: Optional[str] = None) -> Dict:
        """
        Recibe landmarks y devuelve la seña más probable.
        Usa caché de modelos para máximo rendimiento (millonésimas de segundo).
        """
        # Carga inteligente: Solo consulta la DB si el módulo no está en memoria
        if db:
            if module_slug:
                if module_slug not in self.module_cache:
                    self.load_templates(db, module_slug)
                else:
                    self.templates = self.module_cache[module_slug]
            elif not self.is_trained:
                self.load_templates(db, None)

        if not self.templates:
            return {
                "prediction": "Desconocido",
                "confidence": 0.0,
                "is_valid": False,
                "error": "No templates loaded"
            }

        normalized = self.processor.normalize_landmarks(raw_landmarks)
        
        results = []
        for label, template in self.templates.items():
            dist = self.processor.calculate_distance(normalized, template)
            conf = max(0, 1 - (dist / 2.5))
            results.append({
                "name": label,
                "confidence": float(conf),
                "distance": dist
            })
        
        results.sort(key=lambda x: x["confidence"], reverse=True)
        
        best_match_item = results[0]
        top_3 = results[:3]
        
        target_confidence = best_match_item["confidence"]
        if expected_label:
            target_label = expected_label.lower()
            for r in results:
                if r["name"] == target_label:
                    target_confidence = r["confidence"]
                    break

        return {
            "prediction": best_match_item["name"],
            "confidence": float(target_confidence),
            "is_valid": target_confidence > 0.7,
            "top_3": top_3
        }
