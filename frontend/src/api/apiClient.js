import axios from 'axios';

const API_BASE_URL = 'https://lenguaje-senas-ia-j0a3.onrender.com/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Motor de Cache Híbrido (Memoria + Persistencia)
const memCache = new Map();
const PERSISTENT_CACHE_PREFIX = 'api_cache_';
const STALE_THRESHOLD = 30000; // 30s para considerar datos "viejos" y re-validar
const MAX_AGE = 600000; // 10 min de vida máxima para datos en disco

// Helper para persistencia
const saveToPersistentCache = (key, data) => {
    try {
        localStorage.setItem(PERSISTENT_CACHE_PREFIX + key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) { console.warn("Cache persistence failed", e); }
};

const getFromPersistentCache = (key) => {
    try {
        const item = localStorage.getItem(PERSISTENT_CACHE_PREFIX + key);
        return item ? JSON.parse(item) : null;
    } catch (e) { return null; }
};

apiClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers['X-Skip-Auth']) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Estrategia de Cache Instantáneo para peticiones GET
    if (config.method === 'get') {
        const cacheKey = config.url + (config.params ? JSON.stringify(config.params) : '');

        // 1. Intentar memoria (Acceso ultra-rápido)
        let cached = memCache.get(cacheKey);

        // 2. Intentar disco (Persistencia entre sesiones)
        if (!cached) {
            cached = getFromPersistentCache(cacheKey);
            if (cached) memCache.set(cacheKey, cached);
        }

        if (cached) {
            const age = Date.now() - cached.timestamp;

            // Si el dato es menor a MAX_AGE, lo servimos de inmediato
            if (age < MAX_AGE) {
                // Si el dato es "viejo" (>30s), disparamos actualización silenciosa en background
                if (age > STALE_THRESHOLD) {
                    console.log(`[Cache SWR] Revalidando en background: ${config.url}`);
                    axios({ ...config, adapter: undefined }).then(res => {
                        saveToPersistentCache(cacheKey, res.data);
                        memCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
                        // Notificar a la UI que hay datos frescos
                        window.dispatchEvent(new CustomEvent('api-cache-updated', { detail: { url: config.url, data: res.data } }));
                    }).catch(() => { });
                }

                // Retorno instantáneo vía Adapter
                config.adapter = () => Promise.resolve({
                    data: cached.data,
                    status: 200,
                    statusText: 'OK (From Cache)',
                    headers: config.headers,
                    config: config,
                });
            }
        }
    }
    return config;
}, (error) => Promise.reject(error));

// Sincronizar cache al recibir respuestas frescas
apiClient.interceptors.response.use(
    (response) => {
        if (response.config.method === 'get' && !response.statusText.includes('From Cache')) {
            const cacheKey = response.config.url + (response.config.params ? JSON.stringify(response.config.params) : '');
            const entry = { data: response.data, timestamp: Date.now() };
            memCache.set(cacheKey, entry);
            saveToPersistentCache(cacheKey, response.data);
        }
        return response;
    },
    (error) => {
        const isAuthRequest = error.config?.url?.includes('/auth/') || error.config?.url?.includes('/settings/public');
        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default apiClient;
