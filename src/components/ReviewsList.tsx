import { formatLocalDateLong } from "../utils/dateUtils";
import RatingStars from "./ui/RatingStars";

export type Review = {
  name: string;
  rating: number;
  text: string;
  date?: string;
};

type ReviewsListProps = {
  bookReviews: Review[];
};

export default function ReviewsList({
  bookReviews,
}: Readonly<ReviewsListProps>) {
  if (bookReviews.length === 0) {
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
    <ul className="space-y-4">
      {bookReviews.map((r) => {
        const key = `${r.name}-${r.text.slice(0, 24)}`;
        const reviewDate = r.date ? formatLocalDateLong(r.date) : "";
        return (
          <li key={key} className="kb-card p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-lg font-bold text-brand-dark"
              >
                {r.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-extrabold text-ink">{r.name}</p>
                  <RatingStars value={r.rating} size="sm" />
                </div>
                {reviewDate && (
                  <p className="text-xs text-muted">{reviewDate}</p>
                )}
                <p className="mt-2 leading-relaxed text-ink-soft">{r.text}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
