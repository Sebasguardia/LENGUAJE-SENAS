# Arquitectura del Sistema Backend - Lenguaje de Señas IA

Este documento define la estructura técnica, base de datos y lógica de inteligencia artificial para el backend del sistema.

## 1. Stack Tecnológico

*   **Lenguaje:** Python 3.10+ (Estándar para IA/ML).
*   **Framework API:** FastAPI (Alto rendimiento, asíncrono, documentación automática).
*   **Servidor Web:** Uvicorn (ASGI).
*   **Base de Datos:** PostgreSQL (Producción) / SQLite (Desarrollo inicial).
*   **ORM:** SQLAlchemy (Gestión de base de datos) + Pydantic (Validación de datos).
*   **Autenticación:** JWT (JSON Web Tokens) con algoritmo HS256.
*   **Inteligencia Artificial:**
    *   **MediaPipe:** Extracción de landmarks (puntos clave) de las manos.
    *   **Scikit-Learn / TensorFlow:** Clasificación de señas basada en landmarks.
    *   **NumPy:** Procesamiento numérico de coordenadas.

---

## 2. Esquema de Base de Datos (Tablas)

El sistema relacional se diseñará para reflejar la estructura de datos del frontend actual.

### 2.1. Tabla: `users`
Almacena la información de autenticación y perfil extendido.
*   `id`: Integer (PK)
*   `full_name`: String
*   `email`: String (Unique)
*   `hashed_password`: String
*   `role`: String (Enum: 'super_admin', 'admin', 'user')
*   `avatar_initials`: String
*   `xp`: Integer (Total Experience Points)
*   `dni`: String (Opcional)
*   `phone`: String (Opcional)
*   `status`: String ('active', 'inactive', 'banned') - Default: 'active'
*   `current_streak`: Integer (Días seguidos)
*   `longest_streak`: Integer
*   `created_at`: Datetime

### 2.2. Tabla: `system_settings`
Configuración global del sistema (Admin Panel).
*   `key`: String (PK, ej: 'maintenance_mode', 'site_name')
*   `value`: Text (Valor JSON o string)
*   `category`: String ('general', 'security', 'notifications')
*   `updated_at`: Datetime

### 2.3. Tabla: `modules`
Catálogo de los módulos de aprendizaje (Vocales, Números, etc.).
*   `id`: Integer (PK)
*   `slug`: String (Unique, ej: 'vocals', 'numbers')
*   `title`: String
*   `description`: Text
*   `icon_name`: String (Referencia al icono de Lucide en frontend)
*   `difficulty`: String ('Básico', 'Intermedio', 'Avanzado', 'Especial')
*   `order_index`: Integer (Para ordenar la ruta de aprendizaje)

### 2.4. Tabla: `elements`
Las unidades mínimas de aprendizaje (Señas específicas) dentro de cada módulo.
*   `id`: Integer (PK)
*   `module_id`: Integer (FK -> modules.id)
*   `name`: String (ej: 'A', 'Hola', 'Espacio')
*   `description`: Text (Instrucción de cómo hacer la seña)
*   `image_url`: String (Opcional, URL de imagen de referencia)
*   `is_command`: Boolean (True para 'ESPACIO', 'BORRAR')

### 2.5. Tabla: `user_progress`
Estado ACTUAL del avance (Resumen).
*   `id`: Integer (PK)
*   `user_id`: Integer (FK -> users.id)
*   `element_id`: Integer (FK -> elements.id)
*   `status`: String ('pending', 'completed')
*   `confidence_score`: Float (Mejor puntuación obtenida, ej: 95.5)
*   `last_practiced_at`: Datetime

### 2.6. Tabla: `practice_sessions`
Historial detallado de cada sesión (Para gráficas).
*   `id`: Integer (PK)
*   `user_id`: Integer (FK)
*   `module_id`: Integer (FK, Nullable)
*   `score`: Integer (0-100)
*   `accuracy`: Float
*   `duration_seconds`: Integer
*   `created_at`: Datetime

### 2.7. Tabla: `achievements`
Sistema de gamificación.
*   `id`: Integer (PK)
*   `slug`: String (Unique key, ej: 'module_master')
*   `title`: String
*   `description`: String
*   `condition_type`: String (ej: 'total_xp', 'modules_completed')
*   `condition_value`: Integer (Valor necesario para desbloquear)
*   `icon`: String

