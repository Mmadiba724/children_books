import apiClient, { publicRequest } from "../config/api";
import { handleError } from "../utils/errorHandler";

export interface Review {
  id: number;
  bookId: number;
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  bookId: number;
  averageRating: number;
  reviewCount: number;
}

export interface ReviewPage {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BookReviews {
  summary: ReviewSummary;
  reviews: ReviewPage;
}

export interface ReviewInput {
  rating: number;
  comment: string;
}

const emptyPage = (size: number): ReviewPage => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size,
});

// Responses are wrapped as { success, message, data }; tolerate a bare body too.
// A `data: null` must stay null, not fall back to the wrapper itself.
const unwrap = <T>(body: unknown): T =>
  (body !== null && typeof body === "object" && "data" in body
    ? (body as { data: unknown }).data
    : body) as T;

const reviewService = {
  // Public: reviews for a book plus the rating summary
  getBookReviews: async (
    bookId: number | string,
    page = 0,
    size = 20,
  ): Promise<BookReviews> => {
    try {
      const response = await publicRequest({
        method: "GET",
        url: `/api/v1/books/${bookId}/reviews`,
        params: { page, size },
      });
      const data = unwrap<Partial<BookReviews> | null>(response.data);
      return {
        summary: data?.summary ?? {
          bookId: Number(bookId),
          averageRating: 0,
          reviewCount: 0,
        },
        reviews: data?.reviews ?? emptyPage(size),
      };
    } catch (error) {
      throw handleError(error as Error, { serviceName: "ReviewService" });
    }
  },

  // Public: rating summary only
  getSummary: async (bookId: number | string): Promise<ReviewSummary> => {
    try {
      const response = await publicRequest({
        method: "GET",
        url: `/api/v1/books/${bookId}/reviews/summary`,
      });
      return unwrap<ReviewSummary>(response.data);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "ReviewService" });
    }
  },

  // Auth: the signed-in user's review of a book, or null
  getMyReview: async (bookId: number | string): Promise<Review | null> => {
    try {
      const response = await apiClient.get(
        `/api/v1/books/${bookId}/reviews/me`,
      );
      const review = unwrap<Partial<Review> | null>(response.data);
      // Anything without an id (null, {}, a bare wrapper) means "no review yet".
      return review && review.id != null ? (review as Review) : null;
    } catch (error) {
      throw handleError(error as Error, { serviceName: "ReviewService" });
    }
  },

  // Auth: create, or update if the user already reviewed this book (upsert)
  submitReview: async (
    bookId: number | string,
    input: ReviewInput,
  ): Promise<Review> => {
    try {
      const response = await apiClient.post(
        `/api/v1/books/${bookId}/reviews`,
        input,
      );
      return unwrap<Review>(response.data);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "ReviewService" });
    }
  },

  // Auth: update a review by id
  updateReview: async (id: number, input: ReviewInput): Promise<Review> => {
    try {
      const response = await apiClient.put(`/api/v1/reviews/${id}`, input);
      return unwrap<Review>(response.data);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "ReviewService" });
    }
  },

  // Auth: delete a review by id
  deleteReview: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/reviews/${id}`);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "ReviewService" });
    }
  },

  // Auth: every review the user has written
  getMyReviews: async (page = 0, size = 20): Promise<ReviewPage> => {
    try {
      const response = await apiClient.get("/api/v1/reviews/me", {
        params: { page, size },
      });
      return unwrap<ReviewPage | null>(response.data) ?? emptyPage(size);
    } catch (error) {
      throw handleError(error as Error, { serviceName: "ReviewService" });
    }
  },
};

export default reviewService;
