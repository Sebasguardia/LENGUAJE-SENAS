import apiClient from './apiClient';

export const notificationService = {
    getNotifications: async () => {
        const response = await apiClient.get('/notifications/');
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await apiClient.patch(`/notifications/${id}`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.post('/notifications/mark-all-read');
        return response.data;
    }
};
