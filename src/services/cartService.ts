import apiClient from '../config/api';
import { handleError } from '../utils/errorHandler';
import type { Book } from '../types/book';

// API Response Wrapper
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error?: string;
    traceId?: string;
    timestamp: string;
}

// Cart Types
export interface CartItem {
    id: string | number;
    bookId: string | number;
    book: Book;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface Cart {
    id: string | number;
    userId: string | number;
    items: CartItem[];
    totalItems: number;
    subtotal: number;
    createdAt: string;
    updatedAt: string;
}

// Request Types
interface AddToCartRequest {
    bookId: string | number;
    quantity: number;
}

interface UpdateCartItemRequest {
    quantity: number;
}

const cartService = {
    // Get current user's cart (requires authentication)
    getCart: async (): Promise<Cart> => {
        try {
            const response = await apiClient.get<ApiResponse<Cart>>(
                '/api/v1/cart'
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error || response.data.message || 'Failed to get cart');
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CartService' });
        }
    },

    // Add item to cart (requires authentication)
    addToCart: async (bookId: string | number, quantity: number = 1): Promise<CartItem> => {
        try {
            const payload: AddToCartRequest = {
                bookId,
                quantity,
            };

            const response = await apiClient.post<ApiResponse<CartItem>>(
                '/api/v1/cart/items',
                payload
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error || response.data.message || 'Failed to add item to cart');
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CartService' });
        }
    },

    // Update cart item quantity (requires authentication)
    updateCartItem: async (itemId: string | number, quantity: number): Promise<CartItem> => {
        try {
            const payload: UpdateCartItemRequest = {
                quantity,
            };

            const response = await apiClient.put<ApiResponse<CartItem>>(
                `/api/v1/cart/items/${itemId}`,
                payload
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.error || response.data.message || 'Failed to update cart item');
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CartService' });
        }
    },

    // Remove item from cart (requires authentication)
    removeFromCart: async (itemId: string | number): Promise<void> => {
        try {
            const response = await apiClient.delete<ApiResponse<void>>(
                `/api/v1/cart/items/${itemId}`
            );

            if (!response.data.success) {
                throw new Error(response.data.error || response.data.message || 'Failed to remove item from cart');
            }
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CartService' });
        }
    },

    // Clear cart (helper method - removes all items)
    clearCart: async (cart: Cart): Promise<void> => {
        try {
            // Remove each item from the cart
            await Promise.all(
                cart.items.map(item => cartService.removeFromCart(item.id))
            );
        } catch (error) {
            throw handleError(error as Error, { serviceName: 'CartService' });
        }
    },
};

export default cartService;
