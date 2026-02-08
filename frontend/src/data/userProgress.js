// Progreso y métricas de cada usuario en los módulos
// Este archivo contiene TODAS las estadísticas de aprendizaje

export const userProgressData = {
    // Usuario 1: María González
    1: {
        userId: 1,
        // Estadísticas globales
        stats: {
            totalModulesCompleted: 2,
            totalModulesInProgress: 2,
            totalModulesPending: 2,
            averageAccuracy: 94,
            totalTimeSpent: '7h 15min',
            currentStreak: 15,
            longestStreak: 20,
            totalXP: 3850,
            globalRank: 4,
            level: 'Intermedio',
        },
        // Progreso por módulo
        modules: {
            1: { // Vocales
                moduleId: 1,
                status: 'Completado',
                progress: 100,
                attempts: 5,
                bestScore: 98,
                averageScore: 96,
                timeSpent: '2h 30min',
                lastActivity: '2024-01-24T15:30:00',
                completedAt: '2024-01-24T15:30:00',
                xpEarned: 500,
                // Progreso de cada elemento individual (A, E, I, O, U)
                elements: {
                    0: 98, // A
                    1: 95, // E
                    2: 100, // I
                    3: 92, // O
                    4: 96  // U
                },
                sessions: [
                    { date: '2024-01-20T10:00:00', score: 85, duration: '15min', accuracy: 85 },
                    { date: '2024-01-22T11:30:00', score: 95, duration: '20min', accuracy: 95 },
                    { date: '2024-01-24T15:30:00', score: 98, duration: '10min', accuracy: 98 },
                ]
            },
            2: { // Palabras
                moduleId: 2,
                status: 'Completado',
                progress: 100,
                attempts: 4,
                bestScore: 95,
                averageScore: 92,
                timeSpent: '2h 45min',
                lastActivity: '2024-01-23T18:20:00',
                completedAt: '2024-01-23T18:20:00',
                xpEarned: 550,
                sessions: [
                    { date: '2024-01-18T09:00:00', score: 80, duration: '12min', accuracy: 80 },
                    { date: '2024-01-23T18:20:00', score: 95, duration: '18min', accuracy: 95 },
                ]
            },
            3: { // Números
                moduleId: 3,
                status: 'En Progreso',
                progress: 45,
                attempts: 2,
                bestScore: 88,
                averageScore: 84,
                timeSpent: '57min',
                lastActivity: '2024-01-25T10:00:00',
                completedAt: null,
                xpEarned: 200,
                // Progreso de cada elemento individual (algunos completados)
                elements: {
                    0: 88,  // 0
                    1: 92,  // 1
                    2: 85,  // 2
                    3: 90,  // 3
                    // 4-9 no completados aún
                },
                sessions: [
                    { date: '2024-01-25T10:00:00', score: 88, duration: '25min', accuracy: 88 },
                ]
            },
            4: { // Signos
                moduleId: 4,
                status: 'En Progreso',
                progress: 20,
                attempts: 1,
                bestScore: 70,
                averageScore: 70,
                timeSpent: '15min',
                lastActivity: '2024-01-26T09:00:00',
                completedAt: null,
                xpEarned: 50,
                sessions: [
                    { date: '2024-01-26T09:00:00', score: 70, duration: '15min', accuracy: 70 },
                ]
            },
            5: { // Abecedario
                moduleId: 5, // Asegurar que exista aunque sea vacío
                status: 'Pendiente',
                progress: 0,
                attempts: 0,
                bestScore: 0,
                averageScore: 0,
                timeSpent: '0min',
                sessions: []
            },
            6: { // Operaciones
                moduleId: 6,
                status: 'Pendiente',
                progress: 0,
                attempts: 0,
                bestScore: 0,
                averageScore: 0,
                timeSpent: '0min',
                sessions: []
            }
        }
    },

    // Usuarios adicionales para el ranking y comunidad
    6: {
        userId: 6,
        stats: {
            totalModulesCompleted: 4,
            totalModulesInProgress: 1,
            totalModulesPending: 1,
            averageAccuracy: 88,
            totalTimeSpent: '12h 45min',
            currentStreak: 12,
            longestStreak: 25,
            totalXP: 6500,
            globalRank: 2,
            level: 'Avanzado',
        },
        modules: {
            1: { moduleId: 1, status: 'Completado', progress: 100, bestScore: 95, averageScore: 92 },
            2: { moduleId: 2, status: 'Completado', progress: 100, bestScore: 90, averageScore: 88 },
            3: { moduleId: 3, status: 'Completado', progress: 100, bestScore: 88, averageScore: 85 },
            5: { moduleId: 5, status: 'Completado', progress: 100, bestScore: 92, averageScore: 90 },
            4: { moduleId: 4, status: 'En Progreso', progress: 30, bestScore: 75, averageScore: 75 }
        }
    },
    7: {
        userId: 7,
        stats: {
            totalModulesCompleted: 3,
            totalModulesInProgress: 2,
            totalModulesPending: 1,
            averageAccuracy: 91,
            totalTimeSpent: '9h 20min',
            currentStreak: 8,
            longestStreak: 18,
            totalXP: 5800,
            globalRank: 3,
            level: 'Intermedio',
        },
        modules: {
            1: { moduleId: 1, status: 'Completado', progress: 100, bestScore: 98, averageScore: 96 },
            2: { moduleId: 2, status: 'Completado', progress: 100, bestScore: 94, averageScore: 92 },
            3: { moduleId: 3, status: 'Completado', progress: 100, bestScore: 90, averageScore: 88 },
            4: { moduleId: 4, status: 'En Progreso', progress: 65, bestScore: 92, averageScore: 85 }
        }
    },
    8: {
        userId: 8,
        stats: {
            totalModulesCompleted: 1,
            totalModulesInProgress: 1,
            totalModulesPending: 4,
            averageAccuracy: 82,
            totalTimeSpent: '3h 10min',
            currentStreak: 2,
            longestStreak: 5,
            totalXP: 2100,
            globalRank: 5,
            level: 'Principiante',
        },
        modules: {
            1: { moduleId: 1, status: 'Completado', progress: 100, bestScore: 85, averageScore: 82 },
            3: { moduleId: 3, status: 'En Progreso', progress: 15, bestScore: 70, averageScore: 68 }
        }
    },
    9: {
        userId: 9,
        stats: {
            totalModulesCompleted: 2,
            totalModulesInProgress: 2,
            totalModulesPending: 2,
            averageAccuracy: 89,
            totalTimeSpent: '8h 20min',
            currentStreak: 5,
            longestStreak: 12,
            totalXP: 4200,
            globalRank: 6,
            level: 'Intermedio',
        },
        modules: {
            1: { moduleId: 1, status: 'Completado', progress: 100, bestScore: 94, averageScore: 91 },
            2: { moduleId: 2, status: 'Completado', progress: 100, bestScore: 92, averageScore: 89 },
            4: { moduleId: 4, status: 'En Progreso', progress: 45, bestScore: 85, averageScore: 82 }
        }
    },
    10: {
        userId: 10,
        stats: {
            totalModulesCompleted: 5,
            totalModulesInProgress: 1,
            totalModulesPending: 0,
            averageAccuracy: 96,
            totalTimeSpent: '20h 15min',
            currentStreak: 42,
            longestStreak: 45,
            totalXP: 8900,
            globalRank: 1,
            level: 'Experto',
        },
        modules: {
            1: { moduleId: 1, status: 'Completado', progress: 100, bestScore: 100, averageScore: 98 },
            2: { moduleId: 2, status: 'Completado', progress: 100, bestScore: 98, averageScore: 96 },
            3: { moduleId: 3, status: 'Completado', progress: 100, bestScore: 96, averageScore: 95 },
            4: { moduleId: 4, status: 'Completado', progress: 100, bestScore: 98, averageScore: 97 },
            5: { moduleId: 5, status: 'Completado', progress: 100, bestScore: 94, averageScore: 92 },
            6: { moduleId: 6, status: 'En Progreso', progress: 10, bestScore: 80, averageScore: 80 }
        }
    }
};

