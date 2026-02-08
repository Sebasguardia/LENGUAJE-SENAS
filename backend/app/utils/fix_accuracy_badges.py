from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.gamification import UserAchievement, Achievement
from app.models.user import User
from app.services.achievement_service import achievement_service

def cleanup():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            print(f"Limpiando logros para: {user.email}")
            # Recalcular lo que debería tener
            achievement_service.check_and_award_achievements(db, user)
            
            # Verificar si tiene cosas que YA NO debería tener
            # (El check_and_award_achievements solo agrega, no quita)
            # Para este fix rápido, simplemente quitaremos acc_perfect si no cumple la nueva lógica
            
            acc_perfect = db.query(Achievement).filter(Achievement.slug == "acc_perfect").first()
            if acc_perfect:
                ua = db.query(UserAchievement).filter(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == acc_perfect.id
                ).first()
                
                if ua:
                    # Aplicar la misma lógica que en el service
                    from sqlalchemy import func
                    from app import models
                    avg_acc = db.query(func.avg(models.PracticeSession.accuracy)).filter(
                        models.PracticeSession.user_id == user.id
                    ).scalar()
                    avg_acc = (avg_acc or 0) * 100 if (avg_acc or 0) <= 1.0 else (avg_acc or 0)
                    
                    total_sessions = db.query(models.PracticeSession).filter(
                        models.PracticeSession.user_id == user.id
                    ).count()
                    
                    if avg_acc < 98.0 or total_sessions < 5:
                        print(f"  - Eliminando acc_perfect (Promedio: {avg_acc}%, Sesiones: {total_sessions})")
                        db.delete(ua)
        
        db.commit()
        print("Limpieza completada.")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
