from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import models
from app.api import deps

router = APIRouter()

class SettingUpdate(BaseModel):
    key: str
    value: str
    category: str

@router.get("/", response_model=List[Dict[str, Any]])
def get_settings(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Get all system settings (Admin only).
    """
    settings = db.query(models.settings.SystemSetting).all()
    return [{"key": s.key, "value": s.value, "category": s.category} for s in settings]

@router.put("/", response_model=Dict[str, str])
def update_settings(
    settings_in: List[SettingUpdate],
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update multiple system settings.
    """
    from app.utils.notifications import notify_all_admins
    
    maintenance_activated = False
    for s_in in settings_in:
        setting = db.query(models.settings.SystemSetting).filter(models.settings.SystemSetting.key == s_in.key).first()
        
        # Check if maintenance mode is being turned ON
        if s_in.key == 'maintenance_mode' and s_in.value.lower() == 'true':
            if not setting or setting.value.lower() == 'false':
                maintenance_activated = True

        if setting:
            setting.value = s_in.value
            setting.category = s_in.category
        else:
            setting = models.settings.SystemSetting(key=s_in.key, value=s_in.value, category=s_in.category)
            db.add(setting)
            
    db.commit()

    if maintenance_activated:
        notify_all_admins(
            db, 
            title="SISTEMA EN MANTENIMIENTO", 
            message="Se ha activado el modo mantenimiento. Los usuarios regulares no podrán acceder.", 
            type="warning",
            category="maintenance"
        )

    return {"message": "Settings updated successfully"}

@router.get("/public", response_model=Dict[str, Any])
def get_public_settings(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get public settings (e.g. site name, maintenance mode).
    """
    # Keys we want to expose
    public_keys = ["site_name", "maintenance_mode", "public_registration"]
    
    settings = db.query(models.settings.SystemSetting).filter(models.settings.SystemSetting.key.in_(public_keys)).all()
    result = {s.key: s.value for s in settings}
    
    # Defaults
    if "site_name" not in result: result["site_name"] = "Lenguaje de Señas IA"
    if "maintenance_mode" not in result: result["maintenance_mode"] = "false"
    if "public_registration" not in result: result["public_registration"] = "true"
    
    return result
