import { Star } from "lucide-react";

type RatingStarsProps = {
  readonly value: number;
  readonly size?: "sm" | "md";
};

/** Read-only star rating; the visible stars are decorative, the label carries the value. */
export default function RatingStars({ value, size = "md" }: RatingStarsProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
      className="inline-flex gap-0.5"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`${dim} ${i < Math.round(value) ? "fill-sun text-sun" : "fill-line text-line"}`}
        />
      ))}
    </span>
  );
}
