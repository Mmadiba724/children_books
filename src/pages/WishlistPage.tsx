import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2, ShoppingBag, Tablet, Trash2 } from "lucide-react";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/ui/BookCover";
import StatePanel from "../components/ui/StatePanel";
import { BookGridSkeleton } from "../components/ui/Skeletons";
import { useWishlist } from "../context/WishlistContext";
import type { WishlistItem } from "../services/wishlistService";
import { formatLocalDate } from "../utils/dateUtils";
import { formatPrice } from "../utils/formatPrice";

export default function WishlistPage() {
  const { items, loading, error, reload, remove, moveToCart } = useWishlist();
  // Item ids with a request in flight, so buttons can show progress
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  const withBusy = async (item: WishlistItem, action: () => Promise<void>) => {
    setBusyIds((cur) => new Set(cur).add(item.id));
    try {
      await action();
    } finally {
      setBusyIds((cur) => {
        const next = new Set(cur);
        next.delete(item.id);
        return next;
      });
    }
  };

  let content;
  if (loading && items.length === 0) {
    content = <BookGridSkeleton count={4} />;
  } else if (error && items.length === 0) {
    content = (
      <StatePanel
        variant="error"
        title="We couldn't open your wishlist"
        message="Please check your connection and try again."
        action={
          <button
            type="button"
            onClick={reload}
            className="kb-btn kb-btn-primary"
          >
            Try again
          </button>
        }
      />
    );
  } else if (items.length === 0) {
    content = (
      <StatePanel
        variant="empty"
        title="Nothing saved yet"
        message="Tap the heart on any book to keep it here for later."
        action={
          <Link to="/books" className="kb-btn kb-btn-primary">
            Browse books
          </Link>
        }
      />
    );
  } else {
    content = (
      <>
        <p className="mb-8 text-left text-ink-soft" aria-live="polite">
          <strong className="font-extrabold text-ink">{items.length}</strong>{" "}
          {items.length === 1 ? "book" : "books"} saved
        </p>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {items.map((item) => {
            const busy = busyIds.has(item.id);
            const isDigital = item.format === "DIGITAL";
            return (
              <li key={item.id} className="flex flex-col text-left">
                <Link
                  to={`/book/${item.bookId}`}
                  className="group relative block rounded-xl px-1 pt-1"
                  aria-label={`View ${item.title}`}
                >
                  <div className="transition-transform duration-300 group-hover:-translate-y-1.5">
                    <BookCover
                      title={item.title}
                      coverImageUrl={item.coverImageUrl}
                      className="transition-shadow duration-300 group-hover:shadow-(--shadow-lift)"
                    />
                  </div>
                  {isDigital && (
                    <span className="kb-badge absolute top-3 left-3 bg-accent text-white shadow-sm">
                      <Tablet className="h-3 w-3" aria-hidden="true" />
                      Digital
                    </span>
                  )}
                </Link>

                <h2 className="mt-4 line-clamp-2 font-display text-base leading-snug font-bold text-ink capitalize sm:text-lg">
                  <Link
                    to={`/book/${item.bookId}`}
                    className="rounded hover:text-brand-dark"
                  >
                    {item.title}
                  </Link>
                </h2>
                <p className="mt-1 line-clamp-1 text-sm text-ink-soft">
                  by {item.author}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Saved {formatLocalDate(item.createdAt)}
                </p>
                <p className="mt-2 text-lg font-extrabold text-ink">
                  {formatPrice(item.price)}
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => withBusy(item, () => moveToCart(item))}
                    className="kb-btn kb-btn-primary kb-btn-sm w-full"
                    aria-label={`Move ${item.title} to cart`}
                  >
                    {busy ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    )}
                    Move to cart
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => withBusy(item, () => remove(item))}
                    className="kb-btn kb-btn-quiet kb-btn-sm w-full"
                    aria-label={`Remove ${item.title} from wishlist`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <PageTransition>
      <div>
        <header className="kb-paper border-b border-line py-8 text-left md:py-12">
          <div className="kb-container">
            <p className="kb-eyebrow mb-1 flex items-center gap-1.5">
              <Heart className="h-4 w-4" aria-hidden="true" />
              Saved for later
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              My wishlist
            </h1>
            <p className="mt-2 text-ink-soft">
              Books you love, kept close until you're ready.
            </p>
          </div>
        </header>
        <div className="kb-container py-8 md:py-12">{content}</div>
      </div>
    </PageTransition>
  );
}