// Mapeo seguro para obtener progreso
export const getUserModuleProgress = (userId, moduleId) => {
    // Convertir moduleId a string numérico si viene como string
    // En userProgress las claves son "1", "2" (strings) o 1, 2 (números), JS lo maneja flexible pero aseguramos number
    const numericId = Number(moduleId);

    const userProgress = userProgressData[userId];
    if (!userProgress || !userProgress.modules) {
        return {
            status: 'Pendiente',
            progress: 0,
            bestScore: 0,
            attempts: 0
        };
    }

    const moduleProgress = userProgress.modules[numericId] || userProgress.modules[String(numericId)];

    if (!moduleProgress) {
        return {
            status: 'Pendiente',
            progress: 0,
            bestScore: 0,
            attempts: 0
        };
    }

    return moduleProgress;
};

// Función para obtener las estadísticas generales de un usuario
export const getUserStats = (userId) => {
    const userProgress = userProgressData[userId];
    if (!userProgress) {
        return {
            totalModulesCompleted: 0,
            totalModulesInProgress: 0,
            totalModulesPending: 6,
            averageAccuracy: 0,
            totalTimeSpent: '0min',
            currentStreak: 0,
            longestStreak: 0,
            totalXP: 0,
            globalRank: 0,
            level: 'Nuevo'
        };
    }

    const stats = { ...userProgress.stats };

    // Calcular sesiones totales dinámicamente si no están en stats
    let totalSessions = 0;
    if (userProgress.modules) {
        Object.values(userProgress.modules).forEach(mod => {
            if (mod.sessions) totalSessions += mod.sessions.length;
        });
    }
    stats.totalSessions = totalSessions;

    return stats;
};

