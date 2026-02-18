from typing import Any, List, Dict
import json
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import schemas, models
from app.api import deps
from app.schemas.progress import PracticeSessionCreate, UserRanking, DashboardStats

router = APIRouter()

@router.post("/session", response_model=schemas.User)
def save_practice_session(
    *,
    db: Session = Depends(deps.get_db),
    session_in: PracticeSessionCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Guarda los resultados de una sesión de práctica, actualiza XP y progreso de elementos.
    """
    try:
        # 1. Buscar el mejor record previo de este módulo para calcular el XP a sumar
        previous_best = db.query(models.PracticeSession).filter(
            models.PracticeSession.user_id == current_user.id,
            models.PracticeSession.module_id == session_in.module_id
        ).order_by(models.PracticeSession.score.desc()).first()
        
        previous_score = (previous_best.score or 0) if previous_best else 0
        current_session_score = session_in.score or 0
        
        # 2. Crear el registro de la sesión con detalles JSON
        details_list = []
        for item in session_in.elements_progress:
            try:
                details_list.append(item.model_dump())
            except AttributeError:
                details_list.append(item.dict())
        
        db_session = models.PracticeSession(
            user_id=current_user.id,
            module_id=session_in.module_id,
            score=current_session_score,
            accuracy=session_in.accuracy or 0.0,
            duration_seconds=session_in.duration_seconds or 0,
            details=json.dumps(details_list)
        )
        db.add(db_session)
        db.flush()

        # 3. Actualizar XP del usuario
        if session_in.module_id is None:
            xp_to_add = session_in.xp_gained or 0
            current_user.xp = (current_user.xp or 0) + xp_to_add
            db.add(current_user)
        elif current_session_score > previous_score:
            xp_to_add = current_session_score - previous_score
            current_user.xp = (current_user.xp or 0) + xp_to_add
            db.add(current_user)

        # 4. Actualizar progreso de cada elemento
        for item in session_in.elements_progress:
            if item.element_id is None:
                continue
                
            db_progress = db.query(models.UserProgress).filter(
                models.UserProgress.user_id == current_user.id,
                models.UserProgress.element_id == item.element_id
            ).first()

            if db_progress:
                if (item.confidence_score or 0) > (db_progress.confidence_score or 0):
                    db_progress.confidence_score = item.confidence_score
                    db_progress.status = item.status
                    db_progress.last_practiced_at = func.now()
            else:
                db_progress = models.UserProgress(
                    user_id=current_user.id,
                    module_id=session_in.module_id,
                    element_id=item.element_id,
                    status=item.status or "pending",
                    confidence_score=item.confidence_score or 0.0
                )
            db.add(db_progress)

        # 5. ACTUALIZAR TABLA DE PERSISTENCIA (UserModuleProgress) Y GLOBAL (User)
        if session_in.module_id:
            try:
                module = db.query(models.Module).filter(models.Module.id == session_in.module_id).first()
                if module and module.elements:
                    elements = module.elements
                    element_ids = [e.id for e in elements]
                    all_progress = db.query(models.UserProgress).filter(
                        models.UserProgress.user_id == current_user.id,
                        models.UserProgress.element_id.in_(element_ids)
                    ).all()
                    
                    precisions_map = {p.element_id: (p.confidence_score or 0) for p in all_progress}
                    
                    num_elements = len(elements) if elements else 1
                    mod_precision = sum(precisions_map.get(e.id, 0) for e in elements) / num_elements
                    weighted_mastery = sum(min(1.0, precisions_map.get(e.id, 0) / 0.85) for e in elements)
                    mod_progress = weighted_mastery / num_elements
                    
                    db_mod_progress = db.query(models.UserModuleProgress).filter(
                        models.UserModuleProgress.user_id == current_user.id,
                        models.UserModuleProgress.module_id == session_in.module_id
                    ).first()
                    
                    if not db_mod_progress:
                        db_mod_progress = models.UserModuleProgress(user_id=current_user.id, module_id=session_in.module_id)
                    
                    db_mod_progress.progress = round(mod_progress * 100, 1)
                    db_mod_progress.precision = round(mod_precision * 100, 1)
                    db_mod_progress.last_updated = func.now()
                    db.add(db_mod_progress)
                    db.flush()

                # Estadísticas Globales del Usuario
                all_modules = db.query(models.Module).all()
                user_all_mod_progress = db.query(models.UserModuleProgress).filter(
                    models.UserModuleProgress.user_id == current_user.id
                ).all()
                persist_map = {p.module_id: p for p in user_all_mod_progress}
                
                total_global_prog = 0.0
                total_global_prec = 0.0
                for m in all_modules:
                    p_data = persist_map.get(m.id)
                    if p_data:
                        total_global_prog += (p_data.progress or 0.0)
                        total_global_prec += (p_data.precision or 0.0)
                    
                num_modules = len(all_modules) if all_modules else 1
                current_user.global_progress = round(total_global_prog / num_modules, 1)
                current_user.global_precision = round(total_global_prec / num_modules, 1)
                db.add(current_user)
            except Exception as module_err:
                print(f"[WARN] Error actualizando progreso de módulo (no crítico): {module_err}")
                # No falla el guardado de sesión por esto
                
        # 6. VERIFICAR LOGROS (envuelto en try/except para no bloquear el guardado)
        try:
            from app.services.achievement_service import achievement_service
            achievement_service.check_and_award_achievements(db, current_user)
        except Exception as ach_err:
            print(f"[WARN] Error verificando logros (no crítico): {ach_err}")

        db.commit()
        db.refresh(current_user)
        return current_user
        
    except Exception as e:
        db.rollback()
        error_detail = traceback.format_exc()
        print(f"\n{'='*60}")
        print(f"[ERROR CRITICO] save_practice_session falló:")
        print(f"User: {current_user.id} ({current_user.email})")
        print(f"Module: {session_in.module_id}")
        print(f"Score: {session_in.score}")
        print(f"Error: {str(e)}")
        print(f"Traceback:\n{error_detail}")
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=f"Error guardando sesión: {str(e)}")

@router.get("/module/{module_id}", response_model=List[schemas.progress.UserProgress])
def get_module_progress(
    module_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Obtiene el progreso del usuario para todos los elementos de un módulo.
    """
    progress = db.query(models.UserProgress).join(models.Element).filter(
        models.UserProgress.user_id == current_user.id,
        models.Element.module_id == module_id
    ).all()
    return progress

@router.get("/ranking", response_model=List[UserRanking])
def get_ranking(
    db: Session = Depends(deps.get_db),
    limit: int = 10
) -> Any:
    """
    Retorna el top de usuarios registrados con rol 'user' según XP.
    """
    users = db.query(models.User).filter(
        models.User.role == "user"
    ).order_by(models.User.xp.desc()).limit(limit).all()
    
    ranking = []
    for i, u in enumerate(users):
        ranking.append({
            "id": u.id,
            "full_name": u.full_name,
            "avatar_initials": u.avatar_initials,
            "xp": u.xp or 0,
            "rank": i + 1
        })
    return ranking

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retorna estadísticas globales para el dashboard del usuario.
    """
    # 1. XP Total y Racha
    total_xp = current_user.xp or 0
    current_streak = current_user.current_streak or 0

    # 2. Sesiones y Precisión Global
    sessions = db.query(models.PracticeSession).filter(models.PracticeSession.user_id == current_user.id).all()
    total_sessions = len(sessions)
    avg_accuracy = sum((s.accuracy or 0) for s in sessions) / total_sessions if total_sessions > 0 else 0.0

    # 3. Módulos y Progreso (Pulling from Persistence Table)
    modules = db.query(models.Module).all()
    user_mod_progresses = db.query(models.UserModuleProgress).filter(models.UserModuleProgress.user_id == current_user.id).all()
    
    # Crear un mapa para acceso rápido
    persist_map = {p.module_id: p for p in user_mod_progresses}
    
    module_progress_list = []
    total_mod_progress = 0
    total_mod_precision = 0
    completed_modules_count = 0

    for m in modules:
        persist_data = persist_map.get(m.id)
        prog = (persist_data.progress or 0.0) if persist_data else 0.0
        prec = (persist_data.precision or 0.0) if persist_data else 0.0
        
        if prog >= 95.0:
            completed_modules_count += 1
            
        module_progress_list.append({
            "module_id": m.id,
            "module_name": m.title,
            "progress": prog,
            "precision": prec
        })
        
        total_mod_progress += prog
        total_mod_precision += prec

    # 4. Estadísticas Globales (Jerarquía: Promedio de módulos)
    num_modules = len(modules) if modules else 1
    global_progress = total_mod_progress / num_modules
    global_precision = total_mod_precision / num_modules

    return {
        "total_xp": total_xp,
        "global_accuracy": avg_accuracy if avg_accuracy > 1.0 else avg_accuracy * 100,
        "global_progress": round(current_user.global_progress or 0.0, 1),
        "global_precision": round(current_user.global_precision or 0.0, 1),
        "completed_modules": completed_modules_count,
        "total_sessions": total_sessions,
        "current_streak": current_streak,
        "module_progress": module_progress_list
    }

@router.get("/history", response_model=List[Dict[str, Any]])
def get_recent_history(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    limit: int = 50
) -> Any:
    """
    Retorna el historial de sesiones del usuario.
    """
    sessions = db.query(models.PracticeSession).filter(
        models.PracticeSession.user_id == current_user.id
    ).order_by(models.PracticeSession.created_at.desc()).limit(limit).all()
    
    history = []
    for s in sessions:
        module = db.query(models.Module).filter(models.Module.id == s.module_id).first()
        history.append({
            "id": s.id,
            "module_id": s.module_id,
            "module_title": module.title if module else "Práctica Libre",
            "accuracy": round((s.accuracy or 0) if (s.accuracy or 0) > 1.0 else (s.accuracy or 0) * 100),
            "score": s.score or 0,
            "duration": f"{(s.duration_seconds or 0) // 60}m {(s.duration_seconds or 0) % 60}s",
            "details": s.details,
            "created_at": s.created_at.isoformat() if s.created_at.tzinfo else f"{s.created_at.isoformat()}Z"
        })
    return history
