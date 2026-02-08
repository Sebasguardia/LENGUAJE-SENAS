from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lenguaje de Señas IA"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Initial Superuser
    FIRST_SUPERUSER: str
    FIRST_SUPERUSER_PASSWORD: str

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
