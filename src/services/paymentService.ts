
import apiClient, { publicRequest } from '../config/api';
import { handleError } from '../utils/errorHandler';

interface Payment {
    id: string;
    orderId: string;
    transactionId?: string;
    paymentGateway: string;
    amount: number;
    currency?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    createdAt: string;
    updatedAt?: string;
}

interface InitiatePaymentPayload {
    orderId: string;
    paymentGateway: string;
    amount?: number;
}

interface InitiatePaymentResponse {
    paymentId: string;
    orderId: string;
    status: string;
    paymentUrl?: string;
    createdAt: string;
}

interface WebhookPayload {
    transactionId: string;
    success: boolean;
    orderId?: string;
    amount?: number;
    metadata?: Record<string, string | number | boolean>;
}

interface WebhookResponse {
    success: boolean;
    message: string;
}

interface AddTransactionIdPayload {
    transactionId: string;
}

interface AddTransactionIdResponse {
    success: boolean;
    message: string;
    data?: unknown;
    error?: string;
    traceId?: string;
    timestamp?: string;
}

const paymentService = {
    // Initiate a payment (requires authentication)
    initiatePayment: async (
        payload: InitiatePaymentPayload
    ): Promise<InitiatePaymentResponse> => {
        try {
            const response = await apiClient.post(
                '/api/v1/payments/initiate',
                payload
            );
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Payment webhook handler (public endpoint)
    // This is called by payment gateway to notify payment status
    handlePaymentWebhook: async (payload: WebhookPayload): Promise<WebhookResponse> => {
        try {
            const response = await publicRequest({
                method: 'POST',
                url: '/api/v1/payments/webhook',
                data: {
                    transactionId: payload.transactionId,
                    success: payload.success,
                    ...(payload.orderId && { orderId: payload.orderId }),
                    ...(payload.amount && { amount: payload.amount }),
                    ...(payload.metadata && { metadata: payload.metadata }),
                },
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Get payment by ID (requires authentication)
    getPaymentById: async (paymentId: string): Promise<Payment> => {
        try {
            const response = await apiClient.get(`/api/v1/payments/${paymentId}`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Get payments for an order (requires authentication)
    getPaymentsByOrderId: async (orderId: string): Promise<Payment[]> => {
        try {
            const response = await apiClient.get(`/api/v1/payments/order/${orderId}`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Cancel a payment (requires authentication)
    cancelPayment: async (paymentId: string): Promise<Payment> => {
        try {
            const response = await apiClient.post(
                `/api/v1/payments/${paymentId}/cancel`
            );
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Refund a payment (requires authentication)
    refundPayment: async (
        paymentId: string,
        amount?: number
    ): Promise<Payment> => {
        try {
            const response = await apiClient.post(`/api/v1/payments/${paymentId}/refund`, {
                ...(amount && { amount }),
            });
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Verify payment status (requires authentication)
    verifyPayment: async (paymentId: string): Promise<Payment> => {
        try {
            const response = await apiClient.get(
                `/api/v1/payments/${paymentId}/verify`
            );
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Check payment status (requires authentication)
    getPaymentStatus: async (paymentId: string): Promise<{ status: string }> => {
        try {
            const response = await apiClient.get(`/api/v1/payments/${paymentId}/status`);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },

    // Add transaction ID (requires admin authentication)
    // Stores a transaction ID received from mobile money for auto-matching with orders
    addTransactionId: async (payload: AddTransactionIdPayload): Promise<AddTransactionIdResponse> => {
        try {
            const response = await apiClient.post('/api/v1/admin/transaction-ids', payload);
            return response.data;
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'PaymentService' });
        }
    },
};

export default paymentService;
export type { AddTransactionIdPayload, AddTransactionIdResponse };
