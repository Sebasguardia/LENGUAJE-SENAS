import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el token JWT en cada petición
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    // Si la petición tiene X-Skip-Auth, no enviamos el token actual
    if (token && !config.headers['X-Skip-Auth']) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores globales (ej: token expirado)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.includes('/auth/') || error.config?.url?.includes('/settings/public');

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            // Dispatch custom event so App.jsx can respond
            window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default apiClient;
