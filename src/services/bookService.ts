
import apiClient, { publicRequest } from '../config/api';
import { handleError } from '../utils/errorHandler';
import type { Book } from '../types/book';

interface ApiResponse<T> {
    success: boolean;
    data: {
        content: T[];
        pageable?: Record<string, string | number | boolean>;
        totalPages?: number;
        totalElements?: number;
        last?: boolean;
        numberOfElements?: number;
        first?: boolean;
        size?: number;
        number?: number;
    };
    timestamp?: string;
}

interface CreateBookPayload {
    title: string;
    author: string;
    description?: string;
    isbn?: string;
    categoryId?: string;
    categoryIds?: number[];
    price?: number;
    format?: string;
    coverImageId?: string;
    coverImageUrl?: string;
    fileId?: string | null;
    stockQuantity?: number;
    publishedDate?: string;
}

interface UpdateBookPayload {
    title?: string;
    author?: string;
    description?: string;
    isbn?: string;
    categoryId?: string;
    price?: number;
    format?: string;
    stockQuantity?: number;
    coverImageId?: string;
    fileId?: string;
    publishedDate?: string;
}

interface SearchBooksParams {
    query?: string;
    categoryId?: string;
    author?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'title' | 'author' | 'price' | 'rating' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

interface SearchBooksResponse {
    books: Book[];
    total: number;
    limit: number;
    offset: number;
}

const bookService = {
    // Get all books (public endpoint)
    getAllBooks: async (limit?: number, offset?: number): Promise<Book[]> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: '/api/v1/books/all',
                params: {
                    ...(limit && { limit }),
                    ...(offset && { offset }),
                },
            });
            const apiResponse = response.data as ApiResponse<Book>;
            return apiResponse.data?.content || [];
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'BookService' });
        }
    },

    // Search books (public endpoint)
    searchBooks: async (params: SearchBooksParams): Promise<SearchBooksResponse> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: '/api/v1/books',
                params,
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'BookService' });
        }
    },

    // Get book by ID (public endpoint)
    getBookById: async (id: string | number): Promise<Book> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/books/${id}`,
            });
            const apiResponse = response.data as { success: boolean; data: Book; timestamp: string };
            return apiResponse.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'BookService' });
        }
    },

    // Create a new book (requires authentication)
    createBook: async (payload: CreateBookPayload): Promise<Book> => {
        try {
            console.log("BookService - Sending create book request with payload:", payload);
            const response = await apiClient.post('/api/v1/books', payload);
            console.log("BookService - Create book response:", response.data);
            return response.data;
        } catch (error) {
            console.error("BookService - Create book error:", error);
            throw handleError(error as Error, { serviceName: 'BookService' });
        }
    },

    // Update a book (requires authentication)
    updateBook: async (id: string, payload: UpdateBookPayload): Promise<Book> => {
        try {
            const response = await apiClient.put(`/api/v1/books/${id}`, payload);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'BookService' });
        }
    },

    // Delete a book (requires authentication)
    deleteBook: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/v1/books/${id}`);
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'BookService' });
        }
    },
};

export default bookService;
export type { ApiResponse, CreateBookPayload, UpdateBookPayload, SearchBooksParams, SearchBooksResponse };
