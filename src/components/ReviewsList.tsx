import { useState } from "react";
import { CloudOff, Loader2, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatLocalDateLong } from "../utils/dateUtils";
import type { Review } from "../services/reviewService";
import RatingStars from "./ui/RatingStars";

type ReviewsListProps = {
  readonly reviews: readonly Review[];
  readonly myReview: Review | null;
  readonly loading: boolean;
  readonly error: boolean;
  readonly hasMore: boolean;
  readonly loadingMore: boolean;
  readonly saving: boolean;
  readonly onLoadMore: () => void;
  readonly onRetry: () => void;
  readonly onEdit: () => void;
  /** Resolves to an error message, or null when deleted. */
  readonly onDelete: () => Promise<string | null>;
};

const reviewerName = (r: Review) =>
  [r.firstName, r.lastName].filter(Boolean).join(" ") || "Reader";

function ReviewCard({
  review,
  mine,
  saving,
  onEdit,
  onDelete,
}: {
  readonly review: Review;
  readonly mine: boolean;
  readonly saving: boolean;
  readonly onEdit: () => void;
  readonly onDelete: () => Promise<string | null>;
}) {
  const [confirming, setConfirming] = useState(false);
  const name = reviewerName(review);
  const edited =
    review.updatedAt &&
    new Date(review.updatedAt).getTime() -
      new Date(review.createdAt).getTime() >
      60_000;

  const confirmDelete = async () => {
    const error = await onDelete();
    if (error) toast.error(error);
    else {
      toast.success("Your review was deleted");
      setConfirming(false);
    }
  };

  return (
    <li
      className={`kb-card p-5 sm:p-6 ${mine ? "border-brand/40 ring-1 ring-brand/20" : ""}`}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-lg font-bold text-brand-dark"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-extrabold text-ink">{name}</p>
            <RatingStars value={review.rating} size="sm" />
            {mine && (
              <span className="kb-badge bg-brand-light text-brand-dark">
                Your review
              </span>
            )}
          </div>
          <p className="text-xs text-muted">
            {formatLocalDateLong(review.createdAt)}
            {edited && " · edited"}
          </p>
          {review.comment && (
            <p className="mt-2 leading-relaxed whitespace-pre-line text-ink-soft">
              {review.comment}
            </p>
          )}

          {mine && !confirming && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="kb-btn kb-btn-secondary kb-btn-sm"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="kb-btn kb-btn-quiet kb-btn-sm"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          )}

          {mine && confirming && (
            <div
              role="alertdialog"
              aria-label="Confirm delete"
              className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-error-light px-4 py-3"
            >
              <p className="text-sm font-bold text-error">
                Delete your review?
              </p>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={saving}
                className="kb-btn kb-btn-primary kb-btn-sm"
              >
                {saving && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={saving}
                className="kb-btn kb-btn-secondary kb-btn-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function ReviewsList({
  reviews,
  myReview,
  loading,
  error,
  hasMore,
  loadingMore,
  saving,
  onLoadMore,
  onRetry,
  onEdit,
  onDelete,
}: Readonly<ReviewsListProps>) {
  if (loading) {
    return (
      <ul className="space-y-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="kb-card flex gap-4 p-5">
            <div className="kb-skeleton h-11 w-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="kb-skeleton h-4 w-1/3" />
              <div className="kb-skeleton h-3 w-1/4" />
              <div className="kb-skeleton h-4 w-full" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div role="alert" className="kb-card p-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-error-light text-error">
          <CloudOff className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-xl font-bold">
          We couldn't load the reviews
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="kb-btn kb-btn-primary mt-4"
        >
          Try again
        </button>
      </div>
    );
  }

  // Pin the user's own review first; avoid showing it twice
  const others = reviews.filter((r) => r.id !== myReview?.id);

  if (!myReview && others.length === 0) {
    return (
      <div className="kb-card p-8 text-center">
        <p className="font-display text-xl font-bold">No reviews yet</p>
        <p className="mt-1 text-ink-soft">
          Read it with your little one? Tell other families what you thought.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {myReview && (
          <ReviewCard
            key={`mine-${myReview.id}`}
            review={myReview}
            mine
            saving={saving}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
        {others.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            mine={false}
            saving={false}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="kb-btn kb-btn-secondary"
          >
            {loadingMore && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Load more reviews
          </button>
        </div>
      )}
    </>
  );
}
