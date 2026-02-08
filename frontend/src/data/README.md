# Estructura de Datos del Sistema

## 📁 Archivos de Data

### 1. `users.js` - Datos de Perfil de Usuario
**Propósito:** Almacenar solo información del perfil y credenciales del usuario.

**Estructura:**
```javascript
{
  id: number,              // ID único del usuario
  name: string,            // Nombre completo
  email: string,           // Email (usado para login)
  password: string,        // Contraseña (hasheada en producción)
  dni: string,            // DNI/documento de identidad
  phone: string,          // Número de teléfono
  role: 'usuario' | 'admin', // Solo 2 roles permitidos
  avatar: string,         // Iniciales para avatar
  xp: number,             // Puntos de experiencia totales
  status: 'active' | 'inactive' | 'suspended', // Estado de la cuenta
  joinDate: string,       // Fecha de registro (ISO)
  lastLogin: string       // Última conexión (ISO)
}
```

**Funciones Helper:**
- `getRankByXP(xp)` - Calcula el rango basado en XP
- `getUserWithRank(userId)` - Obtiene usuario con su rango calculado

---

### 2. `userProgress.js` - Métricas y Progreso de Cursos
**Propósito:** Almacenar todas las estadísticas de aprendizaje y progreso en módulos.

**Estructura:**
```javascript
{
  userId: number,
  stats: {
    totalModulesCompleted: number,
    totalModulesInProgress: number,
    totalModulesPending: number,
    averageAccuracy: number,        // Porcentaje de precisión promedio
    totalTimeSpent: string,         // Formato: "Xh Ymin"
    currentStreak: number,          // Racha actual de días
    longestStreak: number,          // Racha más larga
    totalXP: number,                // XP total ganado
    globalRank: number,             // Posición en ranking global
    level: string                   // Nivel del usuario
  },
  modules: {
    [moduleId]: {
      moduleId: number,
      status: 'Completado' | 'En Progreso' | 'Pendiente',
      progress: number,              // 0-100
      attempts: number,
      bestScore: number,             // Mejor puntuación (0-100)
      averageScore: number,          // Puntuación promedio
      timeSpent: string,             // Tiempo dedicado al módulo
      lastActivity: string | null,   // Fecha ISO o null
      completedAt: string | null,    // Fecha de completado ISO o null
      xpEarned: number,              // XP ganado en este módulo
      sessions: [
        {
          date: string,              // Fecha ISO
          score: number,
          duration: string,
          accuracy: number
        }
      ]
    }
  }
}
```

**Funciones Helper:**
- `getUserModuleProgress(userId, moduleId)` - Obtiene progreso de un módulo específico
- `getUserStats(userId)` - Obtiene estadísticas generales del usuario
- `calculateXPReward(moduleId, scorePercentage, isFirstAttempt)` - Calcula XP a otorgar

---

## 🎯 Sistema de Rangos

| XP Mínimo | Rango | Tier | Color |
|-----------|-------|------|-------|
| 10,000+ | Maestro de Señas | Diamante | #60A5FA |
| 7,000+ | Experto Avanzado | Platino | #A78BFA |
| 5,000+ | Comunicador Experto | Oro | #FBBF24 |
| 3,000+ | Intérprete | Plata | #94A3B8 |
| 1,500+ | Aprendiz Avanzado | Bronce | #FB923C |
| 500+ | Estudiante | Hierro | #71717A |
| 0+ | Novato | Sin Rango | #52525B |

---

## ⚡ Sistema de XP

### XP Base por Módulo:
- Vocales: 500 XP
- Palabras: 550 XP
- Números: 500 XP
- Señas Matemáticas: 600 XP
- Abecedario: 700 XP (más complejo)
- Operaciones: 650 XP

### Multiplicadores:
- Por porcentaje de completado: `score% / 100`
- Primer intento exitoso: `+20%`
- Puntuación 90%+: `+10%`
- Puntuación 100%: `+20%` adicional

**Ejemplo:**
```javascript
// Módulo Vocales (500 XP base), score 95%, primer intento
// XP = 500 × (0.95) × 1.2 × 1.1 = 627 XP
```

---

## 🔄 Flujo de Datos

### Al iniciar sesión:
1. Obtener datos de usuario de `users.js` por email
2. Cargar progreso desde `userProgress.js` por userId
3. Calcular rango actual con `getRankByXP()`
4. Combinar datos para el dashboard

### Al completar un módulo:
1. Calcular XP ganado con `calculateXPReward()`
2. Actualizar `userProgress.js`:
   - Agregar nueva sesión
   - Actualizar `bestScore`, `averageScore`
   - Incrementar `attempts`
   - Actualizar `status` si corresponde
   - Sumar XP ganado
3. Actualizar `users.js`:
   - Incrementar `xp` total
   - Actualizar `lastLogin`
4. Recalcular rango

---

## 📊 Roles del Sistema

### Usuario (usuario)
- Permisos básicos
- Acceso a módulos de aprendizaje
- Ver su propio progreso
- Participar en ranking

### Administrador (admin)
- Todos los permisos de usuario
- Acceso al panel de administración
- Gestión de usuarios
- Gestión de contenido
- Ver estadísticas globales

---

## 🔐 Campos del Registro

Campos requeridos en el formulario de registro:
- `fullName` → `name`
- `dni` → `dni`
- `phone` → `phone`
- `email` → `email`
- `password` → `password` (hashear en backend)
- `confirmPassword` (solo validación, no se guarda)

Campos auto-generados:
- `id` → `Date.now()` o auto-increment en DB
- `role` → `'usuario'` por defecto
- `avatar` → Iniciales del nombre
- `xp` → `0`
- `status` → `'active'`
- `joinDate` → `new Date().toISOString()`
- `lastLogin` → `new Date().toISOString()`

---

## 🗄️ Preparación para Backend

### Tablas sugeridas:

**users**
- id (PK)
- name
- email (unique)
- password_hash
- dni
- phone
- role (enum: 'usuario', 'admin')
- avatar
- xp
- status
- join_date
- last_login

**user_progress_stats**
- id (PK)
- user_id (FK → users.id)
- total_modules_completed
- total_modules_in_progress
- total_modules_pending
- average_accuracy
- total_time_spent_minutes
- current_streak
- longest_streak
- global_rank
- level

**module_progress**
- id (PK)
- user_id (FK → users.id)
- module_id (FK → modules.id)
- status
- progress
- attempts
- best_score
- average_score
- time_spent_minutes
- last_activity
- completed_at
- xp_earned

**learning_sessions**
- id (PK)
- user_id (FK)
- module_id (FK)
- session_date
- score
- duration_minutes
- accuracy

---

## ✅ Validaciones

- Email debe ser único
- DNI debe ser único
- Contraseña mínimo 6 caracteres
- Rol solo acepta 'usuario' o 'admin'
- XP no puede ser negativo
- Progress debe estar entre 0-100
- Score debe estar entre 0-100
- Accuracy debe estar entre 0-100
