import { modulesData } from './modules';
import { Award, Target, Flame, Zap, Star, Trophy, Crown, Medal, BookOpen, Activity } from 'lucide-react';

// --- LÓGICA DE ESCALABILIDAD (UNIVERSO XP) ---
export const getUniverseStats = () => {
    // El usuario quiere 100 XP por cada módulo existente
    const totalModules = modulesData.length;
    const maxPossibleXP = totalModules * 100;
    return {
        totalModules,
        maxPossibleXP
    };
};

export const getGlobalRank = (xp) => {
    const { maxPossibleXP } = getUniverseStats();
    const percentage = maxPossibleXP > 0 ? (xp / maxPossibleXP) * 100 : 0;

    if (percentage >= 100) return { name: 'Leyenda', tier: 'Leyenda', level: 7, color: '#60A5FA', pct: 100, icon: Crown };
    if (percentage >= 90) return { name: 'Maestro', tier: 'Maestro', level: 6, color: '#60A5FA', pct: 90, icon: Trophy };
    if (percentage >= 75) return { name: 'Experto', tier: 'Experto', level: 5, color: '#A78BFA', pct: 75, icon: Award };
    if (percentage >= 50) return { name: 'Avanzado', tier: 'Avanzado', level: 4, color: '#FBBF24', pct: 50, icon: Medal };
    if (percentage >= 25) return { name: 'Explorador', tier: 'Explorador', level: 3, color: '#94A3B8', pct: 25, icon: Star };
    if (percentage >= 10) return { name: 'Aprendiz', tier: 'Aprendiz', level: 2, color: '#FB923C', pct: 10, icon: Zap };
    return { name: 'Novato', tier: 'Novato', level: 1, color: '#71717A', pct: 0, icon: Target };
};

