import apiClient from './apiClient';

export const authService = {
    login: async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await apiClient.post('/auth/login/access-token', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    // Method to login WITHOUT saving to localStorage immediately (for validation)
    loginNoSave: async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await apiClient.post('/auth/login/access-token', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Skip-Auth': 'true' // Custom flag if we want to ignore in interceptor
            }
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        localStorage.setItem('userData', JSON.stringify(response.data));
        return response.data;
    },

    updateMe: async (userData) => {
        // Prepare query params if needed, or send as body if backend allows
        // Our backend expects query params or body depending on implementation
        // The one I just wrote uses optional query params but FastAPI might favor body for PATCH
        // Actually I defined them as optional params in the function signature: full_name: str = None...

        const params = new URLSearchParams();
        if (userData.full_name) params.append('full_name', userData.full_name);
        if (userData.dni) params.append('dni', userData.dni);
        if (userData.phone) params.append('phone', userData.phone);

        const response = await apiClient.patch(`/users/me/update?${params.toString()}`);
        localStorage.setItem('userData', JSON.stringify(response.data));
        return response.data;
    },

    // Get profile data using a specific token (without using localStorage global token)
    getMeWithToken: async (token) => {
        const response = await apiClient.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Skip-Auth': 'true'
            }
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    },

    changePassword: async (passwords) => {
        const response = await apiClient.post('/auth/change-password', passwords);
        return response.data;
    }
};
