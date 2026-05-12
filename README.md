<div align="center">

# 🤟 Lenguaje de Señas IA

**Plataforma educativa con reconocimiento de lenguaje de señas en tiempo real usando Inteligencia Artificial**

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-learn" />
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge" alt="SQLAlchemy" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/MediaPipe-Hands-005CE6?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT" />
</p>

</div>

---

> 💡 **Nota:** Este repositorio es un **monorepo** que contiene tanto el código del **Frontend** (interfaz de usuario) como del **Backend** (API y modelos de IA).

## 📑 Tabla de contenidos

1. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
2. [Características Globales](#-características-globales)
3. [Estructura del Repositorio](#-estructura-del-repositorio)
4. [Instalación y Ejecución Rápida](#-instalación-y-ejecución-rápida)
5. [Roles y Permisos](#-roles-y-permisos)
6. [Enlaces de Documentación](#-enlaces-de-documentación)

---

## 🏗️ Arquitectura del Proyecto

El sistema está dividido en dos grandes componentes que se comunican de forma asíncrona mediante una **API REST**:

### 🎨 1. Frontend (Cliente de Interfaz y Captura)
Diseñado para ofrecer una experiencia fluida e inmersiva. Utiliza **MediaPipe Hands** en el navegador del cliente para capturar los movimientos de las manos.
- **Flujo:** Extrae 21 puntos clave (landmarks) de la mano en tiempo real (manteniendo 30+ FPS) y los envía al backend para su evaluación. No envía video puro, reduciendo drásticamente la latencia.

### 🧠 2. Backend (API y Clasificador IA)
El cerebro del sistema. Gestiona la lógica de negocio y contiene el motor de predicción basado en **scikit-learn** (KNN/SVM).
- **Flujo:** Recibe los puntos normalizados, los compara con los datos previamente entrenados y clasifica qué seña está realizando el usuario, devolviendo un porcentaje de confianza.

---

## ✨ Características Globales

| Característica | Descripción |
| :--- | :--- |
| 🎯 **Reconocimiento en tiempo real** | Inferencia súper rápida combinando extracción en cliente (MediaPipe) y clasificación en servidor (Scikit-Learn). |
| 📚 **Aprendizaje por módulos** | Contenido estructurado (Vocales, Saludos, etc.) con progresión guiada y bloqueo por dificultad. |
| 🏆 **Gamificación Integrada** | Puntos de experiencia (XP), rachas diarias, ranking global de estudiantes y logros desbloqueables con animaciones impactantes. |
| 🛡️ **Panel de Administración** | CMS completo para crear módulos, gestionar usuarios y capturar de forma visual **nuevos datos de entrenamiento** para la IA directamente desde el navegador. |
| 🎮 **Modo Demo Resiliente** | Sistema fallback que intercepta peticiones caídas y activa datos simulados permitiendo explorar la interfaz de lectura completa aunque el backend esté apagado. |
| 🔐 **Seguridad y Accesibilidad** | Autenticación con JWT, soporte para **Google OAuth**, recuperación por correo (SMTP) y soporte nativo para Tema Oscuro/Claro. |

---

## 📁 Estructura del Repositorio

```text
LENGUAJE-SENAS/
├── backend/                  # 🧠 Servidor FastAPI y modelos IA
│   ├── app/                  # Código fuente (routers, models, schemas)
│   ├── app.db                # Base de datos local
│   ├── requirements.txt      # Dependencias de Python
│   └── README.md             # Documentación detallada del backend
│
├── frontend/                 # 🎨 Aplicación SPA en React + Vite
│   ├── src/                  # Componentes, servicios, vistas
│   ├── package.json          # Dependencias de Node.js
│   └── README.md             # Documentación detallada del frontend
│
└── README.md                 # 📍 Esta documentación global
```

---

## 🚀 Instalación y Ejecución Rápida

Para correr el proyecto completo en tu entorno local, necesitarás iniciar ambos servicios simultáneamente en dos terminales distintas.

### 📋 Pre-requisitos
- **Node.js** v18 o superior.
- **Python** v3.11 o superior.
- **Git**.

### 1️⃣ Clonar el proyecto
```bash
git clone https://github.com/Sebasguardia/LENGUAJE-SENAS.git
cd LENGUAJE-SENAS
```

### 2️⃣ Levantar el Backend (Terminal 1)
```bash
cd backend
python -m venv venv

# Activar entorno virtual
# En Windows: venv\Scripts\activate
# En Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # Edita tu .env según necesites
uvicorn app.main:app --reload --port 8000
```
> 🌐 La API estará disponible en `http://127.0.0.1:8000`

### 3️⃣ Levantar el Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
> 🎨 La aplicación web estará disponible en `http://localhost:5173`. 
> *Nota: Vite está configurado para proxear automáticamente las llamadas al backend local.*

---

## 👥 Roles y Permisos

El sistema contempla 3 niveles de acceso protegidos mediante guards y dependencias en ambos lados:

- 👤 **Usuario Estudiante:** Acceso al dashboard, práctica libre, módulos interactivos y perfil con historial de sesiones.
- 🧑‍💼 **Admin:** Acceso al panel de control `/admin`, permisos para crear/editar módulos, ver métricas generales y capturar landmarks para entrenamiento.
- 👑 **Super Admin:** Todos los permisos anteriores más gestión de configuración del sitio, control de roles de otros usuarios y backups de la base de datos.

---

## 📖 Enlaces de Documentación

¿Buscas profundizar en cómo funciona cada componente bajo el capó? Revisa nuestras documentaciones detalladas por subproyecto:

<div align="center">

[![Frontend Docs](https://img.shields.io/badge/Leer_Docs_del_Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](./frontend/README.md)
[![Backend Docs](https://img.shields.io/badge/Leer_Docs_del_Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](./backend/README.md)

</div>

---

<div align="center">
  Hecho con 💜 para el aprendizaje de lenguaje de señas.
</div>
