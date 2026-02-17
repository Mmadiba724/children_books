/**
 * Secure Token Storage
 * - Access token stored in memory (cleared on page refresh)
 * - Refresh token stored in sessionStorage (cleared when tab closes)
 * - More secure than localStorage (reduces XSS attack surface)
 */

class TokenStorage {
    // In-memory storage for access token (most secure)
    private accessToken: string | null = null;

    // Session storage key for refresh token
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';
    private readonly USER_DATA_KEY = 'userData';

    /**
     * Set access token (stored in memory)
     */
    setAccessToken(token: string | null): void {
        this.accessToken = token;
        console.log('Access token stored in memory');
    }

    /**
     * Get access token from memory
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * Set refresh token (stored in sessionStorage)
     */
    setRefreshToken(token: string | null): void {
        if (token) {
            sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
            console.log('Refresh token stored in sessionStorage');
        } else {
            sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
        }
    }

    /**
     * Get refresh token from sessionStorage
     */
    getRefreshToken(): string | null {
        return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Set user data (stored in sessionStorage)
     */
    setUserData(userData: unknown): void {
        if (userData) {
            sessionStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
        } else {
            sessionStorage.removeItem(this.USER_DATA_KEY);
        }
    }

    /**
     * Get user data from sessionStorage
     */
    getUserData(): unknown {
        const data = sessionStorage.getItem(this.USER_DATA_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Clear all tokens and user data
     */
    clearAll(): void {
        this.accessToken = null;
        sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(this.USER_DATA_KEY);

        // Also clear from localStorage (for migration from old implementation)
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');

        console.log('All authentication data cleared');
    }

    /**
     * Check if user is authenticated (has valid tokens)
     */
    isAuthenticated(): boolean {
        return !!(this.accessToken || this.getRefreshToken());
    }

    /**
     * Migrate tokens from localStorage to new storage (for backward compatibility)
     */
    migrateFromLocalStorage(): void {
        // Check if tokens exist in localStorage
        const oldAccessToken = localStorage.getItem('authToken');
        const oldRefreshToken = localStorage.getItem('refreshToken');
        const oldUserData = localStorage.getItem('userData');

        if (oldAccessToken || oldRefreshToken) {
            console.log('Migrating tokens from localStorage to secure storage...');

            if (oldAccessToken) {
                this.setAccessToken(oldAccessToken);
            }

            if (oldRefreshToken) {
                this.setRefreshToken(oldRefreshToken);
            }

            if (oldUserData) {
                try {
                    this.setUserData(JSON.parse(oldUserData));
                } catch {
                    // Invalid JSON, skip
                }
            }

            // Clear from localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');

            console.log('Migration complete');
        }
    }

    /**
     * Initialize storage (run on app startup)
     */
    initialize(): void {
        // Migrate any existing localStorage tokens
        this.migrateFromLocalStorage();

        // If we have a refresh token but no access token, we'll refresh on first API call
        const hasRefreshToken = !!this.getRefreshToken();
        const hasAccessToken = !!this.getAccessToken();

        if (hasRefreshToken && !hasAccessToken) {
            console.log('Refresh token found, access token will be refreshed on next API call');
        }
    }
}

// Export singleton instance
const tokenStorage = new TokenStorage();
export default tokenStorage;
