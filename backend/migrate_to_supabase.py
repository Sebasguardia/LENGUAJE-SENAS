import logging
from sqlalchemy import create_engine, select, insert, text
from app.db.base import Base
from app.core.config import settings
import sys

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SQLITE_URL = "sqlite:///./app.db"
POSTGRES_URL = settings.DATABASE_URL

if POSTGRES_URL.startswith("sqlite"):
    logger.error("❌ ERROR: La DATABASE_URL sigue siendo SQLite. Verifica tu archivo .env")
    sys.exit(1)

def migrate():
    local_engine = create_engine(SQLITE_URL)
    remote_engine = create_engine(POSTGRES_URL)
    
    logger.info("🏗️ Asegurando estructura en Supabase...")
    Base.metadata.create_all(bind=remote_engine)

    tables_to_migrate = [
        "system_settings", "achievements", "users", "modules", "elements",
        "user_progress", "practice_sessions", "user_achievements", 
        "notifications", "hand_captures", "user_module_progress"
    ]

    for table_name in tables_to_migrate:
        if table_name not in Base.metadata.tables:
            continue
            
        table = Base.metadata.tables[table_name]
        logger.info(f"📤 Procesando: {table_name}...")
        
        try:
            with local_engine.connect() as local_conn:
                rows = local_conn.execute(select(table)).fetchall()
                data = [dict(row._mapping) for row in rows]
            
            if not data:
                continue

            # --- LIMPIEZA DE DATOS (Data Cleaning) ---
            original_count = len(data)
            if table_name == "user_progress":
                # Filtrar registros que no tienen user_id o tienen element_id inválido (0)
                data = [d for d in data if d.get('user_id') is not None and d.get('element_id', 0) > 0]
            
            if table_name == "hand_captures":
                data = [d for d in data if d.get('user_id') is not None]

            if len(data) < original_count:
                logger.warning(f"🧹 Se filtraron {original_count - len(data)} registros inválidos en {table_name}")

            # --- INSERCIÓN EN POSTGRES ---
            with remote_engine.begin() as remote_conn:
                # Opcional: Limpiar tabla remota para evitar conflictos de duplicados
                remote_conn.execute(text(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE"))
                
                if data:
                    remote_conn.execute(insert(table), data)
                    logger.info(f"✅ {len(data)} registros migrados con éxito.")
                
        except Exception as e:
            logger.error(f"❌ Error en {table_name}: {e}")

    logger.info("🚀 ¡MIGRACIÓN COMPLETADA CON ÉXITO!")

if __name__ == "__main__":
    confirm = input("⚠️ Esto borrará los datos actuales en Supabase y los reemplazará con los locales. ¿Seguro? (s/n): ")
    if confirm.lower() == 's':
        migrate()
    else:
        logger.info("Operación cancelada.")
