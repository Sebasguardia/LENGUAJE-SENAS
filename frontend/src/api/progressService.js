import apiClient from './apiClient';

export const progressService = {
    // Guardar sesión y obtener usuario actualizado (con nuevo XP)
    saveSession: async (sessionData) => {
        const response = await apiClient.post('/progress/session', sessionData);
        return response.data;
    },

    // Obtener progreso de un módulo específico
    getModuleProgress: async (moduleId) => {
        const response = await apiClient.get(`/progress/module/${moduleId}`);
        return response.data;
    },

    // Obtener ranking de usuarios
    getRanking: async (limit = 10) => {
        const response = await apiClient.get(`/progress/ranking`, { params: { limit } });
        return response.data;
    },

    // Obtener estadísticas para el dashboard
    getDashboardStats: async () => {
        const response = await apiClient.get('/progress/stats');
        return response.data;
    },

    // Obtener historial reciente
    getHistory: async (limit = 4) => {
        const response = await apiClient.get('/progress/history', { params: { limit } });
        return response.data;
    }
};
