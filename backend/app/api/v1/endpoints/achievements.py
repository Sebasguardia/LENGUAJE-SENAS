from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app import models
from app.services.achievement_service import achievement_service
from app.models.gamification import Achievement, UserAchievement

router = APIRouter()

# Definición de Categorías para Logros Escalables
ACHIEVEMENT_CATEGORIES = {
    "modules": {
        "id": "modules",
        "title": "Maestría de Módulos",
        "icon": "book",
        "unit": "módulos",
        "tiers": [
            {"slug": "mod_bronze", "title": "Iniciador", "threshold": 1, "tier": "bronze"},
            {"slug": "mod_silver", "title": "Estudiante", "threshold": 5, "tier": "silver"},
            {"slug": "mod_gold", "title": "Avanzado", "threshold": 10, "tier": "gold"},
            {"slug": "mod_platinum", "title": "Erudito", "threshold": -1, "tier": "platinum"} # -1 significa 'total'
        ]
    },
    "sessions": {
        "id": "sessions",
        "title": "Persistencia",
        "icon": "play",
        "unit": "sesiones",
        "tiers": [
            {"slug": "ses_bronze", "title": "Primer Paso", "threshold": 1, "tier": "bronze"},
            {"slug": "ses_silver", "title": "Dedicado", "threshold": 10, "tier": "silver"},
            {"slug": "ses_gold", "title": "Veterano", "threshold": 50, "tier": "gold"},
            {"slug": "ses_platinum", "title": "Maestro", "threshold": 100, "tier": "platinum"}
        ]
    },
    "streak": {
        "id": "streak",
        "title": "Constancia",
        "icon": "flame",
        "unit": "días",
        "tiers": [
            {"slug": "str_bronze", "title": "Comprometido", "threshold": 3, "tier": "bronze"},
            {"slug": "str_silver", "title": "Imparable", "threshold": 7, "tier": "silver"},
            {"slug": "str_gold", "title": "Leyenda", "threshold": 30, "tier": "gold"}
        ]
    },
    "accuracy": {
        "id": "accuracy",
        "title": "Precisión",
        "icon": "crosshair",
        "unit": "%",
        "tiers": [
            {"slug": "acc_gold", "title": "Ojo de Halcón", "threshold": 90, "tier": "gold"},
            {"slug": "acc_perfect", "title": "Perfeccionista", "threshold": 100, "tier": "platinum"}
        ]
    },
    "special": {
        "id": "special",
        "title": "Hitos Especiales",
        "icon": "zap",
        "unit": "logro",
        "tiers": [
            {"slug": "time_early", "title": "Madrugador", "threshold": 1, "tier": "bronze", "description": "Práctica antes de las 9 AM"},
            {"slug": "time_late", "title": "Búho Nocturno", "threshold": 1, "tier": "bronze", "description": "Práctica después de las 10 PM"},
            {"slug": "xp_1000", "title": "Coleccionista", "threshold": 1000, "tier": "silver", "description": "Llegaste a 1000 XP"},
            {"slug": "xp_5000", "title": "Experto", "threshold": 5000, "tier": "gold", "description": "Llegaste a 5000 XP"}
        ]
    }
}

