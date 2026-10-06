import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";

type WishlistButtonProps = {
  readonly book: { id: number | string; title: string };
  /** "overlay" sits on a cover; "full" is a labelled button for detail pages. */
  readonly variant?: "overlay" | "full";
};

export default function WishlistButton({
  book,
  variant = "overlay",
}: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(book.id);
  const label = saved
    ? `Remove ${book.title} from wishlist`
    : `Add ${book.title} to wishlist`;

  if (variant === "full") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        aria-label={label}
        onClick={() => toggle(book)}
        className="kb-btn kb-btn-secondary py-3 text-base"
      >
        <Heart
          className={`h-5 w-5 ${saved ? "fill-brand text-brand" : ""}`}
          aria-hidden="true"
        />
        {saved ? "Saved" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => toggle(book)}
      className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink-soft shadow-sm transition hover:scale-105 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Heart
        className={`h-5 w-5 ${saved ? "fill-brand text-brand" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}
