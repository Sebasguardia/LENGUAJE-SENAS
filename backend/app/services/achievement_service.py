
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.models.gamification import Achievement, UserAchievement
from app.models.notification import Notification
import math

class AchievementService:
    @staticmethod
    def get_max_possible_xp(db: Session) -> int:
        """Calcula el XP máximo posible con un piso mínimo para evitar progresión ultra-rápida."""
        active_modules_count = db.query(models.Module).filter(models.Module.is_active == True).count()
        # Piso de 1000 XP (equivalente a 10 módulos) para que el nivel no suba al máximo con 1 solo módulo
        return max(active_modules_count * 100, 1000)

    @staticmethod
    def calculate_level(xp: int, max_xp: int) -> int:
        """Calcula nivel basado en porcentaje del XP total posible."""
        if max_xp <= 0: return 1
        percentage = (xp / max_xp) * 100
        
        if percentage < 5: return 1    # Novato
        elif percentage < 15: return 2 # Aprendiz
        elif percentage < 30: return 3 # Explorador
        elif percentage < 50: return 4 # Avanzado
        elif percentage < 75: return 5 # Experto
        elif percentage < 95: return 6 # Maestro
        else: return 7                 # Leyenda

    @staticmethod
    def check_and_award_achievements(db: Session, user: models.User):
        """Verifica condiciones y otorga logros con umbrales realistas."""
        
        # 1. Recopilar estadísticas del usuario
        total_sessions = db.query(models.PracticeSession).filter(
            models.PracticeSession.user_id == user.id
        ).count()
        
        avg_accuracy_result = db.query(func.avg(models.PracticeSession.accuracy)).filter(
            models.PracticeSession.user_id == user.id
        ).scalar()
        avg_accuracy = round((avg_accuracy_result or 0) * 100, 1) if (avg_accuracy_result or 0) <= 1.0 else (avg_accuracy_result or 0)

        module_progress = db.query(models.UserModuleProgress).filter(
            models.UserModuleProgress.user_id == user.id
        ).all()
        completed_modules = sum(1 for mp in module_progress if mp.progress >= 95.0)
        total_modules = db.query(models.Module).filter(models.Module.is_active == True).count()
        
        streak = user.current_streak or 0
        
        # 1.1 Calcular estadísticas especiales (Tiempo y Sesiones Perfectas)
        from datetime import datetime
        last_sessions = db.query(models.PracticeSession).filter(
            models.PracticeSession.user_id == user.id
        ).order_by(models.PracticeSession.created_at.desc()).limit(1).all()
        
        has_perfect_session = db.query(models.PracticeSession).filter(
            models.PracticeSession.user_id == user.id,
            models.PracticeSession.accuracy >= 1.0
        ).first() is not None

        is_early_bird = False
        is_night_owl = False
        if last_sessions:
            last_hour = last_sessions[0].created_at.hour
            is_early_bird = 5 <= last_hour <= 9
            is_night_owl = 22 <= last_hour or last_hour <= 2

        # 2. Lógica de Logros (Más estricta y realista)
        achievements_logic = {
            # Módulos: Bronce(1), Plata(5), Oro(10), Platino(Todos > 5)
            "mod_bronze": completed_modules >= 1,
            "mod_silver": completed_modules >= 5 and total_modules >= 5,
            "mod_gold": completed_modules >= 10 and total_modules >= 10,
            "mod_platinum": completed_modules >= total_modules and total_modules >= 5,

            # Sesiones: Bronce(1), Plata(10), Oro(50), Platino(100)
            "ses_bronze": total_sessions >= 1,
            "ses_silver": total_sessions >= 10,
            "ses_gold": total_sessions >= 50,
            "ses_platinum": total_sessions >= 100,

            # Racha: Bronce(3), Plata(7), Oro(30)
            "str_bronze": streak >= 3,
            "str_silver": streak >= 7,
            "str_gold": streak >= 30,

            # Precisión (Basado en promedio para que coincida con la barra de progreso)
            "acc_gold": avg_accuracy >= 90.0 and total_sessions >= 3,
            "acc_perfect": avg_accuracy >= 98.0 and total_sessions >= 5, # Casi perfecto en promedio resulta en Platino

            # Especiales (Generales)
            "time_early": is_early_bird,
            "time_late": is_night_owl,
            "xp_1000": (user.xp or 0) >= 1000,
            "xp_5000": (user.xp or 0) >= 5000
        }

        # 3. Procesar desbloqueos
        new_unlocks = []
        for slug, is_met in achievements_logic.items():
            if is_met:
                ach_def = db.query(Achievement).filter(Achievement.slug == slug).first()
                if not ach_def: continue
                
                has_it = db.query(UserAchievement).filter(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == ach_def.id
                ).first()
                
                if not has_it:
                    db.add(UserAchievement(user_id=user.id, achievement_id=ach_def.id))
                    db.add(Notification(
                        user_id=user.id,
                        title="¡Logro Desbloqueado! 🏆",
                        message=f"Has ganado la insignia: {ach_def.title}",
                        type="success",
                        category="system"
                    ))
                    new_unlocks.append(ach_def.title)
        
        if new_unlocks:
            db.commit()
            
        return new_unlocks

achievement_service = AchievementService()
