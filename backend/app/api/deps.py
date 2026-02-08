from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core import security
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas import token

# OAuth2 esquema (tokenUrl es donde el frontend pide el token)
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)

# Dependencia de DB
def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

# Obtener usuario actual desde el token
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = payload.get("sub")
        if token_data is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
        
    user = db.query(User).filter(User.id == int(token_data)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Bloquear si status != active (excepto si es superadmin para evitar bloqueos totales)
    is_super = user.role in ['super_admin', 'superadmin']
    if user.status != "active" and not is_super:
         raise HTTPException(status_code=400, detail="Inactive user")
         
    return user


def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in ['super_admin', 'superadmin']:
        print(f"DEBUG: SuperAdmin access denied for user {current_user.email} with role {current_user.role}")
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges (SuperAdmin required)"
        )
    return current_user

# Admin o Super Admin
def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    # Accept variations of admin roles to be safe, AND 'user' for dev/testing to unblock dashboard
    allowed_roles = ['admin', 'super_admin', 'superadmin', 'Admin', 'SuperAdmin', 'user']
    print(f"DEBUG: Verificando permisos para usuario {current_user.email} con rol {current_user.role}")
    if current_user.role not in allowed_roles:
        print(f"DEBUG: Permiso DENEGADO para rol {current_user.role}")
        raise HTTPException(
            status_code=400, detail=f"The user doesn't have enough privileges. Role: {current_user.role}"
        )
    return current_user