@router.get("/user/achievements")
def get_user_achievements(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Obtiene todos los logros categorizados con progreso detallado.
    """
    try:
        # 1. Verificar y otorgar nuevos logros
        achievement_service.check_and_award_achievements(db, current_user)
        
        # 2. Obtener logros desbloqueados
        unlocked_db = db.query(UserAchievement).join(Achievement).filter(
            UserAchievement.user_id == current_user.id
        ).all()
        unlocked_slugs = {ua.achievement.slug for ua in unlocked_db}
        
        # 3. Datos reales del usuario para progreso
        module_progress = db.query(models.UserModuleProgress).filter(
            models.UserModuleProgress.user_id == current_user.id
        ).all()
        completed_modules = sum(1 for mp in module_progress if mp.progress >= 95.0)
        total_modules = db.query(models.Module).filter(models.Module.is_active == True).count()
        
        total_sessions = db.query(models.PracticeSession).filter(
            models.PracticeSession.user_id == current_user.id
        ).count()
        
        avg_accuracy_result = db.query(func.avg(models.PracticeSession.accuracy)).filter(
            models.PracticeSession.user_id == current_user.id
        ).scalar()
        avg_accuracy = round((avg_accuracy_result or 0) * 100, 1) if (avg_accuracy_result or 0) <= 1.0 else (avg_accuracy_result or 0)
        
        streak = current_user.current_streak or 0

        special_unlocked = sum(1 for t in ACHIEVEMENT_CATEGORIES["special"]["tiers"] if t["slug"] in unlocked_slugs)
        
        # Mapping de categorías a sus valores actuales
        stats_map = {
            "modules": {"current": completed_modules, "total": total_modules},
            "sessions": {"current": total_sessions, "total": 100}, # Meta máxima sugerida
            "streak": {"current": streak, "total": 30},
            "accuracy": {"current": avg_accuracy, "total": 100},
            "special": {"current": special_unlocked, "total": len(ACHIEVEMENT_CATEGORIES["special"]["tiers"])}
        }

        # 4. Construir respuesta categorizada
        categories_response = []
        for cat_key, cat_data in ACHIEVEMENT_CATEGORIES.items():
            stats = stats_map[cat_key]
            
            # Ajustar umbral de platino si es dinámico
            tiers = []
            for t in cat_data["tiers"]:
                threshold = t["threshold"]
                if threshold == -1:
                    threshold = stats["total"]
                
                tiers.append({
                    **t,
                    "threshold": threshold,
                    "unlocked": t["slug"] in unlocked_slugs
                })
            
            categories_response.append({
                **cat_data,
                "current_value": stats["current"],
                "max_value": stats["total"],
                "tiers": tiers
            })

        # 4. Calcular estadísticas
        total_sessions = db.query(models.PracticeSession).filter(
            models.PracticeSession.user_id == current_user.id
        ).count()
        
        avg_accuracy_result = db.query(func.avg(models.PracticeSession.accuracy)).filter(
            models.PracticeSession.user_id == current_user.id
        ).scalar()
        raw_accuracy = avg_accuracy_result or 0
        avg_accuracy = round(raw_accuracy, 1) if raw_accuracy > 1.0 else round(raw_accuracy * 100, 1)

        total_duration_result = db.query(func.sum(models.PracticeSession.duration_seconds)).filter(
            models.PracticeSession.user_id == current_user.id
        ).scalar()
        total_minutes = int((total_duration_result or 0) / 60)
        
        if total_minutes >= 60:
            time_display = f"{total_minutes // 60}h {total_minutes % 60}m"
        else:
            time_display = f"{total_minutes}m"
        
        module_progress = db.query(models.UserModuleProgress).filter(
            models.UserModuleProgress.user_id == current_user.id
        ).all()
        completed_modules = sum(1 for mp in module_progress if mp.progress >= 95.0)
        total_modules = db.query(models.Module).filter(models.Module.is_active == True).count()
        streak = getattr(current_user, 'current_streak', 0) or 0
        
        # 5. Calcular Rango Dinámico
        current_xp = current_user.xp or 0
        user_rank = db.query(func.count(models.User.id)).filter(
            models.User.xp > current_xp,
            models.User.status == "active"
        ).scalar() + 1
        
        max_possible_xp = achievement_service.get_max_possible_xp(db)
        lvl = achievement_service.calculate_level(current_xp, max_possible_xp)

        return {
            "categories": categories_response,
            "stats": {
                "total_sessions": total_sessions,
                "avg_accuracy": avg_accuracy,
                "total_time": time_display,
                "completed_modules": completed_modules,
                "total_modules": total_modules,
                "current_streak": streak,
                "total_xp": current_xp,
                "global_rank": user_rank,
                "level": lvl
            }
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error obteniendo logros: {str(e)}")

@router.get("/leaderboard")
def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Obtiene el ranking global de usuarios basado en XP.
    """
    top_users = db.query(models.User).filter(
        models.User.status == "active"
    ).order_by(
        models.User.xp.desc()
    ).limit(limit).all()
    
    current_xp = current_user.xp or 0
    user_rank = db.query(func.count(models.User.id)).filter(
        models.User.xp > current_xp,
        models.User.status == "active"
    ).scalar() + 1
    
    max_possible_xp = achievement_service.get_max_possible_xp(db)

    return {
        "leaderboard": [
            {
                "rank": idx + 1,
                "user_id": user.id,
                "name": user.full_name or user.email.split('@')[0],
                "xp": user.xp or 0,
                "level": achievement_service.calculate_level(user.xp or 0, max_possible_xp),
                "is_current_user": user.id == current_user.id
            }
            for idx, user in enumerate(top_users)
        ],
        "current_user_rank": user_rank,
        "total_users": db.query(func.count(models.User.id)).filter(
            models.User.status == "active"
        ).scalar()
    }
