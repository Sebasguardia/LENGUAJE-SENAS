import apiClient from './apiClient';

export const achievementService = {
    // Obtener logros del usuario
    getUserAchievements: async () => {
        const response = await apiClient.get('/achievements/user/achievements');
        return response.data;
    },

    // Obtener leaderboard global
    getLeaderboard: async (limit = 10) => {
        const response = await apiClient.get(`/achievements/leaderboard?limit=${limit}`);
        return response.data;
    }
};
