from datetime import timedelta, datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.utils.user import update_user_streak, validate_password_strength, is_disposable_email
from app.utils.notifications import notify_all_admins
from app.utils.email import send_recovery_email, send_registration_verification_email
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

print("DEBUG: auth.py module loading [v2]...", flush=True)

router = APIRouter()

@router.post("/google", response_model=schemas.Token)
async def google_login(
    *,
    db: Session = Depends(deps.get_db),
    google_in: schemas.GoogleLogin,
) -> Any:
    """
    Verify Google Token and login/register user
    """
    print(f"DEBUG: google_login hit! Data: {google_in.model_dump()}", flush=True)
    try:
        # 1. Intentar verificar como ID Token (Forma estándar)
        print(f"DEBUG: Verificando token de Google. Token: ...{google_in.token[-10:]}", flush=True)
        try:
            idinfo = id_token.verify_oauth2_token(
                google_in.token, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            email = idinfo['email']
            full_name = idinfo.get('name', '')
            print(f"DEBUG: ID Token válido para usuario: {email}", flush=True)
        except Exception as ve:
            # 2. Fallback: Intentar usar como Access Token (usado por hooks modernos)
            print(f"DEBUG: No es un ID Token válido ({str(ve)}), intentando como Access Token...", flush=True)
            import requests as py_requests
            response = py_requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {google_in.token}"}
            )
            print(f"DEBUG: Google UserInfo Response Status: {response.status_code}", flush=True)
            if not response.ok:
                print(f"DEBUG: Google UserInfo Error: {response.text}", flush=True)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de Google inválido o expirado",
                )
            
            user_data = response.json()
            email = user_data.get('email')
            full_name = user_data.get('name', '')
            print(f"DEBUG: UserData from Google: email={email}, name={full_name}", flush=True)
            
            if not email:
                print("DEBUG: El token de Google no proporcionó email", flush=True)
                raise HTTPException(status_code=400, detail="El token de Google no proporcionó email")
                
            print(f"DEBUG: Access Token válido para usuario: {email}", flush=True)
        
    except HTTPException as he:
        print(f"DEBUG: HTTPException en Google Login: {he.detail}", flush=True)
        raise
    except Exception as e:
        print(f"DEBUG: Error inesperado en verificación de Google: {str(e)}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error en validación con Google: {str(e)}",
        )

    # 2. Buscar o Crear usuario
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Crear nuevo usuario desde Google
        import secrets
        import string
        
        # Generar password aleatoria (no se usará pero es requerida por el modelo)
        random_pwd = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        
        initials = "??"
        if full_name:
            initials = full_name[:2].upper()

        user = User(
            email=email,
            hashed_password=security.get_password_hash(random_pwd),
            full_name=full_name,
            role="user",
            status="active", # Activo de inmediato al venir de Google
            avatar_initials=initials
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Notificar a admins
        try:
            notify_all_admins(
                db,
                title="USUARIO GOOGLE",
                message=f"Nuevo usuario registrado vía Google: {full_name} ({email})",
                type="success",
                category="user"
            )
            db.commit()
        except:
            pass
    
    if user.status != "active":
        print(f"DEBUG: Usuario {email} inactivo!", flush=True)
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    # 3. Check inactivity for Welcome Back modal
    welcome_back = False
    days_inactive = 0
    if user.last_active_at:
        days_inactive = (datetime.now().date() - user.last_active_at.date()).days
        if days_inactive > 15:
            welcome_back = True

    # 4. Actualizar racha
    update_user_streak(db, user)
    db.commit()

    # 5. Generar token de acceso local
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "password_change_required": False,
        "is_2fa_enabled": user.is_2fa_enabled,
        "welcome_back": welcome_back,
        "days_inactive": days_inactive
    }

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

    # 4. Check inactivity for Welcome Back modal
    welcome_back = False
    days_inactive = 0
    if user.last_active_at:
        from datetime import datetime
        days_inactive = (datetime.now().date() - user.last_active_at.date()).days
        if days_inactive > 15:
            welcome_back = True

    # 5. Actualizar racha al loguear
    update_user_streak(db, user)
    db.commit()

    # 6. Generar token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "password_change_required": password_change_required,
        "is_2fa_enabled": user.is_2fa_enabled,
        "welcome_back": welcome_back,
        "days_inactive": days_inactive
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
    Registrar un nuevo usuario en el sistema.
    """
    # 1. Verificar si el email ya está en uso
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="El correo electrónico ya se encuentra registrado.",
        )
        
    # 2. Validar calidad del correo y password
    if is_disposable_email(user_in.email):
        raise HTTPException(
            status_code=400,
            detail="Por favor, utiliza un correo electrónico real y no temporal."
        )

    if not validate_password_strength(user_in.password):
        raise HTTPException(
            status_code=400,
            detail="La contraseña es demasiado débil. Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo."
        )
        
    # 3. Crear instancia de usuario
    try:
        # Generar iniciales de avatar de forma segura
        initials = "??"
        if user_in.full_name and len(user_in.full_name) > 0:
            initials = user_in.full_name[:2].upper()

        import random
        import string
        from datetime import datetime, timedelta
        
        # Generar código de verificación
        v_code = ''.join(random.choices(string.digits, k=6))

        user = User(
            email=user_in.email,
            hashed_password=security.get_password_hash(user_in.password),
            full_name=user_in.full_name,
            dni=user_in.dni,
            phone=user_in.phone,
            role="user",
            status="pending", # Poner en espera hasta verificar email
            avatar_initials=initials,
            recovery_code=v_code,
            recovery_code_expires=datetime.now() + timedelta(hours=24) # Código de activación más largo
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Enviar correo de verificación
        send_registration_verification_email(user.email, v_code)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error crítico al guardar el perfil: {str(e)}"
        )

    # 3. Notificación administrativa (Opcional, no bloquea el registro)
    try:
        notify_all_admins(
            db,
            title="NUEVO USUARIO",
            message=f"El usuario {user.full_name} ({user.email}) se ha registrado exitosamente.",
            type="success",
            category="user"
        )
        db.commit() # Confirmar las notificaciones enviadas
    except Exception:
        # Si falla la notificación interna (ej. por secuencias), el usuario no debería enterarse
        # ya que su registro fue exitoso.
        pass

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
    db.commit()
    return current_user

@router.post("/password-recovery")
def recover_password(
    *,
    db: Session = Depends(deps.get_db),
    recovery_in: schemas.PasswordRecoveryRequest,
) -> Any:
    """
    Ruta 1: Solicitar recuperación. Genera código de 6 dígitos.
    """
    user = db.query(User).filter(User.email == recovery_in.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Restricción de Seguridad: Bloquear recuperación para SuperAdmins
    if user.role in ["super_admin", "superadmin", "SuperAdmin"]:
        raise HTTPException(
            status_code=403, 
            detail="La recuperación de contraseña está deshabilitada para cuentas de Administrador Superior por seguridad."
        )
    
    import random
    import string
    from datetime import datetime, timedelta
    
    # Generar código de 6 dígitos
    code = ''.join(random.choices(string.digits, k=6))
    
    user.recovery_code = code
    user.recovery_code_expires = datetime.now() + timedelta(minutes=10)
    
    db.add(user)
    db.commit()
    
    # Envío Real de Correo
    email_sent = send_recovery_email(user.email, code)
    
    if not email_sent:
        # Si falla el SMTP, aún lo mostramos en consola para desarrollo pero avisamos al usuario
        print(f"\n[AVISO] SMTP falló. Código en consola para desarrollo: {code}\n")
    
    return {"message": "Si el correo existe, el código ha sido enviado."}

@router.post("/verify-recovery-code")
def verify_recovery_code(
    *,
    db: Session = Depends(deps.get_db),
    verify_in: schemas.PasswordRecoveryVerify,
) -> Any:
    """
    Ruta 2: Validar código.
    """
    user = db.query(User).filter(User.email == verify_in.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not user.recovery_code or user.recovery_code != verify_in.code:
        raise HTTPException(status_code=400, detail="Código inválido")
    
    from datetime import datetime
    if not user.recovery_code_expires or datetime.now() > user.recovery_code_expires:
        raise HTTPException(status_code=400, detail="El código ha expirado")
    
    return {"message": "Código verificado correctamente"}

@router.post("/reset-password-with-code")
def reset_password_with_code(
    *,
    db: Session = Depends(deps.get_db),
    reset_in: schemas.PasswordResetWithCode,
) -> Any:
    """
    Ruta 3: Resetear contraseña.
    """
    user = db.query(User).filter(User.email == reset_in.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not user.recovery_code or user.recovery_code != reset_in.code:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    
    from datetime import datetime
    if not user.recovery_code_expires or datetime.now() > user.recovery_code_expires:
        raise HTTPException(status_code=400, detail="El código ha expirado")
    
    if not validate_password_strength(reset_in.new_password):
        raise HTTPException(
            status_code=400, 
            detail="La contraseña nueva es muy débil. Usa mayúsculas, números y símbolos."
        )

    # Actualizar password
    user.hashed_password = security.get_password_hash(reset_in.new_password)
    user.last_password_change = datetime.now()
    
    # Limpiar campos de recuperación
    user.recovery_code = None
    user.recovery_code_expires = None
    
    db.add(user)
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente"}

@router.post("/verify-registration")
def verify_registration(
    *,
    db: Session = Depends(deps.get_db),
    verify_in: schemas.PasswordRecoveryVerify, # Reusamos esquema que tiene email y code
) -> Any:
    """
    Activar cuenta de usuario mediante código de verificación.
    """
    user = db.query(User).filter(User.email == verify_in.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user.status == "active":
        return {"message": "La cuenta ya se encuentra activa."}
    
    if not user.recovery_code or user.recovery_code != verify_in.code:
        raise HTTPException(status_code=400, detail="Código de verificación incorrecto")
    
    from datetime import datetime
    if not user.recovery_code_expires or datetime.now() > user.recovery_code_expires:
        raise HTTPException(status_code=400, detail="El código de activación ha expirado")
    
    # Activar usuario
    user.status = "active"
    user.recovery_code = None
    user.recovery_code_expires = None
    
    db.add(user)
    db.commit()
    
    # Notificar a admins que se completó el registro
    try:
        notify_all_admins(
            db,
            title="REGISTRO COMPLETADO",
            message=f"El usuario {user.full_name} ha verificado su cuenta.",
            type="info",
            category="user"
        )
        db.commit()
    except:
        pass

    return {"message": "Cuenta activada exitosamente. Ya puedes iniciar sesión."}
