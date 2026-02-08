from sqlalchemy.orm import Session
from app.models.content import Module, Element
from app.models.gamification import Achievement

def seed_modules(db: Session):
    # 1. Vocales
    vocals = db.query(Module).filter(Module.slug == 'vocals').first()
    if not vocals:
        vocals = Module(
            slug='vocals',
            title='Vocales',
            description='Aprende las letras A, E, I, O, U en lenguaje de señas.',
            icon_name='BookText',
            difficulty='Básico',
            order_index=1,
            duration='1h 30m',
            tags='inicio,básico,letras'
        )
        db.add(vocals)
        db.flush() # Para obtener el ID
        
        elements = [
            Element(name='A', description='Mano cerrada con pulgar afuera.', module_id=vocals.id),
            Element(name='E', description='Dedos doblados tocando la palma.', module_id=vocals.id),
            Element(name='I', description='Dedo meñique estirado.', module_id=vocals.id),
            Element(name='O', description='Mano formando un círculo.', module_id=vocals.id),
            Element(name='U', description='Dedos índice y medio estirados juntos.', module_id=vocals.id),
        ]
        db.add_all(elements)

    # 2. Números
    numbers = db.query(Module).filter(Module.slug == 'numbers').first()
    if not numbers:
        numbers = Module(
            slug='numbers',
            title='Números',
            description='Aprende a contar del 0 al 9.',
            icon_name='Hash',
            difficulty='Básico',
            order_index=2,
            duration='2h 15m',
            tags='matemáticas,conteo,números'
        )
        db.add(numbers)
        db.flush()
        
        nums_elements = [Element(name=str(i), description=f"Seña del número {i}", module_id=numbers.id) for i in range(10)]
        db.add_all(nums_elements)

    # 3. Comandos de Sistema
    sys_controls = db.query(Module).filter(Module.slug == 'system-controls').first()
    if not sys_controls:
        sys_controls = Module(
            slug='system-controls',
            title='Comandos de Control',
            description='Gestos especiales: Espacio y Borrar.',
            icon_name='Cpu',
            difficulty='Especial',
            order_index=99,
            duration='15m',
            tags='sistema,control,comandos'
        )
        db.add(sys_controls)
        db.flush()
        
        controls = [
            Element(name='ESPACIO', description='Gesto para separar palabras.', is_command=True, module_id=sys_controls.id),
            Element(name='BORRAR', description='Gesto para eliminar la última seña.', is_command=True, module_id=sys_controls.id),
        ]
        db.add_all(controls)

    db.commit()
    print("Módulos y elementos semillados correctamente.")

def seed_achievements(db: Session):
    achievements = [
        # Módulos
        {"slug": "mod_bronze", "title": "Iniciador", "description": "Completaste tu primer módulo", "icon": "book", "condition_type": "modules_completed"},
        {"slug": "mod_silver", "title": "Estudiante", "description": "Completaste 5 módulos", "icon": "book", "condition_type": "modules_completed"},
        {"slug": "mod_gold", "title": "Avanzado", "description": "Completaste 10 módulos", "icon": "book", "condition_type": "modules_completed"},
        {"slug": "mod_platinum", "title": "Erudito", "description": "Completaste todos los módulos", "icon": "crown", "condition_type": "modules_completed"},
        
        # Sesiones
        {"slug": "ses_bronze", "title": "Primer Paso", "description": "Tu primera sesión de práctica", "icon": "play", "condition_type": "sessions_completed"},
        {"slug": "ses_silver", "title": "Dedicado", "description": "10 sesiones de práctica", "icon": "target", "condition_type": "sessions_completed"},
        {"slug": "ses_gold", "title": "Veterano", "description": "50 sesiones de práctica", "icon": "award", "condition_type": "sessions_completed"},
        {"slug": "ses_platinum", "title": "Maestro de Práctica", "description": "100 sesiones de práctica", "icon": "zap", "condition_type": "sessions_completed"},
        
        # Racha
        {"slug": "str_bronze", "title": "Constancia", "description": "Racha de 3 días", "icon": "flame", "condition_type": "streak_days"},
        {"slug": "str_silver", "title": "Imparable", "description": "Racha de 7 días", "icon": "flame", "condition_type": "streak_days"},
        {"slug": "str_gold", "title": "Leyenda", "description": "Racha de 30 días", "icon": "flame", "condition_type": "streak_days"},
        
        # Precisión
        {"slug": "acc_gold", "title": "Ojo de Halcón", "description": "Alcanzaste 90% de precisión", "icon": "crosshair", "condition_type": "accuracy_reached"},
        {"slug": "acc_perfect", "title": "Perfeccionista", "description": "Lograste 100% de precisión", "icon": "star", "condition_type": "accuracy_reached"},
        
        # Especiales
        {"slug": "time_early", "title": "Madrugador", "description": "Práctica antes de las 9 AM", "icon": "sun", "condition_type": "special"},
        {"slug": "time_late", "title": "Búho Nocturno", "description": "Práctica después de las 10 PM", "icon": "moon", "condition_type": "special"},
        {"slug": "xp_1000", "title": "Coleccionista", "description": "Llegaste a 1000 XP", "icon": "zap", "condition_type": "xp_milestone"},
        {"slug": "xp_5000", "title": "Experto XP", "description": "Llegaste a 5000 XP", "icon": "award", "condition_type": "xp_milestone"},
    ]
    
    for ach in achievements:
        exists = db.query(Achievement).filter(Achievement.slug == ach["slug"]).first()
        if not exists:
            db.add(Achievement(**ach))
    
    db.commit()
    print("Logros semillados correctamente.")

if __name__ == "__main__":
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        seed_modules(db)
        seed_achievements(db)
    finally:
        db.close()
