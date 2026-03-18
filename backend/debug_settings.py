from app.core.config import settings
print(f"DEBUG_START")
print(f"SMTP_HOST: '{settings.SMTP_HOST}'")
print(f"SMTP_PORT: {settings.SMTP_PORT}")
print(f"SMTP_USER: '{settings.SMTP_USER}'")
print(f"DEBUG_END")
