# ⚙️ Lenguaje de Señas IA — Backend

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square)](https://sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](../LICENSE)

API REST del sistema de aprendizaje de lenguaje de señas. Gestiona autenticación, módulos, progreso de usuarios, capturas de landmarks y el clasificador de gestos con IA.

---

## 📑 Tabla de contenidos

1. [Características principales](#-características-principales)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Estructura del proyecto](#-estructura-del-proyecto)
4. [Instalación y ejecución local](#-instalación-y-ejecución-local)
5. [Variables de entorno](#-variables-de-entorno)
6. [Endpoints de la API](#-endpoints-de-la-api)
7. [Base de datos y modelos](#-base-de-datos-y-modelos)
8. [Sistema de reconocimiento de gestos](#-sistema-de-reconocimiento-de-gestos)
9. [Autenticación y seguridad](#-autenticación-y-seguridad)
10. [Gestión de datos y backups](#-gestión-de-datos-y-backups)
11. [Deploy en Render](#-deploy-en-render)
12. [Problemas conocidos y soluciones](#-problemas-conocidos-y-soluciones)
13. [Contribuir](#-contribuir)

---

## ✨ Características principales

- 🔐 **Autenticación JWT** — Login con email/password y con Google OAuth. Tokens con expiración configurable.
- 📚 **Gestión de módulos y señas** — CRUD completo de módulos de aprendizaje y sus elementos (señas), con control de publicación y bloqueo.
- 📊 **Progreso y estadísticas** — Registro de sesiones de práctica, cálculo de XP, racha diaria, precisión global y ranking de usuarios.
- 🤖 **Clasificador de gestos con IA** — Recibe los 21 landmarks de una mano y predice la seña usando scikit-learn, comparando contra los datos reales capturados.
- 🖼️ **Captura de datasets** — Endpoint para guardar landmarks como dataset de entrenamiento directamente desde la interfaz del administrador.
- 🛡️ **Panel de administración** — Endpoints de análisis, gestión de usuarios, backups de la base de datos y configuración global del sistema.
- 📧 **Emails automáticos** — Envío de código de recuperación de contraseña y verificación de registro vía SMTP (Gmail).
- 🏆 **Sistema de logros** — Verifica y desbloquea logros automáticamente después de cada sesión de práctica.

---

## 🧱 Stack tecnológico

| Categoría | Librería | Versión | Uso |
|---|---|---|---|
| Framework | FastAPI | 0.109 | API REST con validación automática de tipos |
| Servidor | Uvicorn | 0.27 | Servidor ASGI para FastAPI |
| Producción | Gunicorn | 21.2 | Worker manager para deploy |
| ORM | SQLAlchemy | 2.0 | Mapeo de modelos a tablas de la DB |
| Migraciones | Alembic | 1.13 | Control de versiones del schema de la DB |
| Base de datos | PostgreSQL (Supabase) | — | DB principal en producción |
| Base de datos local | SQLite | — | DB en desarrollo (archivo `app.db`) |
| Validación | Pydantic v2 | 2.5 | Schemas de entrada/salida de la API |
| Auth JWT | python-jose | 3.3 | Generación y verificación de tokens JWT |
| Hashing | passlib + bcrypt | 1.7 | Hash seguro de contraseñas |
| Google OAuth | google-auth | 2.27 | Verificación de tokens de Google |
| IA / Clasificación | scikit-learn | 1.4 | Modelo de clasificación de gestos |
| Landmarks | MediaPipe | 0.10 | Procesamiento de puntos de la mano (server) |
| Numérico | NumPy | 1.26 | Transformaciones de datos para el clasificador |
| HTTP | requests | 2.31 | Llamadas a APIs de Google como fallback |
| SMTP | smtplib (stdlib) | — | Envío de emails de recuperación |

### ¿Por qué FastAPI?

FastAPI genera automáticamente la documentación Swagger en `/api/v1/openapi.json`, valida los cuerpos de petición con Pydantic, y tiene soporte nativo para async. En comparación con Flask, reduce drásticamente el boilerplate necesario para una API tipada.

### ¿Por qué scikit-learn y no deep learning?

Para el clasificador de señas, scikit-learn (K-Nearest Neighbors o SVM) es suficiente y mucho más rápido de entrenar y servir. El modelo recibe 21 puntos XYZ normalizados, no imágenes completas, lo que reduce enormemente la dimensionalidad del problema. Agregar TensorFlow añadiría 500MB+ de dependencias sin una mejora significativa para este caso de uso.

---

## 📁 Estructura del proyecto

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py                   # Dependencias compartidas: get_db, get_current_user, guards de rol
│   │   └── v1/
│   │       ├── api.py                # Router principal que agrupa todos los endpoints
│   │       └── endpoints/
│   │           ├── auth.py           # Login, registro, Google OAuth, recuperación de contraseña
│   │           ├── users.py          # CRUD de usuarios (admin)
│   │           ├── modules.py        # CRUD de módulos y elementos (señas)
│   │           ├── progress.py       # Estadísticas, ranking, sesiones de práctica
│   │           ├── recognition.py    # Predicción de señas con el clasificador IA
│   │           ├── admin_tools.py    # Analytics, capturas de datos, backups, configuración DB
│   │           ├── achievements.py   # Logros del usuario
│   │           ├── notifications.py  # Notificaciones
│   │           └── settings.py       # Configuración global del sistema
│   │
│   ├── core/
│   │   ├── config.py                 # Configuración central (lee desde .env con pydantic-settings)
│   │   └── security.py               # Hash de passwords, creación de JWT
│   │
│   ├── db/
│   │   ├── base_class.py             # Clase Base de SQLAlchemy con __tablename__ automático
│   │   ├── base.py                   # Importa todos los modelos para que Alembic los detecte
│   │   └── session.py                # Crea el engine y la sesión (SessionLocal)
│   │
│   ├── models/                       # Definición de tablas de la base de datos (SQLAlchemy ORM)
│   │   ├── user.py                   # Usuario: roles, XP, racha, 2FA, perfil
│   │   ├── content.py                # Module y Element (señas dentro de un módulo)
│   │   ├── progress.py               # UserProgress, UserModuleProgress, PracticeSession
│   │   ├── gamification.py           # Achievement y UserAchievement
│   │   ├── notification.py           # Notificaciones del usuario
│   │   ├── settings.py               # SystemSetting (clave-valor de configuración)
│   │   └── dataset.py                # HandCapture (landmarks guardados para entrenamiento)
│   │
│   ├── schemas/                      # Pydantic: validación de entrada y serialización de salida
│   │   ├── user.py                   # UserCreate, UserUpdate, User (response), GoogleLogin
│   │   ├── token.py                  # Token, TokenPayload
│   │   ├── content.py                # Module, Element y sus variantes Create/Update
│   │   ├── progress.py               # PracticeSession, DashboardStats, UserRanking
│   │   ├── recognition.py            # PredictionRequest (landmarks), PredictionResponse
│   │   ├── dataset.py                # HandCapture, HandCaptureCreate
│   │   ├── notification.py           # Notification, NotificationCreate
│   │   └── settings.py               # SystemSetting, SystemSettingUpdate
│   │
│   ├── services/
│   │   ├── achievement_service.py    # Lógica de desbloqueo de logros post-sesión
│   │   └── gesture_recognition/
│   │       ├── classifier.py         # GestureClassifier: carga del modelo y predicción
│   │       └── processor.py          # Normalización de landmarks antes de predecir
│   │
│   ├── utils/
│   │   ├── user.py                   # update_user_streak, validate_password_strength
│   │   ├── email.py                  # send_recovery_email, send_registration_verification_email
│   │   └── notifications.py          # notify_all_admins (helper para crear notificaciones)
│   │
│   └── main.py                       # Entry point: crea la app FastAPI, configura CORS y monta rutas
│
├── alembic/                          # Migraciones de base de datos
│   └── versions/                     # Archivos de migración generados automáticamente
├── alembic.ini                       # Configuración de Alembic
├── backups/                          # Copias de seguridad de la DB (generadas por el endpoint)
├── uploads/                          # Archivos subidos (imágenes de módulos/elementos)
├── app.db                            # Base de datos SQLite local (no subir a producción)
├── requirements.txt                  # Dependencias de Python
└── .env                              # Variables de entorno (no commitear)
```

---

## 🚀 Instalación y ejecución local

### Pre-requisitos

- **Python 3.11** — Recomendado. Usa `python --version` para verificar.
- Un archivo `.env` configurado (ver sección siguiente).

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Sebasguardia/LENGUAJE-SENAS.git
cd LENGUAJE-SENAS/backend

# 2. Crear y activar el entorno virtual
python -m venv venv

# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear el archivo .env (ver sección de variables de entorno)
# Copia el ejemplo y edita los valores
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac

# 5. Iniciar el servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

La API estará disponible en **http://127.0.0.1:8000**

La documentación interactiva (Swagger) estará en **http://127.0.0.1:8000/api/v1/openapi.json**

> **Nota sobre la base de datos:** En desarrollo se usa SQLite (`app.db`). No necesitas instalar PostgreSQL localmente. Para producción se usa Supabase; cambia el `DATABASE_URL` en el `.env`.

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la carpeta `backend/` con estas variables:

```env
# General
PROJECT_NAME="Lenguaje Senas Backend"
API_V1_STR="/api/v1"

# Base de datos
# Desarrollo (SQLite):
DATABASE_URL=sqlite:///./app.db
# Producción (PostgreSQL / Supabase):
# DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_db

# Seguridad JWT
SECRET_KEY=pon-una-clave-super-secreta-aqui-de-minimo-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 días

# Primer super admin (se crea automáticamente al iniciar si no existe)
FIRST_SUPERUSER=admin@tudominio.com
FIRST_SUPERUSER_PASSWORD=cambiar_en_produccion

# Google OAuth (obtén tu clientId en console.cloud.google.com)
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com

# SMTP para emails (ejemplo con Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_TLS=True
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-gmail  # Usar App Password, no tu contraseña real
EMAILS_FROM_EMAIL=tu-email@gmail.com
EMAILS_FROM_NAME="Instituto Señas IA"
```

> ⚠️ **Nunca commitees el `.env` real al repositorio.** Agrega `backend/.env` a tu `.gitignore`.

### Obtener App Password de Gmail

Para el SMTP, Gmail requiere una "App Password" (no tu contraseña normal):
1. Ve a tu cuenta de Google → Seguridad → Verificación en dos pasos (actívala si no está).
2. Busca "Contraseñas de aplicaciones".
3. Crea una para "Correo" → "Otro (nombre personalizado)".
4. Copia el password de 16 dígitos y úsalo en `SMTP_PASSWORD`.

---

## 🔌 Endpoints de la API

Todos los endpoints están bajo el prefijo `/api/v1`. Los endpoints marcados con 🔒 requieren JWT en el header `Authorization: Bearer <token>`.

### Auth — `/api/v1/auth`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/login/access-token` | Público | Login con email y password |
| POST | `/google` | Público | Login/registro con Google OAuth |
| POST | `/register` | Público | Crear nueva cuenta de usuario |
| GET | `/me` | 🔒 Usuario | Obtener perfil del usuario autenticado |
| POST | `/change-password` | 🔒 Usuario | Cambiar contraseña actual |
| POST | `/recovery/send` | Público | Enviar código de recuperación al email |
| POST | `/recovery/verify` | Público | Verificar código de recuperación |
| POST | `/recovery/reset` | Público | Resetear contraseña con el código |

### Módulos — `/api/v1/modules`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | 🔒 Usuario | Listar módulos activos con conteo de elementos y estado de bloqueo |
| GET | `/{slug}` | 🔒 Usuario | Detalle de un módulo con todos sus elementos |
| POST | `/` | 🔒 Super Admin | Crear nuevo módulo |
| PATCH | `/{module_id}` | 🔒 Super Admin | Actualizar módulo |
| DELETE | `/{module_id}` | 🔒 Super Admin | Eliminar módulo |
| POST | `/{module_id}/elements` | 🔒 Super Admin | Agregar seña a un módulo |
| PATCH | `/elements/{element_id}` | 🔒 Super Admin | Actualizar seña |
| DELETE | `/elements/{element_id}` | 🔒 Super Admin | Eliminar seña |

> Un módulo aparece como **bloqueado** (`is_locked: true`) si no está publicado, no tiene elementos, o alguno de sus elementos no tiene capturas de entrenamiento.

### Progreso — `/api/v1/progress`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/stats` | 🔒 Usuario | Dashboard stats: XP, racha, precisión global, módulos completados |
| GET | `/ranking` | 🔒 Usuario | Top N usuarios por XP |
| GET | `/history` | 🔒 Usuario | Historial de sesiones de práctica |
| POST | `/session` | 🔒 Usuario | Guardar resultado de una sesión de práctica |
| GET | `/module/{module_id}` | 🔒 Usuario | Progreso detallado en un módulo específico |

### Reconocimiento — `/api/v1/recognition`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/predict` | 🔒 Usuario | Recibe 21 landmarks y devuelve la seña predicha con porcentaje de confianza |

### Usuarios — `/api/v1/users`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | 🔒 Admin | Listar todos los usuarios |
| GET | `/{user_id}` | 🔒 Admin | Obtener usuario específico |
| POST | `/` | 🔒 Admin | Crear usuario manualmente |
| PATCH | `/{user_id}` | 🔒 Admin | Editar rol, estado, permisos |
| DELETE | `/{user_id}` | 🔒 Admin | Eliminar usuario |
| PATCH | `/me/update` | 🔒 Usuario | Actualizar propio perfil |

### Admin Tools — `/api/v1/admin`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/analytics/general-stats` | 🔒 Admin | Totales del sistema: usuarios, capturas, módulos |
| GET | `/analytics/data-distribution` | 🔒 Admin | Capturas por seña |
| GET | `/analytics/module-distribution` | 🔒 Admin | Capturas por módulo |
| GET | `/analytics/weekly-progress` | 🔒 Admin | Sesiones de práctica de los últimos 7 días |
| GET | `/analytics/top-students` | 🔒 Admin | Top 5 estudiantes por XP |
| GET | `/analytics/user-stats/{user_id}` | 🔒 Admin | Estadísticas detalladas de un usuario |
| POST | `/captures` | 🔒 Usuario | Guardar una captura de landmarks individual |
| POST | `/captures/batch` | 🔒 Usuario | Guardar múltiples capturas en una petición |
| DELETE | `/captures/reset/{element_id}` | 🔒 Admin | Borrar dataset de una seña para reentrenar |
| GET | `/database/stats` | 🔒 Admin | Estado y tamaño de las tablas de la DB |
| POST | `/database/backup` | 🔒 Admin | Crear copia de seguridad de la DB |
| GET | `/database/backups` | 🔒 Admin | Listar backups disponibles |
| GET | `/database/download/{filename}` | 🔒 Admin | Descargar un backup |

### Settings — `/api/v1/settings`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/` | 🔒 Admin | Ver configuración del sistema |
| PUT | `/` | 🔒 Admin | Actualizar configuración (mantenimiento, registro, nombre) |
| GET | `/public` | Público | Config pública: modo mantenimiento, nombre del sitio |

---

## 🗄️ Base de datos y modelos

### Motor de bases de datos

- **Desarrollo:** SQLite (archivo `app.db`). No requiere instalación adicional. Perfecto para hacer pruebas locales.
- **Producción:** PostgreSQL en Supabase. Solo cambia el `DATABASE_URL` en el `.env`.

El cambio entre un motor y otro es completamente transparente gracias a SQLAlchemy ORM.

### Modelos principales

#### `User`
```
id, full_name, email, hashed_password, role (user/admin/super_admin),
permissions (JSON), avatar_initials, xp, dni, phone, position,
status (active/inactive/banned), is_2fa_enabled, current_streak,
longest_streak, global_progress, global_precision, last_active_at,
recovery_code, recovery_code_expires, created_at
```

#### `Module` + `Element`
```
Module: id, slug, title, description, icon_name, difficulty,
        order_index, duration, tags, is_active, is_published
Element: id, module_id (FK), name, description, image_url, is_command
```
Un módulo tiene muchos elementos. Cada elemento es una seña (ej: letra "A", palabra "Hola").

#### `HandCapture`
```
id, element_id (FK), user_id (FK), landmarks (JSON — lista de 21 {x,y,z}),
image_url (opcional), created_at
```
Almacena los datos de entrenamiento capturados por los admins.

#### `PracticeSession`
```
id, user_id (FK), module_id (FK), score, accuracy,
duration_seconds, details (JSON), created_at
```
Registra cada vez que un usuario termina una sesión de práctica.

#### `UserModuleProgress`
```
id, user_id (FK), module_id (FK), progress (%), precision (%),
last_practiced_at
```
Tabla de persistencia del progreso por módulo.

### Migraciones con Alembic

```bash
# Ver estado de las migraciones
alembic current

# Crear una nueva migración (después de cambiar un modelo)
alembic revision --autogenerate -m "descripcion del cambio"

# Aplicar migraciones pendientes
alembic upgrade head

# Revertir la última migración
alembic downgrade -1
```

---

## 🤖 Sistema de reconocimiento de gestos

### Flujo completo

```
Frontend (cámara)
    ↓ 21 landmarks {x, y, z}
POST /api/v1/recognition/predict
    ↓
GestureClassifier.predict()
    ↓ Procesador normaliza los puntos
KNN / SVM (scikit-learn)
    ↓ Compara con capturas guardadas en DB
Respuesta: { prediction, confidence, is_valid, top_3 }
    ↓
Frontend muestra resultado al usuario
```

### `processor.py` — Normalización de landmarks

Antes de predecir, los 21 puntos se normalizan para que el modelo sea invariante a la posición y tamaño de la mano en la pantalla. Se resta la posición de la muñeca (punto 0) y se escala según la distancia máxima entre puntos.

### `classifier.py` — Predicción

El `GestureClassifier`:
1. Carga el modelo entrenado (si existe).
2. Puede filtrar por `module_slug` para comparar solo contra las señas del módulo activo.
3. Si se especifica `expected_label`, verifica si la predicción coincide con la seña esperada (modo práctica de módulo).
4. Devuelve la seña predicha, el porcentaje de confianza y el top 3 de candidatos.

Si no hay datos de entrenamiento suficientes, devuelve `is_valid: false` con un mensaje explicativo.

---

## 🔐 Autenticación y seguridad

### Flujo de JWT

1. El usuario hace login → el backend verifica password con bcrypt.
2. Se genera un JWT firmado con `SECRET_KEY` y con expiración configurable (`ACCESS_TOKEN_EXPIRE_MINUTES`).
3. El cliente guarda el token y lo envía en el header de cada petición: `Authorization: Bearer <token>`.
4. `deps.get_current_user()` decodifica el token, extrae el `sub` (user ID) y consulta el usuario en DB.

### Guards de rol en `deps.py`

```python
get_current_user()              # Requiere token válido, usuario activo
get_current_active_admin()      # Requiere rol: admin, super_admin
get_current_active_superuser()  # Requiere rol: super_admin
```

### Google OAuth

El endpoint `POST /auth/google` recibe el token de Google (ID Token o Access Token):
1. Primero intenta verificar como **ID Token** usando `google.oauth2.id_token.verify_oauth2_token()`.
2. Si falla (por ejemplo si el frontend envía un Access Token), usa como **fallback** la API de Google `userinfo` con el token como Bearer.
3. Con el email obtenido, busca el usuario en la DB o lo crea si es nuevo.
4. Devuelve el JWT propio de la app.

### Recuperación de contraseña

1. El usuario solicita un código → se genera un código aleatorio de 8 dígitos.
2. Se guarda en `User.recovery_code` con expiración de 30 minutos.
3. Se envía al email del usuario vía SMTP.
4. El usuario verifica el código y puede resetear su contraseña.

---

## 💾 Gestión de datos y backups

### Backups automáticos

El endpoint `POST /api/v1/admin/database/backup` copia el archivo `app.db` a la carpeta `backups/` con timestamp. Ideal para SQLite en desarrollo.

Para PostgreSQL en producción, este endpoint no aplica directamente. Se recomienda usar las herramientas de backup de Supabase o pg_dump en un cronjob.

### Archivos estáticos

La carpeta `uploads/` está montada como ruta estática en FastAPI. Las imágenes subidas para módulos o elementos se sirven directamente desde `http://tu-backend.com/uploads/nombre-del-archivo`.

```python
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

---

## 🚀 Deploy en Render

### Pasos

1. Crea un nuevo **Web Service** en [render.com](https://render.com).
2. Conecta tu repositorio de GitHub.
3. Configura el servicio:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
4. Agrega las variables de entorno en el panel de Render (las mismas del `.env`, pero con los valores de producción).
5. Asegúrate de que `DATABASE_URL` apunte a tu base de datos de producción (Supabase).

### CORS en producción

En `app/main.py`, agrega el dominio de tu frontend de Vercel a la lista `origins`:

```python
origins = [
    "https://tu-app.vercel.app",
    "http://localhost:5173",  # mantener para desarrollo
]
```

### Variable `PORT` en Render

Render inyecta automáticamente la variable de entorno `PORT`. El comando con Gunicorn ya la usa con `--bind 0.0.0.0:$PORT`.

---

## 🐛 Problemas conocidos y soluciones

### `AttributeError: module 'app.schemas' has no attribute 'Token'`
Ocurre cuando los archivos `__init__.py` de `schemas/` o `models/` no exportan todas las clases. Verifica que `backend/app/schemas/__init__.py` tenga un `from .token import Token, TokenPayload` y similares para todos los módulos.

### `ImportError: cannot import name 'X' from 'app.models.Y'`
El nombre exportado no existe en el archivo fuente. Revisa el archivo de modelos/schemas correspondiente y ajusta las importaciones en el `__init__.py`.
- [x] Corregir errores de importación en el Editor (__init__.py)
- [ ] Corregir contraste en el modal de detalles de usuario (`UserManagement.jsx`)

### El servidor se reinicia en bucle sin levantar
Uvicorn detecta cambios en los `__init__.py` y recarga, pero si hay un error de importación, el proceso hijo crashea y el reloader lo vuelve a intentar. El output del error aparece en el terminal. Léelo con atención: siempre indica el archivo y línea exacta del problema.

### Error de conexión a la base de datos en producción
Verifica que la variable `DATABASE_URL` en Render sea correcta y que la IP del servidor de Render esté en la lista de IPs permitidas en Supabase (o que hayas habilitado acceso desde cualquier IP en el proyecto de Supabase).

### Los emails de recuperación no llegan
- Verifica que `SMTP_USER` y `SMTP_PASSWORD` sean correctos.
- Asegúrate de usar un **App Password** de Gmail, no tu contraseña normal.
- Revisa que la verificación en 2 pasos esté activada en la cuenta de Gmail.
- Revisa la carpeta de spam del destinatario.

### El clasificador devuelve `is_valid: false` siempre
Significa que no hay suficientes capturas de entrenamiento en la base de datos, o el modelo no se ha reconstruido con los nuevos datos. Agrega más capturas desde el panel de admin → Captura de datos.

---

## 🤝 Contribuir

1. **Fork** el repositorio.
2. Crea una rama:
   ```bash
   git checkout -b feature/nombre-del-cambio
   ```
3. Haz tus cambios. Si modificas modelos, crea una migración:
   ```bash
   alembic revision --autogenerate -m "descripcion"
   alembic upgrade head
   ```
4. Verifica que el servidor inicie sin errores:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. Commit y Pull Request:
   ```bash
   git commit -m "feat: descripción clara del cambio"
   ```

### Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad o endpoint |
| `fix:` | Corrección de bug |
| `refactor:` | Mejora de código sin cambiar funcionalidad |
| `db:` | Cambios en modelos o migraciones |
| `docs:` | Cambios en documentación |
| `security:` | Cambios que afectan autenticación o permisos |

---

## 📄 Licencia

MIT — libre de usar, modificar y distribuir con atribución.
