from sqlalchemy.orm import Session
from app.core.config import settings
from app.core import security
from app.models.user import User
from app.schemas.user import UserCreate

def init_db(db: Session) -> None:
    # 1. Verificar si existe superuser
    user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER).first()
    if not user:
        user = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=security.get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="Super Administrator",
            role="super_admin",
            status="active",
            avatar_initials="SA"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Superuser created: {user.email}")
    else:
        print(f"Superuser already exists: {user.email}")
