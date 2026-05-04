
import apiClient, { publicRequest } from '../config/api';
import { handleError } from '../utils/errorHandler';
import tokenStorage from '../utils/tokenStorage';

interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
	phone: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface ForgotPasswordPayload {
    email: string;
}

interface ResetPasswordPayload {
    token: string;
    newPassword: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        userId: number;
        email: string;
        role: 'USER' | 'ADMIN';
        name?: string;
    };
    timestamp: string;
}

interface BasicApiResponse {
    success: boolean;
    message: string;
    timestamp?: string;
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

            // Response structure: { success, message, data: { accessToken, refreshToken, ... }, timestamp }
            const { accessToken, refreshToken } = response.data.data;

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

            // Response structure: { success, message, data: { accessToken, refreshToken, userId, email, role }, timestamp }
            const { accessToken, refreshToken } = response.data.data;

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

            // Response structure: { success, message, data: { accessToken, refreshToken, ... }, timestamp }
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

            console.log("Refresh token API response:", { hasAccessToken: !!newAccessToken, hasRefreshToken: !!newRefreshToken });

            if (newAccessToken) {
                tokenStorage.setAccessToken(newAccessToken);
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

    // Forgot password (public endpoint)
    forgotPassword: async (
        payload: ForgotPasswordPayload,
    ): Promise<BasicApiResponse> => {
        try {
            const response = await publicRequest({
                method: 'POST',
                url: '/api/v1/auth/forgot-password',
                data: payload,
            });

            return response.data;
        } catch (error) {
            throw handleError(error as unknown as import('../utils/errorHandler').ErrorType, { serviceName: 'AuthService' });
        }
    },

    // Reset password (public endpoint)
    resetPassword: async (
        payload: ResetPasswordPayload,
    ): Promise<BasicApiResponse> => {
        try {
            const response = await publicRequest({
                method: 'POST',
                url: '/api/v1/auth/reset-password',
                data: payload,
            });

            return response.data;
        } catch (error) {
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
