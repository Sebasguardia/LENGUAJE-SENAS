from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.utils.user import update_user_streak

router = APIRouter()

@router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # 1. Buscar usuario por email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. Verificar password
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    if user.status != "active":
        # Superadmin can enter even if inactive to fix things, but normally we block
        if user.role not in ['super_admin', 'superadmin']:
            raise HTTPException(status_code=400, detail="Inactive user")
            
    # 3. Verificar Rotación de Contraseña
    password_change_required = False
    
    from app.models.settings import SystemSetting
    rotation_enabled = db.query(SystemSetting).filter(SystemSetting.key == 'security_password_rotation').first()
    rotation_days = db.query(SystemSetting).filter(SystemSetting.key == 'security_password_days').first()
    
    if rotation_enabled and rotation_enabled.value.lower() == 'true' and rotation_days:
        try:
            days = int(rotation_days.value)
            from datetime import datetime
            if user.last_password_change:
                # Si han pasado más días de los permitidos
                delta = datetime.now() - user.last_password_change
                if delta.days >= days:
                    password_change_required = True
                    # Simular envío de correo
                    print(f"\n--- [EMAIL SIMULATION] ---")
                    print(f"TO: {user.email}")
                    print(f"SUBJECT: Seguridad: Rotación de Contraseña Requerida")
                    print(f"MESSAGE: Tu contraseña ha expirado. Por favor ingresa aquí para renovarla:")
                    print(f"LINK: http://localhost:5173/change-password?reason=expired")
                    print(f"---------------------------\n")
        except:
            pass

    # 4. Actualizar racha al loguear
    update_user_streak(db, user)

    # 5. Generar token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "password_change_required": password_change_required,
        "is_2fa_enabled": user.is_2fa_enabled
    }

@router.post("/change-password", response_model=schemas.User)
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    password_in: schemas.UserChangePassword,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Cambiar contraseña del usuario actual verificando la anterior.
    """
    if not security.verify_password(password_in.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    
    from datetime import datetime
    current_user.hashed_password = security.get_password_hash(password_in.new_password)
    current_user.last_password_change = datetime.now()
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/register", response_model=schemas.User)
def register_new_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user.
    """
    # 1. Verificar si existe
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
        
    # 2. Crear usuario
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        dni=user_in.dni,
        phone=user_in.phone,
        role="user", # Forzar user por seguridad pública
        status="active",
        avatar_initials=user_in.full_name[:2].upper() if user_in.full_name else "??"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    from app.utils.notifications import notify_all_admins
    notify_all_admins(
        db,
        title="NUEVO USUARIO",
        message=f"El usuario {user.full_name} ({user.email}) se ha registrado.",
        type="success",
        category="user"
    )

    return user

@router.get("/me", response_model=schemas.User)
def read_users_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user and update streak.
    """
    update_user_streak(db, current_user)
    return current_user
