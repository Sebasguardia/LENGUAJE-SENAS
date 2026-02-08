import apiClient from './apiClient';

export const moduleService = {
    getModules: async () => {
        const response = await apiClient.get('/modules/');
        return response.data;
    },

    getModuleBySlug: async (slug) => {
        const response = await apiClient.get(`/modules/${slug}`);
        return response.data;
    }
};
