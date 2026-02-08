from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/analytics/data-distribution")
def get_data_distribution(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Retorna la cantidad de capturas registradas por cada elemento (para el Dashboard)."""
    # Query: Agrupar capturas por element_id y contar
    results = db.query(
        models.Element.name,
        func.count(models.HandCapture.id).label("total")
    ).join(models.HandCapture, isouter=True).group_by(models.Element.id).all()
    
    return [{"label": r.name, "value": r.total} for r in results]

@router.get("/analytics/module-distribution")
def get_module_distribution(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Retorna la cantidad de capturas registradas por cada módulo."""
    results = db.query(
        models.Module.title,
        func.count(models.HandCapture.id).label("total")
    ).select_from(models.Module).join(models.Element, models.Module.id == models.Element.module_id) \
     .join(models.HandCapture, models.Element.id == models.HandCapture.element_id, isouter=True) \
     .group_by(models.Module.id).all()
    
    return [{"label": r.title, "value": r.total} for r in results]

@router.get("/analytics/recent-activity")
def get_recent_activity(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Retorna las últimas capturas y sesiones de práctica."""
    # Últimas 10 capturas
    recent_captures = db.query(
        models.HandCapture.id,
        models.HandCapture.created_at,
        models.Element.name.label("element_name"),
        models.User.full_name.label("user_name")
    ).join(models.Element).join(models.User).order_by(models.HandCapture.created_at.desc()).limit(10).all()

    # Últimas 10 sesiones de práctica
    recent_sessions = db.query(
        models.PracticeSession.id,
        models.PracticeSession.created_at,
        models.PracticeSession.accuracy,
        models.User.full_name.label("user_name")
    ).join(models.User).order_by(models.PracticeSession.created_at.desc()).limit(10).all()

    activity = []
    for r in recent_captures:
        activity.append({
            "id": f"cap_{r.id}",
            "date": r.created_at,
            "title": f"Captura: {r.element_name}",
            "user": r.user_name,
            "type": "capture"
        })
    
    for r in recent_sessions:
        activity.append({
            "id": f"sess_{r.id}",
            "date": r.created_at,
            "title": f"Práctica: {round((r.accuracy or 0) * 100, 1)}% precisión",
            "user": r.user_name,
            "type": "practice"
        })
    
    # Ordenar todo por fecha
    activity.sort(key=lambda x: x["date"], reverse=True)
    return activity[:15]

@router.get("/analytics/general-stats")
def get_general_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Estadísticas generales del sistema."""
    # Solo contamos usuarios con rol 'user', excluyendo admins
    total_users = db.query(func.count(models.User.id)).filter(models.User.role == "user").scalar()
    total_captures = db.query(func.count(models.HandCapture.id)).scalar()
    total_modules = db.query(func.count(models.Module.id)).scalar()
    published_modules = db.query(func.count(models.Module.id)).filter(models.Module.is_published == True).scalar()
    
    # Promedio de precisión de sesiones de práctica
    # Nota: Manejamos el caso donde accuracy esté guardada como decimal (0.95) o como porcentaje (95.0)
    avg_accuracy_val = db.query(func.avg(models.PracticeSession.accuracy)).scalar() or 0.0
    
    # Si el promedio es menor o igual a 1.0, asumimos que es decimal y multiplicamos por 100
    display_accuracy = round(float(avg_accuracy_val) * 100, 1) if avg_accuracy_val <= 1.0 else round(float(avg_accuracy_val), 1)
    
    # Capturas hoy
    from datetime import datetime, time
    today_start = datetime.combine(datetime.now().date(), time.min)
    captures_today = db.query(func.count(models.HandCapture.id)).filter(models.HandCapture.created_at >= today_start).scalar()
    
    return {
        "total_users": total_users,
        "total_captures": total_captures,
        "total_modules": total_modules,
        "published_modules": published_modules,
        "avg_accuracy": display_accuracy,
        "captures_today": captures_today
    }

@router.get("/analytics/top-students")
def get_top_students(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Retorna los estudiantes con más XP (excluyendo administradores)."""
    users = db.query(models.User).filter(models.User.role == "user").order_by(models.User.xp.desc()).limit(5).all()
    # Cambiamos nivel a 100 XP por nivel para que 268 XP sea Nivel 3
    return [{"name": u.full_name, "xp": u.xp, "avatar": u.avatar_initials, "level": int((u.xp or 0) / 100) + 1} for u in users]

@router.get("/analytics/user-stats/{user_id}")
def get_user_stats(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """Retorna estadísticas detalladas de un usuario específico para la vista de administrador."""
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 1. XP y Datos Básicos
    total_xp = target_user.xp or 0

    # 2. Sesiones y Precisión
    sessions = db.query(models.PracticeSession).filter(models.PracticeSession.user_id == user_id).all()
    total_sessions = len(sessions)
    avg_accuracy = sum(s.accuracy for s in sessions) / total_sessions if total_sessions > 0 else 0.0

    # 3. Módulos y Progreso (Pulling from Persistence Table)
    modules = db.query(models.Module).all()
    user_mod_progresses = db.query(models.UserModuleProgress).filter(models.UserModuleProgress.user_id == user_id).all()
    
    persist_map = {p.module_id: p for p in user_mod_progresses}
    
    module_progress_list = []
    total_mod_progress = 0
    total_mod_precision = 0
    completed_modules_count = 0

    for m in modules:
        persist_data = persist_map.get(m.id)
        prog = persist_data.progress if persist_data else 0.0
        prec = persist_data.precision if persist_data else 0.0
        
        if prog >= 99.0:
            completed_modules_count += 1
            
        module_progress_list.append({
            "id": m.id,
            "name": m.title,
            "progress": prog,
            "precision": prec,
            "status": "Completado" if prog >= 99 else "En Progreso"
        })
        
        total_mod_progress += prog
        total_mod_precision += prec

    # 4. Estadísticas Globales (Jerarquía: Promedio de módulos)
    num_modules = len(modules) if modules else 1
    
    # 5. Sesiones Recientes
    recent_sessions_db = db.query(models.PracticeSession).filter(
        models.PracticeSession.user_id == user_id
    ).order_by(models.PracticeSession.created_at.desc()).limit(5).all()

    recent_sessions_list = []
    for s in recent_sessions_db:
        mod_name = db.query(models.Module.title).filter(models.Module.id == s.module_id).scalar() if s.module_id else "Práctica Libre"
        recent_sessions_list.append({
            "id": s.id,
            "date": s.created_at.strftime("%d/%m/%Y %H:%M"),
            "module": mod_name,
            "accuracy": round((s.accuracy or 0) * 100, 1) if (s.accuracy or 0) <= 1.0 else round(s.accuracy, 1),
            "xp": s.score or 0
        })

    return {
        "total_xp": total_xp,
        "global_accuracy": round(target_user.global_precision, 1),
        "global_progress": round(target_user.global_progress, 1),
        "completed_modules_count": completed_modules_count,
        "total_sessions": total_sessions,
        "module_progress": module_progress_list,
        "recent_sessions": recent_sessions_list
    }

@router.get("/analytics/weekly-progress")
def get_weekly_progress(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Retorna la cantidad de sesiones de práctica por día (últimos 7 días)."""
    from datetime import datetime, timedelta
    
    today = datetime.now().date()
    stats = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        count = db.query(func.count(models.PracticeSession.id)).filter(
            models.PracticeSession.created_at >= day_start,
            models.PracticeSession.created_at <= day_end
        ).scalar()
        
        # Calcular promedio de precisión del día
        avg_acc = db.query(func.avg(models.PracticeSession.accuracy)).filter(
            models.PracticeSession.created_at >= day_start,
            models.PracticeSession.created_at <= day_end
        ).scalar()
        
        stats.append({
            "day": day.strftime("%d/%m"),
            "full_date": day.strftime("%Y-%m-%d"),
            "sessions": count,
            "accuracy": round((avg_acc or 0) * 100, 1)
        })
        
    return stats

@router.post("/captures", response_model=schemas.HandCapture)
def save_capture(
    *,
    db: Session = Depends(deps.get_db),
    capture_in: schemas.HandCaptureCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Guarda una nueva captura de puntos de la mano para entrenamiento."""
    capture = models.dataset.HandCapture(
        **capture_in.model_dump(),
        user_id=current_user.id
    )
    db.add(capture)
    db.commit()
    db.refresh(capture)
    return capture

@router.post("/captures/batch", response_model=List[schemas.HandCapture])
def save_captures_batch(
    *,
    db: Session = Depends(deps.get_db),
    captures_in: List[schemas.HandCaptureCreate],
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Guarda múltiples capturas en una sola petición (Optimizado)."""
    captures_db = []
    
    # Preparamos los objetos
    for cap_in in captures_in:
        capture = models.dataset.HandCapture(
            **cap_in.model_dump(),
            user_id=current_user.id
        )
        db.add(capture)
        captures_db.append(capture)
    
    # Commit único para todas
    db.commit()
    
    # Refresh para obtener IDs (opcional si no los necesitamos inmediatamente en el frontend, pero bueno para consistencia)
    for c in captures_db:
        db.refresh(c)
        
    return captures_db

@router.delete("/captures/reset/{element_id}", status_code=200)
def reset_element_captures(
    element_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Reinicia el dataset de un elemento.
    Elimina TODAS las capturas asociadas a este elemento para empezar de cero.
    """
    # 1. Verificar que el elemento existe
    element = db.query(models.Element).filter(models.Element.id == element_id).first()
    if not element:
        raise HTTPException(status_code=404, detail="Elemento no encontrado")
        
    # 2. Eliminar todas las capturas asociadas
    deleted_count = db.query(models.HandCapture).filter(
        models.HandCapture.element_id == element_id
    ).delete()
    
    # 3. Forzar el conteo del elemento a 0 (aunque el delete ya debería afectarlo al recalcular)
    element.captured_count = 0
    db.add(element)
    
    db.commit()
    
    return {"message": "Dataset reiniciado correctamente", "deleted_count": deleted_count}

@router.post("/training/trigger")
def trigger_training(
    module_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Lógica para disparar el entrenamiento del modelo (TensorFlow/Sklearn)."""
    # En el futuro, aquí llamaríamos a un worker de Celery o proceso de entrenamiento.
    return {"message": "Entrenamiento iniciado satisfactoriamente para el módulo", "module_id": module_id}

# --- DATABASE MANAGEMENT ---

@router.get("/database/stats")
def get_database_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin), # Changed to allow Admins
) -> Any:
    """Retorna estadísticas reales de las tablas de la base de datos."""
    import os
    
    # Tamaño del archivo de base de datos
    db_path = "app.db" # Asumiendo ruta por defecto
    db_size_mb = 0
    if os.path.exists(db_path):
        db_size_mb = round(os.path.getsize(db_path) / (1024 * 1024), 2)

    # Conteos de tablas
    try:
        from app.models.gamification import Achievement
        from app.models.notification import Notification
        from app.models.progress import UserProgress
        # SystemSetting no se usa abajo, así que lo removemos o corregimos
    except ImportError as e:
        print(f"Error importando modelos para stats: {e}")
        # Fallback a lista básica si fallan los imports extendidos

    stats = [
        {
            "name": "users",
            "records": db.query(func.count(models.User.id)).scalar(),
            "health": "Healthy"
        },
        {
            "name": "modules",
            "records": db.query(func.count(models.Module.id)).scalar(),
            "health": "Healthy"
        },
        {
            "name": "elements",
            "records": db.query(func.count(models.Element.id)).scalar(),
            "health": "Healthy"
        },
        {
            "name": "hand_captures",
            "records": db.query(func.count(models.HandCapture.id)).scalar(),
            "health": "High Performance"
        },
        {
            "name": "practice_sessions",
            "records": db.query(func.count(models.PracticeSession.id)).scalar(),
            "health": "Healthy"
        }
    ]

    # Agregar tablas opcionales si los modelos están disponibles
    try:
        stats.append({
            "name": "achievements",
            "records": db.query(func.count(Achievement.id)).scalar(),
            "health": "Healthy"
        })
        stats.append({
            "name": "notifications",
            "records": db.query(func.count(Notification.id)).scalar(),
            "health": "Healthy"
        })
        stats.append({
            "name": "user_progress",
            "records": db.query(func.count(UserProgress.id)).scalar(),
            "health": "Active"
        })
    except Exception as e:
        print(f"Error calculando stats extendidos: {e}")
    
    return {
        "tables": stats,
        "total_size_mb": db_size_mb,
        "connection_status": "Connected"
    }

@router.post("/database/backup")
def create_backup(
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """Crea una copia de seguridad de la base de datos SQLite."""
    import shutil
    import os
    from datetime import datetime

    backup_dir = "backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.sql" # Aunque es sqlite, nombramos así por consistencia visual
    src = "app.db"
    dst = os.path.join(backup_dir, filename)

    if not os.path.exists(src):
         raise HTTPException(status_code=404, detail="Database file not found")

    shutil.copy2(src, dst)
    
    size_mb = round(os.path.getsize(dst) / (1024 * 1024), 2)
    
    return {
        "message": "Backup created successfully",
        "filename": filename,
        "size_mb": size_mb,
        "timestamp": timestamp
    }

@router.get("/database/backups")
def list_backups(
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """Lista los archivos de respaldo disponibles."""
    import os
    from datetime import datetime
    
    backup_dir = "backups"
    if not os.path.exists(backup_dir):
        return []

    backups = []
    for f in os.listdir(backup_dir):
        path = os.path.join(backup_dir, f)
        if os.path.isfile(path):
            stat = os.stat(path)
            backups.append({
                "name": f,
                "size": f"{round(stat.st_size / (1024 * 1024), 2)} MB",
                "date": datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M"),
                "type": "Manual"
            })
            
    # Ordenar por fecha reciente
    backups.sort(key=lambda x: x['date'], reverse=True)
    return backups

from fastapi.responses import FileResponse

@router.get("/database/download/{filename}")
def download_backup(
    filename: str,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """Descarga un archivo de respaldo específico."""
    import os
    backup_dir = "backups"
    file_path = os.path.join(backup_dir, filename)
    
    # Seguridad básica para evitar Path Traversal
    if ".." in filename or "/" in filename:
         raise HTTPException(status_code=400, detail="Invalid filename")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Backup not found")

    return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
