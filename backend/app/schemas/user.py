from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
import json

# Propiedades compartidas
class UserBase(BaseModel):
    id: Optional[int] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    avatar_initials: Optional[str] = '??'
    
    # Perfil extendido
    dni: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    role: Optional[str] = "user"
    status: Optional[str] = "active"
    permissions: Optional[Any] = None

# Propiedades para crear un usuario (input)
class UserCreate(UserBase):
    email: EmailStr
    password: str
    role: str = "user" # Por defecto entra como user

# Propiedades para Update (PATCH)
class UserUpdate(UserBase):
    password: Optional[str] = None
    is_2fa_enabled: Optional[bool] = None
    permissions: Optional[Any] = None

class UserChangePassword(BaseModel):
    old_password: str
    new_password: str

class PasswordRecoveryRequest(BaseModel):
    email: EmailStr

class PasswordRecoveryVerify(BaseModel):
    email: EmailStr
    code: str

class PasswordResetWithCode(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class GoogleLogin(BaseModel):
    token: str

# Propiedades para devolver en API (Response)
class User(UserBase):
    id: int
    xp: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    is_2fa_enabled: bool = False
    last_password_change: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    permissions: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    
    @field_validator('permissions', mode='before')
    @classmethod
    def parse_permissions(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return {}
        return v or {}

    @field_validator('is_2fa_enabled', mode='before')
    @classmethod
    def handle_none_bool(cls, v: Any) -> Any:
        return v if v is not None else False

    @field_validator('xp', 'current_streak', 'longest_streak', mode='before')
    @classmethod
    def handle_none_int(cls, v: Any) -> Any:
        return v if v is not None else 0

    class Config:
        from_attributes = True