// Función para obtener el historial completo de sesiones ordenado por fecha
export const getUserHistory = (userId) => {
    const userProgress = userProgressData[userId];
    if (!userProgress || !userProgress.modules) return [];

    let allSessions = [];

    Object.values(userProgress.modules).forEach(module => {
        if (module.sessions && module.sessions.length > 0) {
            module.sessions.forEach(session => {
                allSessions.push({
                    moduleId: module.moduleId,
                    ...session
                });
            });
        } else if (module.lastActivity && module.progress > 0) {
            // Si no hay sesiones detalladas pero hay progreso (mock fallback), creamos una entrada
            allSessions.push({
                moduleId: module.moduleId,
                date: module.lastActivity.split('T')[0],
                score: module.averageScore,
                duration: module.timeSpent,
                accuracy: module.averageScore
            });
        }
    });

    // Ordenar por fecha descendente (más reciente primero)
    return allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Función para calcular XP a otorgar basado en el porcentaje completado
export const calculateXPReward = (moduleId, scorePercentage, isFirstAttempt = false) => {
    // XP base por módulo
    const baseXP = {
        1: 500,  // Vocales
        2: 550,  // Palabras
        3: 500,  // Números
        4: 600,  // Señas matemáticas
        5: 700,  // Abecedario (más complejo)
        6: 650   // Operaciones
    };

    const moduleBaseXP = baseXP[moduleId] || 500;

    // Multiplicador por desempeño
    let performanceMultiplier = scorePercentage / 100;

    // Bonificación por primer intento
    if (isFirstAttempt) {
        performanceMultiplier *= 1.2; // 20% extra
    }

    // Bonificación por excelencia (90%+)
    if (scorePercentage >= 90) {
        performanceMultiplier *= 1.1; // 10% extra
    }

    // Bonificación por perfección (100%)
    if (scorePercentage === 100) {
        performanceMultiplier *= 1.2; // 20% extra adicional
    }

    return Math.round(moduleBaseXP * performanceMultiplier);
};

export default userProgressData;
