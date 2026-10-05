import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

type BookCoverProps = {
  readonly title: string;
  readonly coverImageUrl?: string | null;
  readonly className?: string;
  readonly eager?: boolean;
  /** Skip the rounded corners / shadow when the parent provides them. */
  readonly bare?: boolean;
};

// Gentle, on-brand colours for books that have no cover art yet.
const FALLBACKS = [
  "from-brand-light to-sun-light text-brand-dark",
  "from-accent-light to-sky-light text-accent-dark",
  "from-sun-light to-leaf-light text-warning",
  "from-plum-light to-brand-light text-plum",
  "from-leaf-light to-accent-light text-success",
];

function pickFallback(title: string) {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACKS[hash % FALLBACKS.length];
}

/**
 * 3:4 book cover with a printed-book edge and a designed fallback for
 * missing / broken artwork, so the grid never shows a broken-image icon.
 */
export default function BookCover({
  title,
  coverImageUrl,
  className = "",
  eager = false,
  bare = false,
}: BookCoverProps) {
  const src = getImageUrl(coverImageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const frame = bare ? "" : "rounded-r-xl rounded-l-sm shadow-(--shadow-book)";

  return (
    <div
      className={`relative aspect-3/4 w-full overflow-hidden bg-cream-deep ${frame} ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={`Cover of ${title}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`Cover of ${title} (artwork coming soon)`}
          className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br p-5 text-center ${pickFallback(title)}`}
        >
          <BookOpen className="h-10 w-10 opacity-70" aria-hidden="true" />
          <span className="line-clamp-4 font-display text-lg leading-snug font-bold capitalize">
            {title}
          </span>
        </div>
      )}
      {/* spine highlight for a printed-book feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-linear-to-r from-black/20 via-white/15 to-transparent"
      />
    </div>
  );
}
