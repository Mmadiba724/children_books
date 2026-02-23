
import apiClient from '../config/api';
import { handleError } from '../utils/errorHandler';

export interface User {
    id: number | string;
    email: string;
    name?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UsersListResponse {
    success: boolean;
    data?: {
        content: User[];
        pageable?: {
            pageNumber: number;
            pageSize: number;
        };
        totalPages?: number;
        totalElements?: number;
        last?: boolean;
        first?: boolean;
        size?: number;
        number?: number;
    };
    message?: string;
    error?: string;
    traceId?: string;
    timestamp?: string;
}

const userService = {
    // Get all users (requires admin authentication)
    getAllUsers: async (page?: number, size?: number): Promise<UsersListResponse> => {
        try {
            const params: { page?: number; size?: number } = {};
            if (page !== undefined) params.page = page;
            if (size !== undefined) params.size = size;

            const response = await apiClient.get('/api/v1/admin/users', { params });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'UserService' });
        }
    },
};

export default userService;

