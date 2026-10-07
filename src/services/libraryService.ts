
import apiClient from '../config/api';
import { handleError } from '../utils/errorHandler';

export interface LibraryBook {
    id: number;
    bookId: number;
    bookTitle: string;
    bookAuthor: string;
    coverImageUrl: string | null;
    purchasedAt: string;
}

interface LibraryResponse {
    success: boolean;
    data: LibraryBook[];
    timestamp: string;
}

// Short-lived reader session for the in-app iframe viewer. Digital books are
// read online only: downloadAllowed is false and no download endpoint is used.
export interface ReaderSession {
    bookId: number;
    format: string;
    /** Path relative to the API base, carries a short-lived token. */
    iframeEmbedUrl: string;
    expiresInSeconds: number;
    displayMode: string;
    downloadAllowed: boolean;
}

// Lifetime (exp - iat, in seconds) of the JWT carried in a read URL's ?token=,
// or null if it can't be read. Only used to drive the session countdown.
function tokenLifetimeSeconds(url: string): number | null {
    try {
        const token = new URL(url, 'http://localhost').searchParams.get('token');
        const payload = token?.split('.')[1];
        if (!payload) return null;
        const json = JSON.parse(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
        ) as { exp?: number; iat?: number };
        if (typeof json.exp !== 'number' || typeof json.iat !== 'number') return null;
        const lifetime = json.exp - json.iat;
        return lifetime > 0 ? lifetime : null;
    } catch {
        return null;
    }
}

const libraryService = {
    // Get user's library (requires authentication)
    // Returns all purchased books accessible to the user
    getMyLibrary: async (): Promise<LibraryBook[]> => {
        try {
            const response = await apiClient.get<LibraryResponse>('/api/v1/library');
            return response.data.data || [];
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'LibraryService' });
        }
    },

    // Start a reader session for a purchased book (requires authentication)
    getReadSession: async (bookId: string | number): Promise<ReaderSession> => {
        try {
            const response = await apiClient.get(`/api/v1/library/${bookId}/read`);
            const data = response.data?.data ?? response.data;

            // Some deployments still return just the embed path as a string:
            // { success, data: "/api/v1/files/.../read?token=..." }
            if (typeof data === 'string' && data) {
                return {
                    bookId: Number(bookId),
                    format: 'DIGITAL',
                    iframeEmbedUrl: data,
                    expiresInSeconds: tokenLifetimeSeconds(data) ?? 600,
                    displayMode: 'iframe',
                    downloadAllowed: false,
                };
            }

            // Full reader-session object
            const session = data as Partial<ReaderSession> | null;
            if (!session || typeof session !== 'object' || !session.iframeEmbedUrl) {
                throw new Error('Reader session unavailable');
            }
            return {
                bookId: session.bookId ?? Number(bookId),
                format: session.format ?? 'DIGITAL',
                iframeEmbedUrl: session.iframeEmbedUrl,
                expiresInSeconds:
                    session.expiresInSeconds ?? tokenLifetimeSeconds(session.iframeEmbedUrl) ?? 600,
                displayMode: session.displayMode ?? 'iframe',
                downloadAllowed: session.downloadAllowed ?? false,
            };
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'LibraryService' });
        }
    },

    // Check if book is in library (requires authentication)
    isBookInLibrary: async (bookId: number): Promise<boolean> => {
        try {
            const library = await libraryService.getMyLibrary();
            return library.some(book => book.bookId === bookId);
        } catch (error) {
            handleError(error as Error, { serviceName: 'LibraryService' });
            return false;
        }
    },

    // Get library book by ID (requires authentication)
    getLibraryBook: async (bookId: number): Promise<LibraryBook | null> => {
        try {
            const library = await libraryService.getMyLibrary();
            return library.find(book => book.bookId === bookId) || null;
        } catch (error) {
            handleError(error as Error, { serviceName: 'LibraryService' });
            return null;
        }
    },
};

export default libraryService;
