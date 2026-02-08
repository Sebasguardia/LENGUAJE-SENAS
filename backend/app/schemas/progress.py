from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# --- USER PROGRESS (Element level) ---
class UserProgressBase(BaseModel):
    element_id: Optional[int] = None
    status: str = "pending"
    confidence_score: float = 0.0

class UserProgressCreate(UserProgressBase):
    pass

class UserProgress(UserProgressBase):
    id: int
    user_id: int
    last_practiced_at: datetime

    class Config:
        from_attributes = True

# --- PRACTICE SESSION ---
class PracticeSessionBase(BaseModel):
    module_id: Optional[int] = None
    score: int
    accuracy: float
    duration_seconds: int

class PracticeSessionCreate(PracticeSessionBase):
    # XP ganado esta sesión
    xp_gained: int
    # Progreso de elementos actualizado en esta sesión
    elements_progress: List[UserProgressBase]

class PracticeSession(PracticeSessionBase):
    id: int
    user_id: int
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- RANKING ---
class UserRanking(BaseModel):
    id: int
    full_name: str
    avatar_initials: Optional[str] = "??"
    xp: int
    rank: int

# --- DASHBOARD STATS ---
class DashboardStats(BaseModel):
    total_xp: int
    global_accuracy: float # Promedio de precisión de sesiones
    global_progress: float # Promedio de progreso de módulos
    global_precision: float # Promedio de mejores precisiones de módulos
    completed_modules: int
    total_sessions: int
    current_streak: int
    module_progress: List[Dict[str, Any]] = [] # [{ "module_id": 1, "module_name": "Vocales", "progress": 85, "precision": 92 }]
