from typing import Optional, Any
from pydantic import BaseModel, field_validator

class Token(BaseModel):
    access_token: str
    token_type: str
    password_change_required: bool = False
    is_2fa_enabled: bool = False
    welcome_back: bool = False
    days_inactive: int = 0

    @field_validator('password_change_required', 'is_2fa_enabled', mode='before')
    @classmethod
    def handle_none_bool(cls, v: Any) -> Any:
        if v is None:
            return False
        return bool(v)

class TokenPayload(BaseModel):
    sub: Optional[str] = None
