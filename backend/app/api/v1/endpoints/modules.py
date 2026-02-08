from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps

router = APIRouter() # Server reload trigger

@router.get("/", response_model=List[schemas.ModuleSimple])
def read_modules(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve modules. Devuelve la lista de módulos para el Dashboard.
    Filtra por is_active y calcula si está 'bloqueado' por falta de datos.
    """
    # Solo mostrar módulos activos al público
    modules = db.query(models.content.Module).filter(models.content.Module.is_active == True).offset(skip).limit(limit).all()
    
    # Añadimos metadatos dinámicos
    for module in modules:
        module.elements_count = len(module.elements)
        total_caps = 0
        has_empty_elements = False
        
        for element in module.elements:
            cap_count = db.query(models.dataset.HandCapture).filter(models.dataset.HandCapture.element_id == element.id).count()
            element.captured_count = cap_count
            total_caps += cap_count
            if cap_count == 0:
                has_empty_elements = True
        
        module.total_captures = total_caps
        
        # Un módulo está bloqueado si:
        # 1. No está publicado (entrenado y subido)
        # 2. No tiene elementos
        # 3. Al menos uno de sus elementos no tiene capturas
        module.is_locked = not module.is_published or module.elements_count == 0 or has_empty_elements
            
    return modules

@router.get("/{slug}", response_model=schemas.Module)
def read_module_by_slug(
    slug: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific module by slug with all its elements.
    """
    module = db.query(models.content.Module).filter(models.content.Module.slug == slug).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Calcular conteo de capturas por elemento
    for element in module.elements:
        element.captured_count = len(element.captures)
        
    return module

@router.post("/", response_model=schemas.Module)
def create_module(
    *,
    db: Session = Depends(deps.get_db),
    module_in: schemas.ModuleCreate,
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new module. Solo SuperAdmin.
    """
    module = db.query(models.content.Module).filter(models.content.Module.slug == module_in.slug).first()
    if module:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Module slug already exists")
    
    db_obj = models.content.Module(**module_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/{module_id}/elements", response_model=schemas.Element)
def create_element(
    module_id: int,
    element_in: schemas.ElementBase,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Create a new element in a module (SuperAdmin only)."""
    module = db.query(models.content.Module).filter(models.content.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    element = models.content.Element(
        **element_in.model_dump(),
        module_id=module_id
    )
    db.add(element)
    db.commit()
    db.refresh(element)
    return element

@router.delete("/elements/{element_id}", response_model=schemas.Element)
def delete_element(
    element_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Delete an element."""
    element = db.query(models.content.Element).filter(models.content.Element.id == element_id).first()
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")
    db.delete(element)
    db.commit()
    return element

@router.patch("/elements/{element_id}", response_model=schemas.Element)
def update_element(
    element_id: int,
    element_in: schemas.ElementUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update an element."""
    element = db.query(models.content.Element).filter(models.content.Element.id == element_id).first()
    if not element:
        raise HTTPException(status_code=404, detail="Element not found")
    
    update_data = element_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(element, field, update_data[field])
        
    db.add(element)
    db.commit()
    db.refresh(element)
    return element

@router.patch("/{module_id}", response_model=schemas.Module)
def update_module(
    *,
    db: Session = Depends(deps.get_db),
    module_id: int,
    module_in: schemas.ModuleUpdate, 
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update a module."""
    module = db.query(models.content.Module).filter(models.content.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    update_data = module_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(module, field, update_data[field])
        
    db.add(module)
    db.commit()
    db.refresh(module)
    return module

@router.delete("/{module_id}", response_model=schemas.Module)
def delete_module(
    *,
    db: Session = Depends(deps.get_db),
    module_id: int,
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Delete a module."""
    module = db.query(models.content.Module).filter(models.content.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Delete elements first if not cascade
    for element in module.elements:
        db.delete(element)
        
    db.delete(module)
    db.commit()
    return module
