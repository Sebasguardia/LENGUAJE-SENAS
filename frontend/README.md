# 🤟 Lenguaje de Señas IA — Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=flat-square)](https://gsap.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](../LICENSE)

Interfaz web de la plataforma de aprendizaje de lenguaje de señas con reconocimiento de manos en tiempo real usando IA y MediaPipe.

---

## 📑 Tabla de contenidos

1. [Características principales](#-características-principales)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Estructura del proyecto](#-estructura-del-proyecto)
4. [Instalación y ejecución local](#-instalación-y-ejecución-local)
5. [Variables de entorno y configuración](#️-variables-de-entorno-y-configuración)
6. [Rutas de la aplicación](#️-rutas-de-la-aplicación)
7. [Sistema de autenticación](#-sistema-de-autenticación)
8. [Reconocimiento con MediaPipe](#-reconocimiento-con-mediapipe)
9. [Capa de API y servicios](#-capa-de-api-y-servicios)
10. [Sistema de gamificación](#-sistema-de-gamificación)
11. [Panel de administración](#-panel-de-administración)
12. [Comandos útiles](#-comandos-útiles)
13. [Problemas conocidos y soluciones](#-problemas-conocidos-y-soluciones)
14. [Deploy en Vercel](#-deploy-en-vercel)
15. [Contribuir](#-contribuir)

---

## ✨ Características principales

- 🎯 **Reconocimiento en tiempo real** — Detecta señas usando la cámara y MediaPipe Hands (21 landmarks por mano). Los resultados se envían al backend que devuelve la predicción de la seña con un porcentaje de confianza.
- 📚 **Módulos de aprendizaje** — El contenido está organizado en módulos (ej: Vocales, Saludos, Números). Cada módulo tiene elementos/señas que el usuario practica. El sistema registra el progreso y la precisión por módulo.
- 🏆 **Gamificación** — Sistema de XP, racha diaria, logros desbloqueables y ranking global entre usuarios.
- 🌗 **Modo oscuro / claro** — Tema persistente con `ThemeContext`. El diseño está construido pensando en ambos modos; no es solo un cambio de color de fondo.
- 🔒 **Rutas protegidas** — Guards por rol: usuario normal, admin y super admin. Un admin no puede entrar al dashboard de usuario y viceversa.
- 🔑 **Google OAuth** — Login con cuenta de Google integrado mediante `@react-oauth/google`.
- 🛡️ **Panel de administrador** — Gestión completa de usuarios, módulos, capturas de datos para entrenamiento de IA, y configuración global del sistema.
- ⚡ **Carga optimizada** — Lazy loading de todas las vistas y prefetch de datos críticos al iniciar sesión para que el dashboard cargue casi instantáneamente.

---

## 🧱 Stack tecnológico

| Categoría | Librería | Versión | Uso |
|---|---|---|---|
| Framework | React | 19 | Base de la SPA y gestión de estado |
| Build tool | Vite | 7 | Servidor de desarrollo + bundler |
| Estilos | Tailwind CSS | 3.4 | Utilidades CSS para diseño responsive |
| Animaciones | GSAP + ScrollTrigger | 3 | Animaciones orquestadas en landing y dashboard |
| Animaciones | Framer Motion | 12 | Transiciones de entrada/salida de componentes |
| Routing | React Router DOM | 6 | Navegación SPA con lazy loading |
| HTTP | Axios | 1.x | Peticiones al backend con interceptores |
| IA visual | MediaPipe Hands | 0.4 | Detección de 21 landmarks de la mano |
| Gráficas | Recharts | 3 | Estadísticas de progreso y precisión |
| UI Icons | Lucide React | 0.54 | Iconografía consistente |
| Notificaciones | React Hot Toast | 2.6 | Feedback de acciones al usuario |
| Auth Google | @react-oauth/google | 0.13 | OAuth 2.0 con Google |

### ¿Por qué Vite y no CRA?

Vite utiliza ES modules nativos en desarrollo, lo que hace que los cambios se reflejen casi instantáneamente (HMR). En producción, usa Rollup para generar bundles optimizados con code splitting automático, algo clave dado el tamaño de MediaPipe (~2MB).

### ¿Por qué GSAP y Framer Motion juntos?

Tienen propósitos distintos. **GSAP** se usa para animaciones complejas de scroll (landing page, entrada de secciones) porque ofrece más control y mejor rendimiento en animaciones basadas en timeline. **Framer Motion** se usa para las transiciones de componentes React (modales, tarjetas) porque su API es declarativa y se integra naturalmente con el ciclo de vida de React.

---

## 📁 Estructura del proyecto

```
frontend/
├── src/
│   ├── api/                     # Capa de servicios HTTP
│   │   ├── apiClient.js         # Instancia Axios con interceptores de auth
│   │   ├── authService.js       # Login, registro, perfil, recuperación de contraseña
│   │   ├── moduleService.js     # Obtener módulos y detalle por slug
│   │   ├── progressService.js   # Stats del dashboard, ranking, historial de sesiones
│   │   ├── adminService.js      # Gestión de usuarios, módulos y configuración
│   │   ├── recognitionService.js# Enviar landmarks al backend para predicción
│   │   ├── notificationService.js# Notificaciones del usuario
│   │   └── achievementService.js # Logros
│   │
│   ├── components/
│   │   ├── landing/             # Secciones del landing page (Hero, Features, Footer, etc.)
│   │   ├── dashboard/           # Header, HeroVisual, ChatWidget, Footer del dashboard
│   │   ├── admin/               # Panels de gestión: usuarios, módulos, capturas, config
│   │   ├── auth/                # AuthLayout y RegistrationForm
│   │   └── common/              # AchievementToast y otros elementos reutilizables
│   │
│   ├── context/
│   │   └── ThemeContext.jsx     # Provider global del tema (dark/light)
│   │
│   ├── page/                    # Una vista por archivo, mapeadas a las rutas
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PracticeMode.jsx
│   │   ├── ModuleLearning.jsx
│   │   ├── UserProfile.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── PasswordChange.jsx
│   │
│   ├── utils/
│   │   └── authStorage.js       # Abstracción de localStorage/sessionStorage para auth
│   │
│   ├── data/
│   │   ├── achievements.js      # Definición de logros y función checkNewAchievements
│   │   └── userProgress.js      # Lectura de progreso local del usuario
│   │
│   ├── App.jsx                  # Rutas, guards y configuración global de la app
│   ├── main.jsx                 # Entry point, monta App en el DOM
│   └── index.css                # Estilos globales y directivas de Tailwind
│
├── public/                      # Archivos estáticos servidos directamente
├── vercel.json                  # Rewrite rules para el SPA en Vercel
├── vite.config.js               # Configuración del bundler y proxy de desarrollo
├── tailwind.config.js           # Configuración de Tailwind
└── package.json
```

---

## 🚀 Instalación y ejecución local

### Pre-requisitos

- **Node.js 18+** — Puedes descargarlo desde [nodejs.org](https://nodejs.org)
- **Backend corriendo** en `http://127.0.0.1:8000` (ver `README.md` del backend)
- Git instalado

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Sebasguardia/LENGUAJE-SENAS.git

# 2. Entrar a la carpeta del frontend
cd LENGUAJE-SENAS/frontend

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app estará disponible en **http://localhost:5173**

> **Proxy automático:** Vite redirige todas las peticiones a `/api/*` al backend en `http://127.0.0.1:8000`. No necesitas tocar CORS ni configurar nada adicional en desarrollo.

### Primer uso

1. Asegúrate de que el backend esté corriendo y tenga la base de datos inicializada.
2. Crea una cuenta desde `/register` o usa las credenciales de super admin que configuraste en el backend.
3. Los admins son redirigidos automáticamente a `/admin` al hacer login.

---

## ⚙️ Variables de entorno y configuración

El frontend **no requiere un archivo `.env`** para desarrollo local. La configuración del proxy es suficiente:

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
```

### Para producción (Vercel)

En producción, el frontend llama directamente a la URL del backend desplegado en Render (u otro servicio). Si necesitas cambiar esto, modifica la `baseURL` en `src/api/apiClient.js`:

```js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});
```

También puedes agregar una variable de Vercel:
```
VITE_API_URL=https://tu-backend.onrender.com/api/v1
```

### Google OAuth

Para que el login con Google funcione necesitas un `clientId`. Búscalo en el componente de Login y reemplázalo con el tuyo desde [console.cloud.google.com](https://console.cloud.google.com). Agrega `http://localhost:5173` como origen autorizado en desarrollo.

---

## 🗺️ Rutas de la aplicación

| Ruta | Vista | Acceso | Descripción |
|---|---|---|---|
| `/` | Landing | Público | Página principal con info del producto |
| `/login` | Login | Público | Email/password + Google OAuth |
| `/register` | Register | Público | Registro de nueva cuenta |
| `/forgot-password` | ForgotPassword | Público | Recuperación por código de email |
| `/change-password` | PasswordChange | 🔒 Usuario | Cambio de contraseña obligatorio si el admin lo requiere |
| `/dashboard` | Dashboard | 🔒 Usuario | Módulos, estadísticas, ranking y actividad |
| `/practice` | PracticeMode | 🔒 Usuario | Práctica libre con la cámara y el modelo de IA |
| `/module/:moduleId` | ModuleLearning | 🔒 Usuario | Lección de un módulo específico (por slug) |
| `/profile` | UserProfile | 🔒 Usuario | Perfil, estadísticas personales y configuración |
| `/admin` | AdminDashboard | 🔒 Admin | Panel de gestión completo |
| `*` | Redirect | — | Cualquier ruta desconocida redirige a `/` |

### Guards de ruta

- **`ProtectedRoute`** — Si no hay token, redirige a `/login`. Si el usuario es admin, redirige a `/admin` (para que no acceda al dashboard de estudiante).
- **`AdminRoute`** — Si no hay token, redirige a `/login`. Si el rol no es admin/super_admin, redirige a `/dashboard`.

---

## 🔐 Sistema de autenticación

### Flujo de login

1. El usuario ingresa credenciales en `/login`.
2. El frontend llama a `authService.login()` → `POST /api/v1/auth/login/access-token`.
3. El backend devuelve un JWT.
4. `authStorage.js` guarda el token en `localStorage` o `sessionStorage` según el modo.
5. Se dispara el evento `login-success` para que la app haga prefetch de datos.
6. El usuario es redirigido a `/dashboard` o `/admin` según su rol.

### `authStorage.js`

Centraliza el manejo del token y los datos del usuario:

```js
// Guardar token (con "recordarme" usa localStorage, sino sessionStorage)
authStorage.setToken(token, rememberMe)

// Leer token desde cualquiera de los dos storages
authStorage.getToken()

// Datos del usuario
authStorage.setUser(userData)
authStorage.getUser()

// Cerrar sesión (limpia ambos storages)
authStorage.clear()
```

### `apiClient.js` — Interceptores

- **Request interceptor:** Adjunta automáticamente el Bearer token a cada petición.
- **Response interceptor:** Si el backend responde `401 Unauthorized`, limpia el storage y dispara el evento global `unauthorized`, que redirige al login desde `App.jsx`.

```js
apiClient.interceptors.request.use(config => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Google OAuth

El componente de login usa `@react-oauth/google`. Al hacer clic en "Continuar con Google", se obtiene un `credential` (ID Token de Google) que se envía al backend vía `POST /api/v1/auth/google`. El backend lo verifica con las APIs de Google y devuelve el JWT de la app.

---

## 🤖 Reconocimiento con MediaPipe

### ¿Cómo funciona?

1. Se activa la cámara del usuario en `PracticeMode.jsx` o `ModuleLearning.jsx`.
2. **MediaPipe Hands** procesa cada frame del video y devuelve las coordenadas de **21 puntos (landmarks)** de la mano en formato `{x, y, z}`.
3. Estos landmarks se envían al backend vía `recognitionService.predict(landmarks)`.
4. El backend ejecuta el modelo de ML y responde con la seña predicha y el porcentaje de confianza.
5. El frontend muestra el resultado en tiempo real al usuario.

### Landmarks de la mano

MediaPipe retorna 21 puntos que representan articulaciones de la mano:

```
0: Muñeca
1-4: Pulgar (base → punta)
5-8: Índice (base → punta)
9-12: Medio (base → punta)
13-16: Anular (base → punta)
17-20: Meñique (base → punta)
```

### Consideraciones de rendimiento

- MediaPipe corre en el hilo principal del navegador. Para mantener 30+ FPS se usa `requestAnimationFrame` con control de tiempo para no procesar más de lo necesario.
- El modelo se inicializa una sola vez al montar el componente. Si el componente se desmonta, se libera la cámara.
- Requiere contexto seguro: **solo funciona en `https://` o `localhost`**.

---

## 🔌 Capa de API y servicios

Toda la comunicación con el backend está centralizada en `src/api/`. Los componentes **nunca usan Axios directamente**; siempre pasan por un servicio.

### `authService`
```js
authService.login(email, password)      // POST /auth/login/access-token
authService.register(userData)          // POST /auth/register
authService.getMe()                     // GET  /auth/me
authService.googleLogin(credential)     // POST /auth/google
authService.sendRecoveryCode(email)     // POST /auth/recovery/send
authService.resetPassword(data)         // POST /auth/recovery/reset
```

### `moduleService`
```js
moduleService.getModules()              // GET /modules/ — lista completa
moduleService.getModuleBySlug(slug)     // GET /modules/{slug} — detalle con elementos
```

### `progressService`
```js
progressService.getDashboardStats()     // GET /progress/stats — XP, racha, precisión global
progressService.getRanking(limit)       // GET /progress/ranking — top N usuarios
progressService.getHistory(limit)       // GET /progress/history — sesiones pasadas
progressService.saveSession(data)       // POST /progress/session — guardar sesión al terminar
```

### `adminService`
```js
adminService.getUsers()                 // GET /users/
adminService.updateUser(id, data)       // PATCH /users/{id}
adminService.getSettings()             // GET /settings/
adminService.updateSettings(settings)  // PUT /settings/
adminService.getPublicSettings()       // GET /settings/public
```

---

## 🏆 Sistema de gamificación

El sistema de logros y progreso está diseñado para mantener la motivación del usuario.

### XP (Puntos de experiencia)
- Cada sesión de práctica completada otorga XP según la precisión y duración.
- El XP acumulado define el rango del usuario en el ranking global.

### Racha diaria (Streak)
- Si el usuario practica al menos una vez al día, su racha aumenta.
- Si falla un día, la racha se reinicia.
- La racha se muestra en el dashboard como un indicador de consistencia.

### Logros
- Definidos en `src/data/achievements.js` como un array de objetos con condiciones.
- La función `checkNewAchievements(stats)` compara el progreso actual contra las condiciones.
- Si se desbloquea uno nuevo, aparece un toast personalizado (`AchievementToast`) en la esquina inferior derecha.

### Ranking global
- Muestra los usuarios con más XP.
- Se puede ver el top 5 en el dashboard y la posición completa en el modal de ranking.

---

## 🛡️ Panel de administración

Accesible solo para usuarios con rol `admin` o `super_admin`.

### Secciones disponibles

| Sección | Descripción |
|---|---|
| **Usuarios** | Ver, editar rol, activar/desactivar cuentas |
| **Módulos** | Crear, editar y publicar módulos y sus señas (elementos) |
| **Captura de datos** | Herramienta para capturar landmarks de señas y armar el dataset de entrenamiento |
| **Configuración** | Nombre del sitio, modo mantenimiento, registro público activado/desactivado |
| **Notificaciones** | Enviar notificaciones a usuarios |

### Diferencia de roles

- **`admin`** — Acceso al panel, puede gestionar usuarios y módulos.
- **`super_admin`** — Todo lo anterior más creación de módulos y acceso a configuraciones críticas del sistema.

---

## 🎨 Sistema de diseño

El diseño sigue principios consistentes en toda la app:

- **Tipografía:** `font-black` con `tracking-tighter` para títulos de impacto. Texto informativo en `font-medium`.
- **Colores:** Paleta basada en `slate` para fondos y texto, `blue-600` como color primario de acción.
- **Glassmorphism:** `backdrop-blur` + bordes `white/10` para dar profundidad a los cards.
- **Modo oscuro:** `dark:bg-[#05070a]` como fondo principal. Modo claro con `bg-slate-50`.
- **Responsivo:** Mobile-first. Los grids pasan de 1 columna en móvil a 2 o 3 en desktop.
- **Animaciones:** Entradas suaves con GSAP al cargar vistas. Hover effects en todos los elementos interactivos.

---

## 🔧 Comandos útiles

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con Hot Module Replacement
npm run dev

# Build de producción (output en /dist)
npm run build

# Previsualizar el build localmente antes de subir
npm run preview

# Revisar errores de código con ESLint
npm run lint
```

---

## 🐛 Problemas conocidos y soluciones

### Los módulos no aparecen en el Dashboard
Generalmente indica que el **backend no está corriendo** o crasheó por un error de importación Python. Verifica:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
Si hay un `AttributeError` o `ImportError` en los logs, revisa el README del backend para la guía de solución.

### Error 404 al recargar la página en Vercel
Resuelto con el archivo `frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Si haces deploy en otro servicio (Netlify, etc.), configura una regla equivalente de SPA redirect.

### La cámara no se activa en Practice Mode
- Asegúrate de que el navegador tenga **permisos de cámara** habilitados.
- MediaPipe requiere un contexto seguro. Usa `https://` en producción o `localhost` en desarrollo. La IP `127.0.0.1` también funciona.
- En algunos navegadores mobile el acceso a la cámara puede estar restringido por configuración del sistema.

### Google OAuth no funciona en local
- Agrega `http://localhost:5173` como **Origen autorizado** en tu proyecto de [Google Cloud Console](https://console.cloud.google.com).
- Verifica que el `clientId` en el componente de login sea el correcto.
- En producción, agrega también la URL de Vercel a los orígenes autorizados.

### El backend responde 401 después de un rato
El JWT tiene un tiempo de expiración. Si el token expiró, `apiClient.js` limpia el storage y redirige al login automáticamente. Si esto ocurre con mucha frecuencia, aumenta el `ACCESS_TOKEN_EXPIRE_MINUTES` en la configuración del backend.

### La app muestra "Modo Mantenimiento"
Un admin activó el modo mantenimiento desde el panel. Para desactivarlo, accede con una cuenta admin y ve a `Configuración → Modo mantenimiento → Desactivar`.

---

## 🌐 Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio de GitHub.
2. Configura el proyecto:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Si tu backend está en Render u otra URL, agrega la variable de entorno:
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api/v1
   ```
4. El archivo `vercel.json` ya está incluido y maneja el routing del SPA.
5. Haz deploy. Vercel se encarga del resto.

> **Nota:** Configura los **CORS** del backend para permitir el dominio de Vercel (`https://tu-app.vercel.app`).

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. **Fork** el repositorio.
2. Crea una rama descriptiva:
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   # o para bugs:
   git checkout -b fix/descripcion-del-bug
   ```
3. Haz tus cambios y verifica que no rompas nada:
   ```bash
   npm run lint
   npm run build
   ```
4. Commit con un mensaje claro:
   ```bash
   git commit -m "feat: agregar soporte para reconocimiento de ambas manos"
   ```
5. Push y abre un **Pull Request** describiendo qué cambiaste y por qué.

### Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `style:` | Cambios de estilos/UI |
| `refactor:` | Mejora de código sin cambiar funcionalidad |
| `docs:` | Cambios en documentación |

---

## 📄 Licencia

MIT — libre de usar, modificar y distribuir con atribución.
