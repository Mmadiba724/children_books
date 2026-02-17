/**
 * Token Debugger Utility
 * Helper functions to debug and verify token storage and refresh functionality
 */

import tokenStorage from './tokenStorage';

interface TokenInfo {
    exists: boolean;
    value?: string;
    decoded?: {
        header?: Record<string, unknown>;
        payload?: Record<string, unknown>;
        exp?: number;
        iat?: number;
        isExpired?: boolean;
        expiresIn?: string;
    };
}

/**
 * Decode a JWT token (without verification)
 */
const decodeJWT = (token: string) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));

        const exp = payload.exp;
        const iat = payload.iat;
        const now = Math.floor(Date.now() / 1000);
        const isExpired = exp ? exp < now : false;
        const expiresIn = exp ? formatTimeRemaining(exp - now) : 'Unknown';

        return {
            header,
            payload,
            exp,
            iat,
            isExpired,
            expiresIn,
        };
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

/**
 * Format seconds into human-readable time
 */
const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
};

/**
 * Get information about the access token
 */
export const getAccessTokenInfo = (): TokenInfo => {
    const token = tokenStorage.getAccessToken();

    if (!token) {
        return { exists: false };
    }

    const decoded = decodeJWT(token);

    return {
        exists: true,
        value: token ?? undefined,
        decoded: decoded || undefined,
    };
};

/**
 * Get information about the refresh token
 */
export const getRefreshTokenInfo = (): TokenInfo => {
    const token = tokenStorage.getRefreshToken();

    if (!token) {
        return { exists: false };
    }

    const decoded = decodeJWT(token);

    return {
        exists: true,
        value: token ?? undefined,
        decoded: decoded || undefined,
    };
};

/**
 * Log all token information to console
 */
export const logTokenStatus = (): void => {
    console.group('🔐 Token Status');

    const accessToken = getAccessTokenInfo();
    const refreshToken = getRefreshTokenInfo();
    const userData = tokenStorage.getUserData();

    console.log('Access Token:', accessToken.exists ? '✅ Present' : '❌ Missing');
    if (accessToken.exists && accessToken.decoded) {
        console.log('  - Expired:', accessToken.decoded.isExpired ? '❌ Yes' : '✅ No');
        console.log('  - Expires in:', accessToken.decoded.expiresIn);
        console.log('  - Issued at:', accessToken.decoded.iat ? new Date(accessToken.decoded.iat * 1000).toLocaleString() : 'Unknown');
        console.log('  - Payload:', accessToken.decoded.payload);
    }

    console.log('Refresh Token:', refreshToken.exists ? '✅ Present' : '❌ Missing');
    if (refreshToken.exists && refreshToken.decoded) {
        console.log('  - Expired:', refreshToken.decoded.isExpired ? '❌ Yes' : '✅ No');
        console.log('  - Expires in:', refreshToken.decoded.expiresIn);
        console.log('  - Issued at:', refreshToken.decoded.iat ? new Date(refreshToken.decoded.iat * 1000).toLocaleString() : 'Unknown');
    }

    console.log('User Data:', userData ? '✅ Present' : '❌ Missing');
    if (userData) {
        console.log('  - Data:', userData);
    }

    console.groupEnd();
};

/**
 * Check if tokens need refresh (access token expired but refresh token valid)
 */
export const shouldRefreshToken = (): boolean => {
    const accessToken = getAccessTokenInfo();
    const refreshToken = getRefreshTokenInfo();

    // If no tokens, can't refresh
    if (!accessToken.exists || !refreshToken.exists) {
        return false;
    }

    // If access token is expired but refresh token is valid
    const accessExpired = accessToken.decoded?.isExpired ?? true;
    const refreshExpired = refreshToken.decoded?.isExpired ?? true;

    return accessExpired && !refreshExpired;
};

/**
 * Test token refresh functionality
 */
export const testTokenRefresh = async (): Promise<boolean> => {
    console.log('🔄 Testing token refresh...');

    try {
        const authService = (await import('../services/authService')).default;
        await authService.refreshToken();
        console.log('✅ Token refresh successful');
        logTokenStatus();
        return true;
    } catch (error) {
        console.error('❌ Token refresh failed:', error);
        return false;
    }
};

/**
 * Clear all authentication data
 */
export const clearAllAuthData = (): void => {
    tokenStorage.clearAll();
    console.log('🗑️ All authentication data cleared');
};

// Make debug functions available in console
if (globalThis.window !== undefined) {
    interface WindowWithTokenDebug extends Window {
        tokenDebug?: {
            logStatus: typeof logTokenStatus;
            getAccessToken: typeof getAccessTokenInfo;
            getRefreshToken: typeof getRefreshTokenInfo;
            shouldRefresh: typeof shouldRefreshToken;
            testRefresh: typeof testTokenRefresh;
            clearAuth: typeof clearAllAuthData;
        };
    }

    (globalThis as unknown as WindowWithTokenDebug).tokenDebug = {
        logStatus: logTokenStatus,
        getAccessToken: getAccessTokenInfo,
        getRefreshToken: getRefreshTokenInfo,
        shouldRefresh: shouldRefreshToken,
        testRefresh: testTokenRefresh,
        clearAuth: clearAllAuthData,
    };
}

export default {
    getAccessTokenInfo,
    getRefreshTokenInfo,
    logTokenStatus,
    shouldRefreshToken,
    testTokenRefresh,
    clearAllAuthData,
};
