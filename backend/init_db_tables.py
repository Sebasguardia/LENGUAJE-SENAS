from app.db.base import Base
from app.db.session import engine
from app.db.session import SessionLocal
from app.models.settings import SystemSetting
from app.db.seeds import seed_modules
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_tables():
    logger.info("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tablas creadas con éxito.")

    # Inicializar settings por defecto si no existen
    db = SessionLocal()
    try:
        default_settings = [
            {"key": "site_name", "value": "Instituto Señas IA", "category": "general"},
            {"key": "maintenance_mode", "value": "false", "category": "general"},
            {"key": "allow_registration", "value": "true", "category": "security"}
        ]
        
        for s in default_settings:
            exists = db.query(SystemSetting).filter(SystemSetting.key == s["key"]).first()
            if not exists:
                logger.info(f"Creando setting por defecto: {s['key']}")
                db.add(SystemSetting(**s))
        
        logger.info("Semillando módulos y elementos...")
        seed_modules(db)
        
        db.commit()

    except Exception as e:
        logger.error(f"Error al inicializar settings: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_tables()
