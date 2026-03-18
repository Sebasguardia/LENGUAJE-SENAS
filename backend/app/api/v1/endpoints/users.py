from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps
from app.core import security

router = APIRouter()

@router.get("/")
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Retrieve users. Solo accesible para administradores.
    """
    import json
    users = db.query(models.user.User).offset(skip).limit(limit).all()
    
    # Serialize users with parsed permissions
    result = []
    for u in users:
        user_dict = {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "status": u.status,
            "avatar_initials": u.avatar_initials or "",
            "xp": u.xp or 0,
            "dni": u.dni,
            "phone": u.phone,
            "position": u.position,
            "created_at": u.created_at,
            "is_2fa_enabled": u.is_2fa_enabled,
            "last_password_change": u.last_password_change,
            "current_streak": getattr(u, 'current_streak', 0),
            "longest_streak": getattr(u, 'longest_streak', 0),
            "permissions": {},
            "progress_summary": {
                "global_progress": u.global_progress or 0.0,
                "global_precision": u.global_precision or 0.0
            },
            "last_active_at": u.last_active_at
        }
        
        # Parse permissions JSON string
        if u.permissions:
            try:
                user_dict["permissions"] = json.loads(u.permissions)
            except:
                user_dict["permissions"] = {}
        
        result.append(user_dict)
    
    return result

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new user. Administradores pueden crear otros usuarios/admins.
    """
    print(f"DEBUG: Creando usuario con datos: {user_in.model_dump()}")
    user = db.query(models.user.User).filter(models.user.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    import json
    # Handle permissions - store as JSON string
    permissions_json = None
    if user_in.permissions:
        permissions_json = json.dumps(user_in.permissions)

    db_obj = models.user.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        dni=user_in.dni,
        phone=user_in.phone,
        position=user_in.position,
        role=user_in.role,
        permissions=permissions_json,
        status=user_in.status if user_in.status else "active",
        avatar_initials=user_in.full_name[:2].upper() if user_in.full_name else "??"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.patch("/{user_id}")
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.user.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update a user. Solo accesible para administradores.
    """
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    import json
    from datetime import datetime
    
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        hashed_password = security.get_password_hash(update_data["password"])
        user.hashed_password = hashed_password
        user.last_password_change = datetime.now() # Update timestamp
        del update_data["password"]
    
    if "permissions" in update_data and update_data["permissions"] is not None:
         user.permissions = json.dumps(update_data["permissions"])
         del update_data["permissions"]

    for field in update_data:
        if hasattr(user, field):
            setattr(user, field, update_data[field])

    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Return serialized user
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "status": user.status,
        "avatar_initials": user.avatar_initials or "",
        "xp": user.xp or 0,
        "dni": user.dni,
        "phone": user.phone,
        "position": user.position,
        "created_at": user.created_at,
        "is_2fa_enabled": user.is_2fa_enabled,
        "last_password_change": user.last_password_change,
        "permissions": json.loads(user.permissions) if user.permissions else {}
    }

@router.patch("/me/update", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    full_name: str = None,
    dni: str = None,
    phone: str = None,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user data.
    """
    if full_name:
        current_user.full_name = full_name
        current_user.avatar_initials = full_name[:2].upper()
    if dni:
        current_user.dni = dni
    if phone:
        current_user.phone = phone
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a user. Solo accesible para Super Admins por seguridad.
    """
    user = db.query(models.user.User).filter(models.user.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return user
