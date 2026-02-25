
import apiClient, { API_BASE_URL } from '../config/api';
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

interface BookAccessUrl {
    url: string;
    expiresAt?: string;
    format?: string;
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

    // Get book read URL (requires authentication)
    // Returns a URL to read/view the book online
    getBookReadUrl: async (bookId: string): Promise<BookAccessUrl> => {
        try {
            const response = await apiClient.get(`/api/v1/library/${bookId}/read`);
            // API returns path in data field: { success, data: "/api/v1/files/.../read", timestamp }
            const path = response.data.data;
            if (typeof path === 'string') {
                return { url: `${API_BASE_URL}${path}` };
            }
            // Fallback for different response structure
            return response.data.data || response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'LibraryService' });
        }
    },

    // Get book download URL (requires authentication)
    // Returns a URL to download the book file
    getBookDownloadUrl: async (bookId: string): Promise<BookAccessUrl> => {
        try {
            const response = await apiClient.get(`/api/v1/library/${bookId}/download`);
            // API returns path in data field: { success, data: "/api/v1/files/.../download", timestamp }
            const path = response.data.data;
            if (typeof path === 'string') {
                return { url: `${API_BASE_URL}${path}` };
            }
            // Fallback for different response structure
            return response.data.data || response.data;
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
