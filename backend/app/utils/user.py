from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.user import User

def update_user_streak(db: Session, user: User) -> User:
    """
    Actualiza la racha (streak) del usuario basada en su última actividad.
    """
    now = datetime.now()
    today = now.date()
    
    if not user.last_active_at:
        user.current_streak = 1
        user.last_active_at = now
    else:
        last_active_date = user.last_active_at.date()
        days_diff = (today - last_active_date).days
        
        if days_diff == 1:
            # Actividad consecutiva (ayer)
            user.current_streak += 1
            user.last_active_at = now
            if user.current_streak > (user.longest_streak or 0):
                user.longest_streak = user.current_streak
        elif days_diff > 1:
            # Racha rota (hace más de un día)
            user.current_streak = 1
            user.last_active_at = now
        elif days_diff == 0:
            # Ya estuvo activo hoy, solo actualizamos el timestamp si queremos precisión
            # pero no aumentamos la racha
            user.last_active_at = now
            
    db.add(user)
    db.flush()
    db.refresh(user)
    return user
