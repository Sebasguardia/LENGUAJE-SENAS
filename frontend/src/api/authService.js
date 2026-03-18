import apiClient from './apiClient';
import { authStorage } from '../utils/authStorage';

export const authService = {
    login: async (email, password, rememberMe = true) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await apiClient.post('/auth/login/access-token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data.access_token) {
            // We'll also need the user data to save it all together
            const userData = await authService.getMeWithToken(response.data.access_token);
            authStorage.saveAuth(response.data.access_token, userData, rememberMe);
        }
        return response.data;
    },

    // Method to login WITHOUT saving to localStorage immediately (for validation)
    loginNoSave: async (email, password) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await apiClient.post('/auth/login/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Skip-Auth': 'true'
            }
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    getMe: async () => {
        // OPTIMIZACIÓN SWR: Retornar datos cacheados inmediatamente para eliminar espera visual
        const cached = authStorage.getUser();
        if (cached) {
            // Retornamos el cache e iniciamos la actualización en segundo plano
            // Llamada asíncrona "silenciosa" para actualizar el cache
            apiClient.get('/auth/me').then(response => {
                authStorage.updateUser(response.data);
                window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: response.data }));
            }).catch(e => console.warn("Background profile sync failed", e));

            return cached;
        }

        // Si no hay cache, hacemos la petición normal
        const response = await apiClient.get('/auth/me');
        authStorage.updateUser(response.data);
        return response.data;
    },

    updateMe: async (userData) => {
        const params = new URLSearchParams();
        if (userData.full_name) params.append('full_name', userData.full_name);
        if (userData.dni) params.append('dni', userData.dni);
        if (userData.phone) params.append('phone', userData.phone);

        const response = await apiClient.patch(`/users/me/update?${params.toString()}`);
        authStorage.updateUser(response.data);
        return response.data;
    },

    // Get profile data using a specific token (without using localStorage global token)
    getMeWithToken: async (token) => {
        const response = await apiClient.get('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Skip-Auth': 'true',
                'X-No-Cache': 'true' // Forzar petición real al servidor
            }
        });
        return response.data;
    },

    logout: () => {
        authStorage.clearAuth();
        window.location.href = '/login';
    },

    changePassword: async (passwords) => {
        const response = await apiClient.post('/auth/change-password', passwords);
        return response.data;
    },

    recoverPassword: async (email) => {
        const response = await apiClient.post('/auth/password-recovery', { email });
        return response.data;
    },

    verifyRecoveryCode: async (email, code) => {
        const response = await apiClient.post('/auth/verify-recovery-code', { email, code });
        return response.data;
    },

    resetPasswordWithCode: async (email, code, newPassword) => {
        const response = await apiClient.post('/auth/reset-password-with-code', {
            email,
            code,
            new_password: newPassword
        });
        return response.data;
    },

    verifyRegistration: async (email, code) => {
        const response = await apiClient.post('/auth/verify-registration', { token: credential });
        return response.data;
    },

    googleLogin: async (credential, rememberMe = true) => {
        const response = await apiClient.post('/auth/google', { token: credential });

        if (response.data.access_token) {
            const userData = await authService.getMeWithToken(response.data.access_token);
            authStorage.saveAuth(response.data.access_token, userData, rememberMe);
        }

        return response.data;
    }
};
