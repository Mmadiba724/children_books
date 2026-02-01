
import apiClient from '../config/api';
import { handleError } from '../utils/errorHandler';

interface LibraryBook {
    id: string;
    bookId: string;
    title: string;
    author: string;
    coverImageId?: string;
    purchaseDate: string;
    accessedDate?: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';
    expiryDate?: string;
}

interface LibraryResponse {
    books: LibraryBook[];
    total: number;
    limit?: number;
    offset?: number;
}

interface BookAccessUrl {
    url: string;
    expiresAt?: string;
    format?: string;
}

const libraryService = {
    // Get user's library (requires authentication)
    // Returns all purchased books accessible to the user
    getMyLibrary: async (limit?: number, offset?: number): Promise<LibraryResponse> => {
        try {
            const response = await apiClient.get('/api/v1/library', {
                params: {
                    ...(limit && { limit }),
                    ...(offset && { offset }),
                },
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'LibraryService' });
        }
    },

    // Get book read URL (requires authentication)
    // Returns a URL to read/view the book online
    getBookReadUrl: async (bookId: string): Promise<BookAccessUrl> => {
        try {
            const response = await apiClient.get(`/api/v1/library/${bookId}/read`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'LibraryService' });
        }
    },

    // Get book download URL (requires authentication)
    // Returns a URL to download the book file
    getBookDownloadUrl: async (bookId: string): Promise<BookAccessUrl> => {
        try {
            const response = await apiClient.get(`/api/v1/library/${bookId}/download`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'LibraryService' });
        }
    },

    // Check if book is in library (requires authentication)
    isBookInLibrary: async (bookId: string): Promise<boolean> => {
        try {
            const library = await libraryService.getMyLibrary();
            return library.books.some(book => book.bookId === bookId);
        } catch (error) {
            handleError(error as Error, { serviceName: 'LibraryService' });
            return false;
        }
    },

    // Get library book by ID (requires authentication)
    getLibraryBook: async (bookId: string): Promise<LibraryBook | null> => {
        try {
            const library = await libraryService.getMyLibrary();
            return library.books.find(book => book.bookId === bookId) || null;
        } catch (error) {
            handleError(error as Error, { serviceName: 'LibraryService' });
            return null;
        }
    },
};

export default libraryService;
