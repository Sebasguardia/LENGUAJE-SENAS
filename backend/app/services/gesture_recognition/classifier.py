from typing import List, Dict, Optional
import numpy as np
from sqlalchemy.orm import Session
from .processor import GestureProcessor
from app.models.dataset import HandCapture
from app.models.content import Element

class GestureClassifier:
    def __init__(self):
        self.templates = {} # Dict de {nombre_seña: vector_normalizado}
        self.processor = GestureProcessor()
        self.is_trained = False

    def load_templates(self, db: Session, module_slug: Optional[str] = None):
        """
        ENTRENAMIENTO: Carga capturas, limpia outliers y genera modelos maestros (templates).
        Utiliza desviación estándar para eliminar datos ruidosos y mejorar la precisión.
        """
        try:
            query = db.query(HandCapture)
            if module_slug:
                from app.models.content import Module
                query = query.join(Element).join(Module).filter(Module.slug == module_slug)
            
            captures = query.all()
            
            if not captures:
                if module_slug:
                    self.load_templates(db, None)
                return

            new_templates = {}
            temp_data = {}
            
            # 1. Agrupar datos crudos
            for cap in captures:
                label = cap.element.name.lower()
                if not label: continue 
                if label not in temp_data:
                    temp_data[label] = []
                
                # Normalizar
                normalized = self.processor.normalize_landmarks(cap.landmarks)
                temp_data[label].append(normalized)
            
            # 2. Refinamiento Estadístico (Entrenamiento)
            print(f"--- Iniciando Entrenamiento ({module_slug or 'Global'}) ---")
            for label, vectors in temp_data.items():
                if not vectors: continue
                
                vector_stack = np.array(vectors)
                
                # A. Calcular centroide inicial
                initial_mean = np.mean(vector_stack, axis=0)
                
                # B. Detectar Outliers (Muestras malas)
                # Calculamos distancia de cada muestra al centroide
                distances = np.linalg.norm(vector_stack - initial_mean, axis=1)
                
                # Criterio: Descartar muestras más allá de 1.5 desviaciones estándar
                mean_dist = np.mean(distances)
                std_dist = np.std(distances)
                threshold = mean_dist + (1.5 * std_dist)
                
                # Filtrar vectores buenos
                clean_vectors = vector_stack[distances < threshold]
                
                # C. Generar Template Final (Promedio Refinado)
                if len(clean_vectors) > 0:
                    final_template = np.mean(clean_vectors, axis=0)
                    new_templates[label] = final_template
                    
                    # Métricas de entrenamiento
                    discarded = len(vector_stack) - len(clean_vectors)
                    quality = 100 - (discarded / len(vector_stack) * 100)
                    print(f"  > Clase '{label}': {len(clean_vectors)}/{len(vector_stack)} muestras usadas. Calidad: {quality:.1f}%")
                else:
                    # Fallback si todo es muy disperso
                    new_templates[label] = initial_mean
            
            # 3. Actualizar Modelo en Memoria
            if module_slug:
                self.templates = new_templates
            else:
                self.templates.update(new_templates)
            
            self.is_trained = True
            print(f"--- Entrenamiento Completado. {len(self.templates)} modelos optimizados. ---")
            
        except Exception as e:
            print(f"Error Crítico en Entrenamiento: {e}")

    def predict(self, raw_landmarks: List[Dict[str, float]], db: Optional[Session] = None, module_slug: Optional[str] = None, expected_label: Optional[str] = None) -> Dict:
        """
        Recibe landmarks y devuelve la seña más probable + top 3.
        Si se provee expected_label, devuelve la confianza específicamente para esa seña.
        """
        if (not self.is_trained or module_slug) and db:
            self.load_templates(db, module_slug)

        if not self.templates:
            return {
                "prediction": "Desconocido",
                "confidence": 0.0,
                "is_valid": False,
                "error": "No templates loaded"
            }

        normalized = self.processor.normalize_landmarks(raw_landmarks)
        
        # Calcular distancias para todos los templates
        results = []
        for label, template in self.templates.items():
            dist = self.processor.calculate_distance(normalized, template)
            # Normalizar confianza: 2.5 es distancia máxima aproximada (ajustado para ser más indulgente)
            conf = max(0, 1 - (dist / 2.5))
            results.append({
                "name": label,
                "confidence": float(conf),
                "distance": dist
            })
        
        # Ordenar por confianza (mayor a menor)
        results.sort(key=lambda x: x["confidence"], reverse=True)
        
        best_match_item = results[0]
        top_3 = results[:3]
        
        # Si hay una seña esperada, calcular su confianza específica si no es la primera
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
