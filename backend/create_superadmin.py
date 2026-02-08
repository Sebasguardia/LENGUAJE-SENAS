import logging
from app.db.session import SessionLocal
from app.models.user import User
from app.core import security
from app.db import base # Asegura que todos los modelos se carguen (UserProgress, etc)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_super(email, password, name):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            logger.info(f"El usuario {email} ya existe. Actualizando a super_admin...")
            user.role = "super_admin"
            user.hashed_password = security.get_password_hash(password)
        else:
            logger.info(f"Creando nuevo super_admin: {email}")
            user = User(
                email=email,
                hashed_password=security.get_password_hash(password),
                full_name=name,
                role="super_admin",
                status="active",
                avatar_initials=name[:2].upper()
            )
            db.add(user)
        
        db.commit()
        logger.info(f"¡Éxito! Superadmin '{email}' creado/actualizado con éxito.")
        logger.info(f"Password: {password}")
    except Exception as e:
        logger.error(f"Error creando superadmin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Puedes cambiar estos valores si lo deseas
    create_super("admin@senasia.com", "Admin123!", "Super Administrador")
