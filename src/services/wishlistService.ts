import apiClient from "../config/api";
import { handleError } from "../utils/errorHandler";

export interface WishlistItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  price: number;
  format: string;
  coverImageUrl: string | null;
  createdAt: string;
}

export interface Wishlist {
  userId: number;
  items: WishlistItem[];
}

// Responses are wrapped as { success, message, data } like the rest of the API;
// tolerate an unwrapped body too.
function unwrap(body: unknown): Wishlist {
  const record = body as { data?: unknown } | null;
  const data = (record?.data ?? body) as Partial<Wishlist> | null;
  return {
    userId: data?.userId ?? 0,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

const wishlistService = {
  // Get the signed-in user's wishlist
  getWishlist: async (): Promise<Wishlist> => {
    try {
      const response = await apiClient.get("/api/v1/wishlist");
      return unwrap(response.data);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "WishlistService" });
    }
  },

  // Add a book (idempotent) and return the updated wishlist
  addToWishlist: async (bookId: number): Promise<Wishlist> => {
    try {
      const response = await apiClient.post("/api/v1/wishlist/items", {
        bookId,
      });
      return unwrap(response.data);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "WishlistService" });
    }
  },

  // Remove by wishlist item id
  removeItem: async (itemId: number): Promise<Wishlist> => {
    try {
      const response = await apiClient.delete(
        `/api/v1/wishlist/items/${itemId}`,
      );
      return unwrap(response.data);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "WishlistService" });
    }
  },

  // Remove by book id, for when only the book is known
  removeByBook: async (bookId: number): Promise<Wishlist> => {
    try {
      const response = await apiClient.delete(
        `/api/v1/wishlist/items/by-book/${bookId}`,
      );
      return unwrap(response.data);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "WishlistService" });
    }
  },

  // Move a wishlist item into the cart
  moveToCart: async (itemId: number, quantity = 1): Promise<void> => {
    try {
      await apiClient.post(`/api/v1/wishlist/items/${itemId}/move-to-cart`, {
        quantity,
      });
    } catch (error) {
      throw handleError(error as Error, { serviceName: "WishlistService" });
    }
  },
};

export default wishlistService;
