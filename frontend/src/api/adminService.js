import apiClient from './apiClient';

export const adminService = {
    // DASHBOARD & ANALYTICS
    getDataDistribution: async () => {
        const response = await apiClient.get('/admin-tools/analytics/data-distribution');
        return response.data;
    },
    getModuleDistribution: async () => {
        const response = await apiClient.get('/admin-tools/analytics/module-distribution');
        return response.data;
    },
    getRecentActivity: async () => {
        const response = await apiClient.get('/admin-tools/analytics/recent-activity');
        return response.data;
    },
    getGeneralStats: async () => {
        const response = await apiClient.get('/admin-tools/analytics/general-stats');
        return response.data;
    },
    getTopStudents: async () => {
        const response = await apiClient.get('/admin-tools/analytics/top-students');
        return response.data;
    },
    getWeeklyProgress: async () => {
        const response = await apiClient.get('/admin-tools/analytics/weekly-progress');
        return response.data;
    },
    getUserStats: async (userId) => {
        const response = await apiClient.get(`/admin-tools/analytics/user-stats/${userId}`);
        return response.data;
    },

    // DATABASE MANAGEMENT
    getDatabaseStats: async () => {
        const response = await apiClient.get('/admin-tools/database/stats');
        return response.data;
    },
    createBackup: async () => {
        const response = await apiClient.post('/admin-tools/database/backup');
        return response.data;
    },
    listBackups: async () => {
        const response = await apiClient.get('/admin-tools/database/backups');
        return response.data;
    },
    getDownloadUrl: (filename) => {
        // Return absolute URL for direct download or open in new window
        return `${apiClient.defaults.baseURL}/admin-tools/database/download/${filename}`;
    },


    // SETTINGS MANAGEMENT
    getAllSettings: async () => {
        const response = await apiClient.get('/settings/');
        return response.data;
    },
    updateSettings: async (settings) => {
        // settings: array of {key, value, category}
        const response = await apiClient.put('/settings/', settings);
        return response.data;
    },
    getPublicSettings: async () => {
        const response = await apiClient.get('/settings/public', {
            headers: { 'X-Skip-Auth': 'true' }
        });
        return response.data;
    },

    // USER MANAGEMENT
    getUsers: async () => {
        const response = await apiClient.get('/users/');
        return response.data;
    },
    createUser: async (userData) => {
        const response = await apiClient.post('/users/', userData);
        return response.data;
    },
    updateUser: async (userId, data) => {
        const response = await apiClient.patch(`/users/${userId}`, data);
        return response.data;
    },
    deleteUser: async (userId) => {
        const response = await apiClient.delete(`/users/${userId}`);
        return response.data;
    },
    // MODULE & ELEMENT MANAGEMENT
    // Nota: El listado general ya está en moduleService.js
    createModule: async (moduleData) => {
        const response = await apiClient.post('/modules/', moduleData);
        return response.data;
    },
    updateModule: async (moduleId, moduleData) => {
        const response = await apiClient.patch(`/modules/${moduleId}`, moduleData);
        return response.data;
    },
    deleteModule: async (moduleId) => {
        const response = await apiClient.delete(`/modules/${moduleId}`);
        return response.data;
    },

    createElement: async (moduleId, elementData) => {
        const response = await apiClient.post(`/modules/${moduleId}/elements`, elementData);
        return response.data;
    },
    updateElement: async (elementId, elementData) => {
        const response = await apiClient.patch(`/modules/elements/${elementId}`, elementData);
        return response.data;
    },
    deleteElement: async (elementId) => {
        const response = await apiClient.delete(`/modules/elements/${elementId}`);
        return response.data;
    },

    // DATA CAPTURE
    saveCapture: async (captureData) => {
        const response = await apiClient.post('/admin-tools/captures', captureData);
        return response.data;
    },
    saveCaptureBatch: async (capturesData) => {
        // capturesData debe ser un array de objetos
        const response = await apiClient.post('/admin-tools/captures/batch', capturesData);
        return response.data;
    },
    resetElementCaptures: async (elementId) => {
        const response = await apiClient.delete(`/admin-tools/captures/reset/${elementId}`);
        return response.data;
    },

    // TRAINING
    triggerTraining: async (moduleId) => {
        const response = await apiClient.post(`/admin-tools/training/trigger?module_id=${moduleId}`);
        return response.data;
    }
};
