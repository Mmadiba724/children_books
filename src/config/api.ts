import axios, { AxiosRequestConfig } from 'axios';

declare module 'axios' {
    interface AxiosRequestConfig {
        skipAuth?: boolean;
    }
}

const API_BASE_URL = 'https://dev.ebook.api.toughblue.com';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - adds auth token when available
apiClient.interceptors.request.use(
    (config) => {
        // Skip auth for endpoints that don't require it (if marked with skipAuth flag)
        if (!config.skipAuth) {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            globalThis.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Helper function for public endpoints (no authentication required)
export const publicRequest = (config: AxiosRequestConfig) => {
    return apiClient({
        ...config,
        skipAuth: true,
    });
};

// Helper function for authenticated endpoints
export const authenticatedRequest = (config: AxiosRequestConfig) => {
    return apiClient(config);
};

export { API_BASE_URL, apiClient };
export default apiClient;
