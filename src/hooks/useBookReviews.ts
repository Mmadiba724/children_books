import { useCallback, useEffect, useState } from "react";
import reviewService, {
  type Review,
  type ReviewInput,
  type ReviewSummary,
} from "../services/reviewService";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 20;

const messageOf = (err: unknown, fallback: string) =>
  (err as { message?: string } | null)?.message || fallback;

/** Reviews, rating summary and the signed-in user's own review for one book. */
export function useBookReviews(bookId: string | undefined) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  // First page of reviews + summary. `quiet` keeps the list on screen while refreshing.
  const load = useCallback(
    async (quiet = false) => {
      if (!bookId) return;
      try {
        if (!quiet) setLoading(true);
        setError(false);
        const data = await reviewService.getBookReviews(bookId, 0, PAGE_SIZE);
        setSummary(data.summary);
        setReviews(data.reviews.content);
        setTotalElements(data.reviews.totalElements);
        setTotalPages(data.reviews.totalPages);
        setPage(0);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [bookId],
  );

  useEffect(() => {
    load();
  }, [load]);

  // The user's own review (only meaningful when signed in)
  useEffect(() => {
    if (!bookId || authLoading) return;
    if (!isAuthenticated) {
      setMyReview(null);
      return;
    }
    let cancelled = false;
    reviewService
      .getMyReview(bookId)
      .then((review) => {
        if (!cancelled) setMyReview(review);
      })
      .catch((err) => {
        console.error("Failed to load your review:", err);
        if (!cancelled) setMyReview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId, isAuthenticated, authLoading]);

  const loadMore = useCallback(async () => {
    if (!bookId || loadingMore || page + 1 >= totalPages) return;
    try {
      setLoadingMore(true);
      const data = await reviewService.getBookReviews(
        bookId,
        page + 1,
        PAGE_SIZE,
      );
      setReviews((cur) => {
        const seen = new Set(cur.map((r) => r.id));
        return [...cur, ...data.reviews.content.filter((r) => !seen.has(r.id))];
      });
      setTotalElements(data.reviews.totalElements);
      setTotalPages(data.reviews.totalPages);
      setPage(page + 1);
    } catch (err) {
      console.error("Failed to load more reviews:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [bookId, loadingMore, page, totalPages]);

  /** Create or update the user's review. Resolves to an error message, or null on success. */
  const save = useCallback(
    async (input: ReviewInput): Promise<string | null> => {
      if (!bookId) return "Missing book";
      try {
        setSaving(true);
        const saved = myReview
          ? await reviewService.updateReview(myReview.id, input)
          : await reviewService.submitReview(bookId, input);
        setMyReview(saved);
        await load(true);
        return null;
      } catch (err) {
        return messageOf(err, "We couldn't save your review. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [bookId, myReview, load],
  );

  /** Delete the user's review. Resolves to an error message, or null on success. */
  const remove = useCallback(async (): Promise<string | null> => {
    if (!myReview) return null;
    try {
      setSaving(true);
      await reviewService.deleteReview(myReview.id);
      setMyReview(null);
      await load(true);
      return null;
    } catch (err) {
      return messageOf(err, "We couldn't delete your review. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [myReview, load]);

  return {
    summary,
    reviews,
    totalElements,
    hasMore: page + 1 < totalPages,
    myReview,
    loading,
    loadingMore,
    error,
    saving,
    reload: () => load(),
    loadMore,
    save,
    remove,
  };
}
