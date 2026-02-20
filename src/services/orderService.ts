
import apiClient from '../config/api';
import { handleError } from '../utils/errorHandler';

export interface OrderItem {
    id?: number;
    bookId: number;
    quantity: number;
    price: number;
    title?: string;
    author?: string;
    subtotal?: number;
}

export interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    status: 'PENDING' | 'PAID' | 'REJECTED';
    totalAmount: number;
    paymentId?: string | null;
    transactionId?: string | null;
    verifiedAt?: string | null;
    verifiedBy?: number | null;
    rejectionReason?: string | null;
    transactionIdMatched?: boolean;
    shippingAddress?: string | null;
    createdAt: string;
    updatedAt: string;
    // Optional fields for admin/extended views
    userEmail?: string;
    paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    trackingNumber?: string;
    estimatedDelivery?: string;
    currency?: string;
}

interface CreateOrderPayload {
    items: Omit<OrderItem, 'id'>[];
    shippingAddress?: string;
    transactionId?: string;
}

interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: Order;
    timestamp: string;
}

interface UpdateOrderPayload {
    status?: string;
    shippingAddress?: string;
    trackingNumber?: string;
}

interface OrdersListResponse {
    success: boolean;
    data?: {
        content: Order[];
        pageable?: {
            pageNumber: number;
            pageSize: number;
        };
        totalPages?: number;
        totalElements?: number;
    };
    timestamp?: string;
}

interface OrderStatusUpdate {
    status: string;
    updatedAt: string;
    message?: string;
}

const orderService = {
    // Create a new order (requires authentication)
    // Creates order with PENDING status and PENDING payment status
    createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
        try {
            const response = await apiClient.post('/api/v1/orders', payload);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Get order by ID (requires authentication)
    getOrderById: async (orderId: number): Promise<Order> => {
        try {
            const response = await apiClient.get(`/api/v1/orders/${orderId}`);
            return response.data.data || response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Get user's orders (requires authentication)
    getMyOrders: async (limit?: number, offset?: number): Promise<OrdersListResponse> => {
        try {
            const response = await apiClient.get('/api/v1/orders/my', {
                params: {
                    ...(limit && { limit }),
                    ...(offset && { offset }),
                },
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Update order (requires authentication)
    updateOrder: async (
        orderId: number,
        payload: UpdateOrderPayload
    ): Promise<Order> => {
        try {
            const response = await apiClient.put(`/api/v1/orders/${orderId}`, payload);
            return response.data.data || response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Cancel order (requires authentication)
    cancelOrder: async (orderId: number): Promise<OrderStatusUpdate> => {
        try {
            const response = await apiClient.post(`/api/v1/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Get order status (requires authentication)
    getOrderStatus: async (orderId: number): Promise<OrderStatusUpdate> => {
        try {
            const response = await apiClient.get(`/api/v1/orders/${orderId}/status`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Confirm order payment (requires authentication)
    confirmPayment: async (orderId: number, transactionId: string): Promise<Order> => {
        try {
            const response = await apiClient.post(`/api/v1/orders/${orderId}/confirm-payment`, {
                transactionId,
            });
            return response.data.data || response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Get order tracking (requires authentication)
    getOrderTracking: async (orderId: number): Promise<{
        status: string;
        trackingNumber?: string;
        estimatedDelivery?: string;
        lastUpdate?: string;
    }> => {
        try {
            const response = await apiClient.get(`/api/v1/orders/${orderId}/tracking`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // ===== ADMIN ENDPOINTS =====

    // Get pending orders (requires admin authentication)
    getPendingOrders: async (): Promise<Order[]> => {
        try {
            const response = await apiClient.get('/api/v1/admin/orders/pending');
            // API returns { success, data: Order[], timestamp }
            return response.data.data || response.data || [];
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Approve order (requires admin authentication)
    approveOrder: async (orderId: number): Promise<Order> => {
        try {
            const response = await apiClient.post(`/api/v1/admin/orders/${orderId}/approve`);
            return response.data.data || response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Reject order (requires admin authentication)
    rejectOrder: async (orderId: number): Promise<Order> => {
        try {
            const response = await apiClient.post(`/api/v1/admin/orders/${orderId}/reject`);
            return response.data.data || response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },
};

export default orderService;
