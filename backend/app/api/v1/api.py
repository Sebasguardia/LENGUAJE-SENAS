from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, modules, recognition, settings, admin_tools, notifications, progress, achievements




api_router = APIRouter()

# Incluir rutas auth
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# Incluir rutas users
api_router.include_router(users.router, prefix="/users", tags=["users"])
# Incluir rutas modules
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
# Incluir rutas IA (Recognition)
api_router.include_router(recognition.router, prefix="/recognition", tags=["IA"])
# Incluir rutas settings
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
# Incluir rutas admin tools (Analytics, Captures)
api_router.include_router(admin_tools.router, prefix="/admin-tools", tags=["Admin Tools"])
# Incluir rutas notifications
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
# Incluir rutas progress
api_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
# Incluir rutas achievements
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])



# Futuro: login, modules, etc.
