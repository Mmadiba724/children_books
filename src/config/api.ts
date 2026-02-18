import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import tokenStorage from '../utils/tokenStorage';

declare module 'axios' {
    interface AxiosRequestConfig {
        skipAuth?: boolean;
        _retry?: boolean;
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

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - adds auth token when available
apiClient.interceptors.request.use(
    (config) => {
        // Skip auth for endpoints that don't require it (if marked with skipAuth flag)
        if (!config.skipAuth) {
            const token = tokenStorage.getAccessToken();
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

// Response interceptor with automatic token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Check if it's a 401 or 403 error and we haven't tried to refresh yet
        // 403 can also indicate an expired/missing token in some API implementations
        const shouldRetryWithRefresh =
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry &&
            !originalRequest.skipAuth &&
            tokenStorage.getRefreshToken(); // Only retry if we have a refresh token

        if (shouldRetryWithRefresh) {
            if (isRefreshing) {
                // If a refresh is already in progress, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        throw err;
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = tokenStorage.getRefreshToken();

            if (!refreshToken) {
                // No refresh token available, redirect to login
                isRefreshing = false;
                tokenStorage.clearAll();
                globalThis.location.href = '/';
                throw error;
            }

            try {
                // Import authService dynamically to avoid circular dependency
                const authService = (await import('../services/authService')).default;

                // Attempt to refresh the token
                await authService.refreshToken();

                const newAccessToken = tokenStorage.getAccessToken();

                if (newAccessToken && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                processQueue(null, newAccessToken);
                isRefreshing = false;

                // Retry the original request with the new token
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                processQueue(refreshError as Error, null);
                isRefreshing = false;
                tokenStorage.clearAll();
                globalThis.location.href = '/';
                throw refreshError;
            }
        }

        // For other errors or if refresh failed, throw the error
        if (error.response?.status === 401) {
            tokenStorage.clearAll();
            globalThis.location.href = '/';
        }

        throw error;
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
