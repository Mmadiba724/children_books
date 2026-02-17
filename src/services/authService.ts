
import apiClient, { publicRequest } from '../config/api';
import { handleError } from '../utils/errorHandler';
import tokenStorage from '../utils/tokenStorage';

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
                tokenStorage.setAccessToken(accessToken);
            }
            if (refreshToken) {
                tokenStorage.setRefreshToken(refreshToken);
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
            console.log("Login API response:", response.data);

            // Handle different response structures
            let accessToken, refreshToken;

            // Check if tokens are in data.data or directly in data
            if (response.data.data) {
                accessToken = response.data.data.accessToken;
                refreshToken = response.data.data.refreshToken;
            } else {
                accessToken = response.data.accessToken;
                refreshToken = response.data.refreshToken;
            }

            console.log("Extracted tokens:", { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });

            if (accessToken) {
                tokenStorage.setAccessToken(accessToken);
            }
            if (refreshToken) {
                tokenStorage.setRefreshToken(refreshToken);
            }
            return response.data;
        } catch (error) {
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // Refresh access token (public endpoint)
    refreshToken: async (): Promise<AuthResponse> => {
        try {
            const refreshToken = tokenStorage.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            const response = await publicRequest({
                method: 'POST',
                url: '/api/v1/auth/refresh',
                data: { refreshToken },
            });

            // Handle different response structures
            let accessToken, newRefreshToken;

            // Check if tokens are in data.data or directly in data
            if (response.data.data) {
                accessToken = response.data.data.accessToken;
                newRefreshToken = response.data.data.refreshToken;
            } else {
                accessToken = response.data.accessToken;
                newRefreshToken = response.data.refreshToken;
            }

            console.log("Refresh token API response:", { hasAccessToken: !!accessToken, hasRefreshToken: !!newRefreshToken });

            if (accessToken) {
                tokenStorage.setAccessToken(accessToken);
            }

            // Update refresh token if a new one is provided
            if (newRefreshToken) {
                tokenStorage.setRefreshToken(newRefreshToken);
            }

            return response.data;
        } catch (error) {
            // Clear tokens if refresh fails
            tokenStorage.clearAll();
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // User logout (requires authentication)
    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/api/v1/auth/logout');
            tokenStorage.clearAll();
        } catch (error) {
            // Clear tokens even if logout fails
            tokenStorage.clearAll();
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return tokenStorage.isAuthenticated();
    },

    // Get current auth token
    getAuthToken: (): string | null => {
        return tokenStorage.getAccessToken();
    },
};

export default authService;
