
import apiClient, { publicRequest } from '../config/api';
import { handleError } from '../utils/errorHandler';

interface RegisterPayload {
    email: string;
    password: string;
    name?: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

const authService = {
    // Register a new user (public endpoint)
    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        try {
            const response = await publicRequest({
                method: 'POST',
                url: '/api/v1/auth/register',
                data: payload,
            });
            const { accessToken, refreshToken } = response.data;
            if (accessToken) {
                localStorage.setItem('authToken', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            return response.data;
        } catch (error) {
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // User login (public endpoint)
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        try {
            const response = await publicRequest({
                method: 'POST',
                url: '/api/v1/auth/login',
                data: payload,
            });
            const { accessToken, refreshToken } = response.data;
            if (accessToken) {
                localStorage.setItem('authToken', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            return response.data;
        } catch (error) {
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // Refresh access token (public endpoint)
    refreshToken: async (): Promise<AuthResponse> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            const response = await publicRequest({
                method: 'POST',
                url: '/api/v1/auth/refresh',
                data: { refreshToken },
            });
            const { accessToken } = response.data;
            if (accessToken) {
                localStorage.setItem('authToken', accessToken);
            }
            return response.data;
        } catch (error) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // User logout (requires authentication)
    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/api/v1/auth/logout');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
        } catch (error) {
            // Clear tokens even if logout fails
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('authToken');
    },

    // Get current auth token
    getAuthToken: (): string | null => {
        return localStorage.getItem('authToken');
    },
};

export default authService;
