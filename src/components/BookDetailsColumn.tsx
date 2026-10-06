import { Link } from "react-router-dom";
import {
  BookOpen,
  Minus,
  Plus,
  ShoppingBag,
  Tablet,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import type { Book } from "../types/book";
import { formatLocalDate } from "../utils/dateUtils";
import { formatPrice } from "../utils/formatPrice";
import { getCategoryColor } from "../utils/categoryColors";
import RatingStars from "./ui/RatingStars";
import WishlistButton from "./WishlistButton";

type BookDetailsColumnProps = {
  book: Book;
  rating: number | null;
  reviewCount: number;
};

export default function BookDetailsColumn({
  book,
  rating,
  reviewCount,
}: Readonly<BookDetailsColumnProps>) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // Digital books are always available, only check stock for physical books
  const isDigital = book.format === "DIGITAL";
  const inStock = isDigital || (book.stockQuantity ?? 0) > 0;
  const maxQty = isDigital ? 1 : Math.max(1, book.stockQuantity ?? 1);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await add(book, isDigital ? 1 : qty);
    } finally {
      setAdding(false);
    }
  };

  const availability = isDigital
    ? {
        text: "Digital edition, read instantly after purchase",
        tone: "bg-accent-light text-accent-dark",
        Icon: Tablet,
      }
    : inStock
      ? {
          text: `In stock (${book.stockQuantity} available)`,
          tone: "bg-leaf-light text-success",
          Icon: Truck,
        }
      : {
          text: "Currently out of stock",
          tone: "bg-error-light text-error",
          Icon: Truck,
        };

  const details: { label: string; value: string }[] = [
    {
      label: "Format",
      value: isDigital ? "Digital (e-book)" : book.format ? "Print" : "",
    },
    { label: "ISBN", value: book.isbn },
    {
      label: "Added",
      value: book.createdAt ? formatLocalDate(book.createdAt) : "",
    },
  ].filter((d) => d.value);

  return (
    <div className="space-y-6 text-left">
      {book.categoryNames?.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Categories">
          {book.categoryNames.map((cat) => (
            <li key={cat}>
              <Link
                to={`/books?category=${encodeURIComponent(cat)}`}
                className={`kb-badge border px-3 py-1 text-[0.8125rem] transition-transform hover:-translate-y-0.5 ${getCategoryColor(cat)}`}
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h1 className="font-display text-3xl leading-[1.1] font-extrabold tracking-tight text-ink capitalize sm:text-4xl lg:text-5xl">
          {book.title}
        </h1>
        <p className="mt-3 text-lg text-ink-soft">
          by{" "}
          <Link
            to={`/books?q=${encodeURIComponent(book.author)}`}
            className="font-bold text-accent-dark underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {book.author}
          </Link>
        </p>
        {rating !== null && (
          <p className="mt-3 flex items-center gap-2">
            <RatingStars value={rating} />
            <span className="text-sm font-bold text-ink-soft">
              {rating.toFixed(1)} · {reviewCount}{" "}
              {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </p>
        )}
      </div>

      {/* Purchase panel */}
      <div className="kb-card space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-muted">Price</p>
            <p className="text-3xl font-extrabold text-ink sm:text-4xl">
              {formatPrice(book.price)}
            </p>
          </div>
          <span
            className={`kb-badge gap-1.5 px-3 py-1.5 text-[0.8125rem] ${availability.tone}`}
          >
            <availability.Icon className="h-4 w-4" aria-hidden="true" />
            {availability.text}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {!isDigital && inStock && (
            <div
              role="group"
              aria-label="Quantity"
              className="flex items-center justify-between rounded-full border-2 border-line bg-white sm:w-40"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-light hover:text-brand-dark disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <output
                aria-live="polite"
                className="min-w-8 text-center text-lg font-extrabold"
              >
                {qty}
              </output>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-brand-light hover:text-brand-dark disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className="kb-btn kb-btn-primary flex-1 py-3 text-base"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {inStock ? (adding ? "Adding…" : "Add to cart") : "Out of stock"}
          </button>
          <WishlistButton book={book} variant="full" />
        </div>

        {isDigital && (
          <Link
            to="/library"
            className="inline-flex items-center gap-2 text-sm font-bold text-accent-dark hover:underline"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Already bought it? Read it in My library
          </Link>
        )}
      </div>

      {details.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-cream-deep/60 p-5 text-sm sm:grid-cols-3">
          {details.map((d) => (
            <div key={d.label} className="min-w-0">
              <dt className="text-xs font-extrabold tracking-wide text-muted uppercase">
                {d.label}
              </dt>
              <dd className="mt-0.5 truncate font-bold text-ink">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
