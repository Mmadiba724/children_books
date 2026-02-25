import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import tokenStorage from '../utils/tokenStorage';

declare module 'axios' {
    interface AxiosRequestConfig {
        skipAuth?: boolean;
        _retry?: boolean;
    }
}

const API_BASE_URL = 'https://dev.ebook.api.toughblue.com';
const CART_SESSION_KEY = 'cartSessionId';

// Cart session management
const cartSessionManager = {
    getSessionId: (): string | null => {
        const sessionId = localStorage.getItem(CART_SESSION_KEY);
        console.log('[Cart Session] Getting session ID:', sessionId || 'None');
        return sessionId;
    },

    setSessionId: (sessionId: string): void => {
        console.log('[Cart Session] Setting session ID:', sessionId);
        localStorage.setItem(CART_SESSION_KEY, sessionId);
    },

    clearSessionId: (): void => {
        const sessionId = localStorage.getItem(CART_SESSION_KEY);
        console.log('[Cart Session] Clearing session ID:', sessionId || 'None');
        localStorage.removeItem(CART_SESSION_KEY);
    },
};

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable sending/receiving cookies for guest sessions
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

// Request interceptor - adds auth token and cart session ID
apiClient.interceptors.request.use(
    (config) => {
        const isCartRequest = config.url?.includes('/cart');

        // Skip auth for endpoints that don't require it (if marked with skipAuth flag)
        if (!config.skipAuth) {
            const token = tokenStorage.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                if (isCartRequest) {
                    console.log('[Cart Session] Request with Auth token to:', config.url);
                }
            }
        }

        // Add cart session ID for cart-related requests
        const cartSessionId = cartSessionManager.getSessionId();
        if (cartSessionId) {
            config.headers['X-Cart-Session-Id'] = cartSessionId;
            if (isCartRequest) {
                console.log('[Cart Session] Sending session ID with request:', cartSessionId);
            }
        } else if (isCartRequest) {
            console.log('[Cart Session] No session ID available for cart request');
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with automatic token refresh and cart session capture
apiClient.interceptors.response.use(
    (response) => {
        const isCartRequest = response.config.url?.includes('/cart');

        // Capture cart session ID from backend if provided
        // Try headers first (case-insensitive), then fall back to response body
        let cartSessionId = response.headers['x-cart-session-id'] || response.headers['X-Cart-Session-Id'];

        // If not in headers, check response body (nested in data.data.sessionId or top-level)
        if (!cartSessionId && response.data && typeof response.data === 'object') {
            // Check nested path: response.data.data.sessionId (for cart responses)
            if (response.data.data && typeof response.data.data === 'object') {
                cartSessionId = response.data.data.sessionId;
            }
            // Fallback to top-level sessionId
            if (!cartSessionId) {
                cartSessionId = response.data.sessionId || response.data.cartSessionId;
            }
        }

        if (cartSessionId) {
            const existingSessionId = cartSessionManager.getSessionId();
            if (existingSessionId !== cartSessionId) {
                console.log('[Cart Session] ✅ New session ID received from backend:', cartSessionId);
                cartSessionManager.setSessionId(cartSessionId);
            }
        } else if (isCartRequest) {
            console.log('[Cart Session] ⚠️ No session ID found in headers or response body');
        }

        return response;
    },
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

export { API_BASE_URL, apiClient, cartSessionManager };
export default apiClient;
