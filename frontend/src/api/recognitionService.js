import apiClient from './apiClient';

export const recognitionService = {
    predict: async (landmarks, moduleSlug = null, expectedLabel = null) => {
        const response = await apiClient.post('/recognition/predict', {
            landmarks,
            module_slug: moduleSlug,
            expected_label: expectedLabel
        });
        return response.data;
    }
};
