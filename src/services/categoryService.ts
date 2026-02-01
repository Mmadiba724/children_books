
import apiClient, { publicRequest } from '../config/api';
import { handleError } from '../utils/errorHandler';

interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CreateCategoryPayload {
    name: string;
    description?: string;
}

interface UpdateCategoryPayload {
    name?: string;
    description?: string;
}

const categoryService = {
    // Get all categories (public endpoint)
    getAllCategories: async (): Promise<Category[]> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: '/api/v1/categories',
            });
            // Extract categories from nested data structure
            return response.data?.data || response.data || [];
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CategoryService' });
        }
    },

    // Get category by ID (public endpoint)
    getCategoryById: async (id: string): Promise<Category> => {
        try {
            const response = await publicRequest({
                method: 'GET',
                url: `/api/v1/categories/${id}`,
            });
            return response.data?.data || response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CategoryService' });
        }
    },

    // Create a new category (requires authentication)
    createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
        try {
            const response = await apiClient.post('/api/v1/categories', payload);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CategoryService' });
        }
    },

    // Update a category (requires authentication)
    updateCategory: async (
        id: string,
        payload: UpdateCategoryPayload
    ): Promise<Category> => {
        try {
            const response = await apiClient.put(
                `/api/v1/categories/${id}`,
                payload
            );
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CategoryService' });
        }
    },

    // Delete a category (requires authentication)
    deleteCategory: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/v1/categories/${id}`);
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CategoryService' });
        }
    },
};

export default categoryService;
export type { Category };
