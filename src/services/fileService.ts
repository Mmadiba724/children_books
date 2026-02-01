
import apiClient, { publicRequest } from '../config/api';
import { handleError } from '../utils/errorHandler';

interface FileUploadResponse {
    fileId: string;
    filename: string;
    size: number;
    uploadedAt: string;
}

interface ImageUploadResponse {
    imageId: string;
    filename: string;
    size: number;
    url: string;
    uploadedAt: string;
}

interface SnippetExtractionResponse {
    bookId: string;
    snippetsExtracted: number;
    extractedAt: string;
}


interface BookSnippets {
    bookId: string;
    snippets: string[];
    totalSnippets: number;
}

interface PreSignedUrl {
    url: string;
    expiresAt: string;
}

const fileService = {
    // Upload book file (requires authentication)
    uploadBookFile: async (file: File): Promise<FileUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post('/api/v1/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Upload image (requires authentication)
    uploadImage: async (file: File): Promise<ImageUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post(
                '/api/v1/files/images/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Extract preview snippets (requires authentication)
    extractSnippets: async (
        bookId: string
    ): Promise<SnippetExtractionResponse> => {
        try {
            const response = await apiClient.post(
                `/api/v1/files/books/${bookId}/snippets/extract`
            );
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Read book file online (public endpoint)
    readBookFileOnline: async (fileId: string): Promise<Blob> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/files/${fileId}/read`,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Download book file (public endpoint)
    downloadBookFile: async (fileId: string): Promise<Blob> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/files/${fileId}/download`,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Get snippet image by page number (public endpoint)
    getSnippetImage: async (
        bookId: string,
        pageNumber: number,
        extension: string = 'png'
    ): Promise<Blob> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/files/snippets/${bookId}/page-${pageNumber}.${extension}`,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Get image (public endpoint)
    getImage: async (imageId: string): Promise<Blob> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/files/images/${imageId}`,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Get pre-signed image URL (public endpoint)
    getPreSignedImageUrl: async (imageId: string): Promise<PreSignedUrl> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/files/images/${imageId}/url`,
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Get book preview snippets (public endpoint)
    getBookSnippets: async (bookId: string): Promise<BookSnippets> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/files/books/${bookId}/snippets`,
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Delete book preview snippets (requires authentication)
    deleteBookSnippets: async (bookId: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/v1/files/books/${bookId}/snippets`);
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'FileService' });
        }
    },

    // Helper: Download file and trigger browser download
    downloadFileToClient: (blob: Blob, filename: string): void => {
        const url = globalThis.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        globalThis.URL.revokeObjectURL(url);
    },
};

export default fileService;
