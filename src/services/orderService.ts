
import apiClient from '../config/api';
import { handleError } from '../utils/errorHandler';

interface OrderItem {
    bookId: string;
    title?: string;
    author?: string;
    quantity: number;
    price?: number;
    subtotal?: number;
}

interface Order {
    id: string | number;
    userId: string | number;
    userEmail?: string;
    items: OrderItem[];
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId?: string | null;
    totalAmount: number;
    currency?: string;
    shippingAddress?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt?: string;
    estimatedDelivery?: string;
}

interface CreateOrderPayload {
    items: OrderItem[];
    shippingAddress?: string;
}

interface CreateOrderResponse {
    success: boolean;
    status: string;
    data: Order;
    paymentStatus: string;
    transactionId?: string;
    lineItems: OrderItem[];
}

interface UpdateOrderPayload {
    status?: string;
    shippingAddress?: string;
    trackingNumber?: string;
}

interface OrdersListResponse {
    success: boolean;
    data: Order[];
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
    getOrderById: async (orderId: string): Promise<Order> => {
        try {
            const response = await apiClient.get(`/api/v1/orders/${orderId}`);
            return response.data;
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
        orderId: string,
        payload: UpdateOrderPayload
    ): Promise<Order> => {
        try {
            const response = await apiClient.put(`/api/v1/orders/${orderId}`, payload);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Cancel order (requires authentication)
    cancelOrder: async (orderId: string): Promise<OrderStatusUpdate> => {
        try {
            const response = await apiClient.post(`/api/v1/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Get order status (requires authentication)
    getOrderStatus: async (orderId: string): Promise<OrderStatusUpdate> => {
        try {
            const response = await apiClient.get(`/api/v1/orders/${orderId}/status`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Confirm order payment (requires authentication)
    confirmPayment: async (orderId: string, transactionId: string): Promise<Order> => {
        try {
            const response = await apiClient.post(`/api/v1/orders/${orderId}/confirm-payment`, {
                transactionId,
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Get order tracking (requires authentication)
    getOrderTracking: async (orderId: string): Promise<{
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
    approveOrder: async (orderId: string): Promise<Order> => {
        try {
            const response = await apiClient.post(`/api/v1/admin/orders/${orderId}/approve`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },

    // Reject order (requires admin authentication)
    rejectOrder: async (orderId: string): Promise<Order> => {
        try {
            const response = await apiClient.post(`/api/v1/admin/orders/${orderId}/reject`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'OrderService' });
        }
    },
};

export default orderService;
