/**
 * Guest Session Manager
 * Manages guest user sessions for cart persistence before authentication
 */

const GUEST_TOKEN_KEY = 'guest_session_token';
const GUEST_ID_KEY = 'guest_id';

/**
 * Generate a unique guest identifier
 */
function generateGuestId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a guest session token (can be used for backend API calls)
 */
function generateGuestToken(): string {
    return `gst_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

const guestSessionManager = {
    /**
     * Initialize a guest session if one doesn't exist
     */
    initGuestSession(): { guestId: string; guestToken: string } {
        let guestId = localStorage.getItem(GUEST_ID_KEY);
        let guestToken = localStorage.getItem(GUEST_TOKEN_KEY);

        if (!guestId || !guestToken) {
            guestId = generateGuestId();
            guestToken = generateGuestToken();

            localStorage.setItem(GUEST_ID_KEY, guestId);
            localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
        }

        return { guestId, guestToken };
    },

    /**
     * Get the current guest ID
     */
    getGuestId(): string | null {
        return localStorage.getItem(GUEST_ID_KEY);
    },

    /**
     * Get the current guest token
     */
    getGuestToken(): string | null {
        return localStorage.getItem(GUEST_TOKEN_KEY);
    },

    /**
     * Check if a guest session exists
     */
    hasGuestSession(): boolean {
        return Boolean(this.getGuestId() && this.getGuestToken());
    },

    /**
     * Clear guest session (call this after user logs in or registers)
     */
    clearGuestSession(): void {
        localStorage.removeItem(GUEST_ID_KEY);
        localStorage.removeItem(GUEST_TOKEN_KEY);
    },

    /**
     * Get guest session info for API calls
     */
    getGuestSessionInfo(): { guestId: string; guestToken: string } | null {
        const guestId = this.getGuestId();
        const guestToken = this.getGuestToken();

        if (guestId && guestToken) {
            return { guestId, guestToken };
        }

        return null;
    },
};

export default guestSessionManager;
