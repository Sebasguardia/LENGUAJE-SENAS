
from app.db.session import SessionLocal
from app.models.gamification import Achievement

ACHIEVEMENTS_DATA = [
    {"slug": "first_session", "title": "Primer Paso", "description": "Completaste tu primera sesión", "icon": "play", "condition_type": "sessions", "condition_value": 1, "tier": "bronze"},
    {"slug": "ten_sessions", "title": "Dedicado", "description": "Completaste 10 sesiones", "icon": "target", "condition_type": "sessions", "condition_value": 10, "tier": "silver"},
    {"slug": "fifty_sessions", "title": "Veterano", "description": "Completaste 50 sesiones", "icon": "award", "condition_type": "sessions", "condition_value": 50, "tier": "gold"},
    {"slug": "accuracy_80", "title": "Maestro de Precisión", "description": "Alcanzaste 80% de precisión promedio", "icon": "crosshair", "condition_type": "accuracy", "condition_value": 80, "tier": "gold"},
    {"slug": "first_module", "title": "Estudiante Comprometido", "description": "Completaste tu primer módulo", "icon": "book", "condition_type": "modules", "condition_value": 1, "tier": "bronze"},
    {"slug": "all_modules", "title": "Maestro Total", "description": "Completaste todos los módulos disponibles", "icon": "crown", "condition_type": "all_modules", "condition_value": 1, "tier": "platinum"},
    {"slug": "week_streak", "title": "Constancia", "description": "Mantuviste una racha de 7 días", "icon": "flame", "condition_type": "streak", "condition_value": 7, "tier": "silver"},
    {"slug": "month_streak", "title": "Imparable", "description": "Mantuviste una racha de 30 días", "icon": "zap", "condition_type": "streak", "condition_value": 30, "tier": "platinum"}
]

def init_achievements():
    db = SessionLocal()
    try:
        print("Checking achievements...")
        for ach_data in ACHIEVEMENTS_DATA:
            exists = db.query(Achievement).filter(Achievement.slug == ach_data["slug"]).first()
            if not exists:
                print(f"Creating achievement: {ach_data['title']}")
                # Note: Model doesn't have 'tier', so we skip it or store in description if needed.
                # Ideally we should add 'tier' column. For now, we will rely on code definitions for tier, 
                # but store the basic info in DB to allow foreign keys.
                ach = Achievement(
                    slug=ach_data["slug"],
                    title=ach_data["title"],
                    description=ach_data["description"],
                    icon=ach_data["icon"],
                    condition_type=ach_data["condition_type"],
                    condition_value=ach_data["condition_value"]
                )
                db.add(ach)
        db.commit()
        print("Achievements populated!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_achievements()
