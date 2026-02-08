from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.settings import SystemSetting
from app.models.user import User

def create_notification(
    db: Session, 
    user_id: int, 
    title: str, 
    message: str, 
    type: str = "info", 
    category: str = "system"
):
    """
    Creates a notification if the corresponding category is enabled in settings.
    """
    # Map notification category to settings key
    setting_map = {
        'user': 'notify_new_user',
        'system': 'notify_system_error',
        'maintenance': 'notify_maintenance',
        'training': 'notify_training'
    }
    
    setting_key = setting_map.get(category)
    
    if setting_key:
        setting = db.query(SystemSetting).filter(SystemSetting.key == setting_key).first()
        # If setting is 'false', we don't save the notification
        if setting and setting.value.lower() == 'false':
            return None

    new_notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        category=category
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)
    return new_notif

def notify_all_admins(
    db: Session,
    title: str,
    message: str,
    type: str = "info",
    category: str = "system"
):
    """Sends a notification to all admin and super_admin users."""
    admins = db.query(User).filter(User.role.in_(['admin', 'super_admin', 'superadmin'])).all()
    for admin in admins:
        create_notification(db, admin.id, title, message, type, category)
