import { useState } from "react";
import { Loader2 } from "lucide-react";
import RatingInput from "./ui/RatingInput";
import type { ReviewInput } from "../services/reviewService";

const MAX_COMMENT = 1000;

type ReviewFormProps = {
  readonly initial?: { rating: number; comment?: string | null } | null;
  readonly saving: boolean;
  /** Resolves to an error message, or null when the review was saved. */
  readonly onSubmit: (input: ReviewInput) => Promise<string | null>;
  readonly onCancel: () => void;
};

export default function ReviewForm({
  initial,
  saving,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const editing = Boolean(initial);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [ratingError, setRatingError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setRatingError("Please choose a star rating.");
      return;
    }
    setRatingError("");
    setSubmitError("");
    const error = await onSubmit({ rating, comment: comment.trim() });
    if (error) setSubmitError(error);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-4 rounded-2xl bg-cream-deep/60 p-4 sm:p-5"
    >
      <div>
        <p id="review-rating-label" className="mb-1 text-sm font-bold text-ink">
          Your rating <span className="text-error">*</span>
        </p>
        <RatingInput
          value={rating}
          onChange={(v) => {
            setRating(v);
            setRatingError("");
          }}
          label="Your rating"
          disabled={saving}
        />
        {ratingError && (
          <p role="alert" className="mt-1 text-sm font-bold text-error">
            {ratingError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-1 block text-sm font-bold text-ink"
        >
          Your review <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={MAX_COMMENT}
          rows={4}
          disabled={saving}
          placeholder="What did you and your little one think?"
          className="kb-input"
        />
        <p className="mt-1 text-right text-xs text-muted">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>

      {submitError && (
        <p role="alert" className="text-sm font-bold text-error">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="kb-btn kb-btn-primary flex-1"
        >
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {editing ? "Save changes" : "Post review"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="kb-btn kb-btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
