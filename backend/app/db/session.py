from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Configuración de motor inteligente (Soporta SQLite y Postgres)
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Parámetros de optimización para bases de datos remotas (Supabase)
engine_args = {
    "pool_pre_ping": True,
}

# Solo aplicar pooling avanzado si no es SQLite
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_args.update({
        "pool_size": 20,           # Mantener 20 conexiones abiertas
        "max_overflow": 10,        # Permitir hasta 10 extra en picos
        "pool_recycle": 1800,      # Reciclar cada 30 min para evitar desconexiones
        "pool_timeout": 30         # Tiempo de espera para obtener conexión
    })

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    **engine_args
)

# Crear clase SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependencia para inyectar sesión en endpoints (Dependency Injection)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
