import { useRef, useState } from "react";
import { Star } from "lucide-react";

type RatingInputProps = {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly id?: string;
  readonly label?: string;
  readonly disabled?: boolean;
};

const WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Five-star radio group: click/tap, or arrow keys; hover previews the rating. */
export default function RatingInput({
  value,
  onChange,
  id,
  label = "Your rating",
  disabled = false,
}: RatingInputProps) {
  const [hover, setHover] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hover || value;

  const move = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  };

  return (
    <div className="flex items-center gap-3">
      <div
        id={id}
        role="radiogroup"
        aria-label={label}
        className="flex gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            ref={(el) => {
              refs.current[n - 1] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
            // Roving tabindex: one stop in the group, arrows move inside it
            tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                move((value || 0) + 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                move((value || 2) - 1);
              }
            }}
            className="rounded p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
          >
            <Star
              aria-hidden="true"
              className={`h-8 w-8 ${n <= shown ? "fill-sun text-sun" : "fill-line text-line"}`}
            />
          </button>
        ))}
      </div>
      <span className="min-w-20 text-sm font-bold text-ink-soft" aria-live="polite">
        {WORDS[shown]}
      </span>
    </div>
  );
}
