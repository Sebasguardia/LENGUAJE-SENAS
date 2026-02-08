from app.db.base_class import Base # Ahora usaremos una clase base mejorada
from app.models.user import User
from app.models.content import Module, Element
from app.models.progress import UserProgress, PracticeSession, UserModuleProgress
from app.models.gamification import Achievement, UserAchievement
from app.models.settings import SystemSetting
from app.models.notification import Notification
from app.models.dataset import HandCapture