// --- DEFINICIÓN DE LOGROS ESCALABLES ---
export const ACHIEVEMENTS_DEF = [
    {
        id: 'module_master',
        title: 'Erudito de Módulos',
        desc: 'Completa los módulos de aprendizaje',
        icon: BookOpen,
        type: 'percentage',
        metric: (stats) => stats.totalModulesCompleted,
        total: () => modulesData.length,
        tiers: [
            { id: 'bronze', label: 'Bronce', limit: 0.2, xp: 100 },
            { id: 'silver', label: 'Plata', limit: 0.6, xp: 300 },
            { id: 'gold', label: 'Oro', limit: 1.0, xp: 500 }
        ]
    },
    {
        id: 'perfect_accuracy',
        title: 'Francotirador Visual',
        desc: 'Logra precisión en tus señas',
        icon: Target,
        type: 'fixed',
        metric: (stats) => stats.averageAccuracy,
        tiers: [
            { id: 'bronze', label: 'Bronce', limit: 70, xp: 50 },
            { id: 'silver', label: 'Plata', limit: 85, xp: 150 },
            { id: 'gold', label: 'Oro', limit: 95, xp: 300 }
        ]
    },
    {
        id: 'streak_master',
        title: 'Llama Sagrada',
        desc: 'Mantén tu racha activa',
        icon: Flame,
        type: 'fixed',
        metric: (stats) => stats.currentStreak,
        tiers: [
            { id: 'bronze', label: 'Bronce', limit: 3, xp: 50 },
            { id: 'silver', label: 'Plata', limit: 7, xp: 200 },
            { id: 'gold', label: 'Oro', limit: 30, xp: 600 }
        ]
    },
    {
        id: 'xp_hunter',
        title: 'Cazador de XP',
        desc: 'Acumula puntos totales',
        icon: Zap,
        type: 'percentage_xp',
        metric: (stats) => stats.totalXP,
        total: () => getUniverseStats().maxPossibleXP,
        tiers: [
            { id: 'bronze', label: 'Bronce', limit: 0.1, xp: 100 },
            { id: 'silver', label: 'Plata', limit: 0.4, xp: 400 },
            { id: 'gold', label: 'Oro', limit: 0.8, xp: 1000 }
        ]
    },
    {
        id: 'time_traveler',
        title: 'Viajero del Tiempo',
        desc: 'Horas dedicadas al estudio',
        icon: Medal,
        type: 'fixed',
        metric: (stats) => {
            // Extraer horas de strings como "7h 15min"
            const match = stats.totalTimeSpent?.match(/(\d+)h/);
            return match ? parseInt(match[1]) : 0;
        },
        tiers: [
            { id: 'bronze', label: 'Bronce', limit: 1, xp: 100 },
            { id: 'silver', label: 'Plata', limit: 10, xp: 500 },
            { id: 'gold', label: 'Oro', limit: 50, xp: 2000 }
        ]
    },
    {
        id: 'precision_legend',
        title: 'Leyenda de Precisión',
        desc: 'Mantén una precisión impecable',
        icon: Star,
        type: 'fixed',
        metric: (stats) => stats.averageAccuracy,
        tiers: [
            { id: 'bronze', label: 'Eficaz', limit: 80, xp: 100 },
            { id: 'silver', label: 'Impecable', limit: 90, xp: 400 },
            { id: 'gold', label: 'Quirúrgico', limit: 98, xp: 1000 }
        ]
    },
    {
        id: 'xp_collector',
        title: 'Coleccionista de XP',
        desc: 'Hitos masivos de puntos',
        icon: Activity,
        type: 'fixed',
        metric: (stats) => stats.totalXP,
        tiers: [
            { id: 'bronze', label: 'Iniciado', limit: 1000, xp: 50 },
            { id: 'silver', label: 'Acumulador', limit: 5000, xp: 500 },
            { id: 'gold', label: 'Magnate de XP', limit: 20000, xp: 2000 }
        ]
    },
    {
        id: 'total_completionist',
        title: 'Perfeccionista Total',
        desc: 'Porcentaje de elementos dominados',
        icon: Crown,
        type: 'percentage',
        metric: (stats) => stats.totalElementsCompleted || 0,
        total: () => getUniverseStats().totalElements,
        tiers: [
            { id: 'bronze', label: 'Bronce', limit: 0.25, xp: 200 },
            { id: 'silver', label: 'Plata', limit: 0.5, xp: 600 },
            { id: 'gold', label: 'Oro', limit: 1.0, xp: 1500 }
        ]
    },
    {
        id: 'session_warrior',
        title: 'Guerrero de Sesiones',
        desc: 'Número total de prácticas realizadas',
        icon: Activity,
        type: 'fixed',
        metric: (stats) => stats.totalSessions || 0,
        tiers: [
            { id: 'bronze', label: 'Iniciado', limit: 10, xp: 100 },
            { id: 'silver', label: 'Veterano', limit: 50, xp: 500 },
            { id: 'gold', label: 'Imparable', limit: 200, xp: 1500 }
        ]
    },
    {
        id: 'multitask_master',
        title: 'Mente Multitarea',
        desc: 'Módulos en progreso simultáneamente',
        icon: Zap,
        type: 'fixed',
        metric: (stats) => stats.totalModulesInProgress || 0,
        tiers: [
            { id: 'bronze', label: 'Dual', limit: 2, xp: 150 },
            { id: 'silver', label: 'Versátil', limit: 4, xp: 400 },
            { id: 'gold', label: 'Maestro de Rutas', limit: 6, xp: 1000 }
        ]
    },
    {
        id: 'speed_demon',
        title: 'Demonio de Velocidad',
        desc: 'Completar módulos en tiempo récord',
        icon: Flame,
        type: 'fixed',
        metric: (stats) => {
            // Este es un cálculo estimado basado en XP/Tiempo
            const hours = parseInt(stats.totalTimeSpent || '1');
            return stats.totalXP / (hours || 1);
        },
        tiers: [
            { id: 'bronze', label: 'Rápido', limit: 500, xp: 100 },
            { id: 'silver', label: 'Sónico', limit: 1000, xp: 300 },
            { id: 'gold', label: 'Relámpago', limit: 2000, xp: 800 }
        ]
    },
    {
        id: 'consistency_king',
        title: 'Rey de la Constancia',
        desc: 'Racha histórica de aprendizaje',
        icon: Star,
        type: 'fixed',
        metric: (stats) => stats.longestStreak || 0,
        tiers: [
            { id: 'bronze', label: 'Persistente', limit: 7, xp: 200 },
            { id: 'silver', label: 'Inquebrantable', limit: 21, xp: 700 },
            { id: 'gold', label: 'Eterno', limit: 100, xp: 2500 }
        ]
    }
];

export const getUserBadges = (stats) => {
    const badges = [];
    if (!stats) return badges;

    ACHIEVEMENTS_DEF.forEach(ach => {
        let currentTier = null;
        const metricValue = ach.metric(stats);

        ach.tiers.forEach(tier => {
            const limit = ach.type.includes('percentage')
                ? tier.limit * ach.total()
                : tier.limit;

            if (metricValue >= limit) {
                currentTier = {
                    ...tier,
                    achId: ach.id,
                    title: ach.title,
                    icon: ach.icon
                };
            }
        });

        if (currentTier) {
            badges.push(currentTier);
        }
    });

    return badges;
};

export const checkNewAchievements = (stats) => {
    if (!stats) return [];

    // 1. Obtener lo que ya estaba desbloqueado (desde localStorage)
    const storageKey = `unlocked_achievements_${stats.userId || 'demo'}`;
    const previouslyUnlocked = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // 2. Obtener insignias actuales
    const currentBadges = getUserBadges(stats);

    // 3. Filtrar las que son nuevas
    const newlyUnlocked = currentBadges.filter(badge => {
        const uniqueId = `${badge.achId}_${badge.id}`; // ej: module_master_bronze
        return !previouslyUnlocked.includes(uniqueId);
    });

    // 4. Si hay nuevas, actualizar el storage
    if (newlyUnlocked.length > 0) {
        const allUnlocked = [
            ...previouslyUnlocked,
            ...newlyUnlocked.map(b => `${b.achId}_${b.id}`)
        ];
        localStorage.setItem(storageKey, JSON.stringify(allUnlocked));
    }

    return newlyUnlocked;
};