### 2.8. Tabla: `user_achievements`
Relación muchos a muchos para logros desbloqueados.
*   `user_id`: Integer (FK)
*   `achievement_id`: Integer (FK)
*   `earned_at`: Datetime

---

## 3. Arquitectura del Módulo de IA (Recognition Core)

El sistema de reconocimiento funcionará como un servicio inyectable.

### Flujo de Datos:
1.  **Input:** El frontend envía un frame de video (imagen base64) o un array de coordenadas (landmarks) al endpoint `/api/v1/predict`.
2.  **Procesamiento (Service Layer):**
    *   Si es imagen: **MediaPipe Hands** extrae los 21 puntos clave (x, y, z) de la mano.
    *   **Normalización:** Se ajustan las coordenadas relativizando al centro de la muñeca (para que la distancia a la cámara no afecte).
3.  **Inferencia:**
    *   El modelo entrenado (guardado como `.pkl` o `.h5`) recibe el vector de coordenadas.
    *   Retorna la clase probable (ej: "A") y la confianza (0.98).
4.  **Lógica de Negocio:**
    *   Si confianza > 85%, se considera "Válido".
    *   Si es un 'Comando' (Espacio/Borrar), se ejecuta la acción especial en la respuesta.

---

## 4. Estructura de Proyecto Definitiva

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py         # Login/Registro
│   │       │   ├── users.py        # Gestión de perfiles
│   │       │   ├── admin.py        # Settings globales y gestión usuarios
│   │       │   ├── modules.py      # CRUD de Módulos (Admin) & Lectura (User)
│   │       │   ├── progress.py     # Registro de avance y sesiones
│   │       │   └── recognition.py  # Endpoint de IA
│   │       └── api.py              # Router principal
│   ├── core/
│   │   ├── config.py               # Variables de entorno
│   │   └── security.py             # Hashes y Tokens JWT
│   ├── db/
│   │   ├── base.py                 # Imports de modelos
│   │   ├── session.py              # Conexión SQL
│   │   └── init_db.py              # Script de datos iniciales
│   ├── models/                     # Clases SQLAlchemy (Tablas)
│   ├── schemas/                    # Clases Pydantic (Validación I/O)
│   ├── services/
│   │   └── gesture_recognition/    # Módulo de I.A.
│   │       ├── model_loader.py     
│   │       └── predictor.py       
│   └── main.py                     # Punto de entrada
├── alembic/                        # Migraciones de base de datos
├── requirements.txt                # Dependencias
└── .env                            # Variables de entorno
```

## 5. Hoja de Ruta (Paso a Paso)

### **Fase 1: Cimientos (Infraestructura)**
1.  **Configuración de Entorno:** Crear `venv`, instalar FastAPI, SQLAlchemy, Alembic.
2.  **Base de Datos:** Configurar conexión a PostgreSQL y definir los modelos (Tablas) en código.
3.  **Migración Inicial:** Crear las tablas reales en la base de datos vacía.

### **Fase 2: Autenticación y Usuarios**
4.  **Sistema de Seguridad:** Implementar Hash de contraseñas y generación de Tokens JWT.
5.  **Endpoints Auth:** Crear `/login`, `/register` y `/me`.
6.  **Roles:** Asegurar que `super_admin` pueda crear `admins`.

### **Fase 3: Contenido y Progreso (La Escuela)**
7.  **CRUD de Módulos:** Endpoints para crear/leer módulos y elementos (señas).
8.  **Seed Data:** Llenar la BD con los módulos que ya tenemos en el frontend (Vocales, Números, etc.).
9.  **Sistema de Progreso:** Lograr que el frontend guarde "seña aprendida" en el backend.

### **Fase 4: Inteligencia Artificial (El Cerebro)**
10. **Integración MediaPipe:** Crear el servicio que recibe coordenadas y valida la mano.
11. **Modelo de Predicción:** Entrenar un modelo básico o implementar lógica de comparación de vectores.
12. **Endpoint `/predict`:** Conectar la cámara del frontend al backend.

### **Fase 5: Conexión Total**
13. **Integración Frontend-Backend:** Reemplazar los datos "mock" (falsos) del React por llamadas reales a la API.
