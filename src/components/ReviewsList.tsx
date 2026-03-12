// import { Star } from "lucide-react";
import { formatLocalDateLong } from "../utils/dateUtils";

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
  return (
    <div className="space-y-6">
      {bookReviews.length === 0 && (
        <div className="text-sm text-gray-600">
          No reviews yet — be the first to review this book.
        </div>
      )}
      {bookReviews.map((r) => {
        const key = `${r.name}-${r.text.slice(0, 24)}`;
        const reviewDate = r.date ? formatLocalDateLong(r.date) : "";
        return (
          <div key={key} className="border-b border-gray-200 pb-6">
            <div className="flex items-start gap-3">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-sm font-semibold">
                  {r.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1">
                {/* User name */}
                <div className="font-semibold text-sm text-gray-900 mb-1">
                  {r.name}
                </div>

                {/* Star rating and title */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, sIdx) => (
                      <span
                        key={`star-${r.name}-${sIdx}`}
                        className={`text-base ${
                          sIdx < r.rating ? "text-orange-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review date */}
                {reviewDate && (
                  <div className="text-xs text-gray-600 mb-2">
                    Reviewed on {reviewDate}
                  </div>
                )}

                {/* Review text */}
                <div className="text-sm text-gray-900 leading-relaxed">
                  {r.text}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
