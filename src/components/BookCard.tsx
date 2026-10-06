import { Link } from "react-router-dom";
import { ShoppingBag, Tablet } from "lucide-react";
import type { Book } from "../types/book";
import { useCart } from "../context/CartContext";
import { getCategoryColor } from "../utils/categoryColors";
import { formatPrice } from "../utils/formatPrice";
import BookCover from "./ui/BookCover";
import WishlistButton from "./WishlistButton";

/**
 * Catalogue card. The whole card is clickable through the title link
 * (stretched link), while the add-to-cart button stays a separate,
 * keyboard-reachable control instead of being nested inside the anchor.
 */
export default function BookCard({ book }: { readonly book: Book }) {
  const { add } = useCart();

  const isDigital = book.format === "DIGITAL";
  const soldOut = !isDigital && (book.stockQuantity ?? 0) <= 0;
  const category = book.categoryNames?.[0];

  return (
    <article className="group relative flex h-full flex-col text-left motion-safe:animate-[kb-rise_0.45s_ease-out_both]">
      <div className="relative px-1 pt-1">
        <div className="transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-focus-within:-translate-y-1.5">
          <BookCover
            title={book.title}
            coverImageUrl={book.coverImageUrl}
            className="transition-shadow duration-300 group-hover:shadow-(--shadow-lift)"
          />
        </div>
        {isDigital && (
          <span className="kb-badge absolute top-3 left-3 bg-accent text-white shadow-sm">
            <Tablet className="h-3 w-3" aria-hidden="true" />
            Digital
          </span>
        )}
        {soldOut && (
          <span className="kb-badge absolute top-3 left-3 bg-ink text-white shadow-sm">
            Sold out
          </span>
        )}
        <WishlistButton book={book} />
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        {category && (
          <span
            className={`kb-badge mb-2 w-fit border ${getCategoryColor(category)}`}
          >
            {category}
          </span>
        )}
        <h3 className="line-clamp-2 font-display text-base leading-snug font-bold text-ink capitalize sm:text-lg">
          <Link
            to={`/book/${book.id}`}
            className="rounded after:absolute after:inset-0 after:content-[''] hover:text-brand-dark"
          >
            {book.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-ink-soft">
          by {book.author}
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-3">
          <span className="text-lg font-extrabold text-ink">
            {formatPrice(book.price)}
          </span>
          <button
            type="button"
            disabled={soldOut}
            aria-label={`Add ${book.title} to cart`}
            onClick={() => add(book)}
            className="kb-btn kb-btn-secondary kb-btn-sm relative z-10 w-full group-hover:border-brand"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
