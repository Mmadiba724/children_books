import { Link } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import type { Book } from "../types/book";
import { formatLocalDate } from "../utils/dateUtils";

type BookDetailsColumnProps = {
  book: Book;
  rating: number;
};

export default function BookDetailsColumn({
  book,
  rating,
}: Readonly<BookDetailsColumnProps>) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const handleAddToCart = async () => {
    await add(book);
  };

  // Digital books are always available, only check stock for physical books
  const isDigital = book.format === "DIGITAL";
  const inStock = isDigital || (book.stockQuantity ?? 0) > 0;

  const getAvailabilityBadge = () => {
    if (isDigital) {
      return (
        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
          ✓ Digital - Available
        </span>
      );
    }
    if (inStock) {
      return (
        <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded">
          ✓ In Stock ({book.stockQuantity} available)
        </span>
      );
    }
    return (
      <span className="inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded">
        Out of Stock
      </span>
    );
  };

  const availabilityBadge = getAvailabilityBadge();

  return (
    <div className="space-y-4 sm:space-y-6 w-full text-left">
      {/* Title and Author */}
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight capitalize">
          {book.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          by{" "}
          <Link
            to={`/search?author=${encodeURIComponent(book.author)}`}
            className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
          >
            {book.author}
          </Link>
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg sm:text-xl ${
                  i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            <span className="font-bold">{rating.toFixed(1)} </span>
          </span>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
          Price
        </h3>
        <div className="text-3xl sm:text-4xl font-bold text-rose-600 mb-3 sm:mb-4">
          ugx {(book.price ?? 0).toFixed(0)}
        </div>

        {/* Availability Badge */}
        <div className="mb-3 sm:mb-4">{availabilityBadge}</div>
      </div>

      {/* Book Details */}
      <div className="border-t border-b border-gray-200 py-3 sm:py-4 space-y-2 sm:space-y-3">
        {book.format && (
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Format
            </p>
            <p className="text-sm text-gray-900">{book.format}</p>
          </div>
        )}

        {book.categoryNames && book.categoryNames.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Categories
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {book.categoryNames.map((cat) => (
                <span
                  key={cat}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {book.createdAt && (
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Published
            </p>
            <p className="text-sm text-gray-900">
              {formatLocalDate(book.createdAt)}
            </p>
          </div>
        )}

        {book.fileId && (
          <div className="pt-2">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
              ✓ Digital Edition Available
            </span>
          </div>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quantity
          </label>
          <div className="flex items-center border border-gray-300 rounded w-28 sm:w-32">
            <button
              aria-label="decrease"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 sm:px-4 py-2 text-lg font-semibold hover:bg-gray-50 transition"
            >
              −
            </button>
            <div className="flex-1 text-center font-bold text-base border-x border-gray-300 py-2">
              {qty}
            </div>
            <button
              aria-label="increase"
              onClick={() => setQty(qty + 1)}
              className="px-3 sm:px-4 py-2 text-lg font-semibold hover:bg-gray-50 transition"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          {inStock ? "ADD TO CART" : "OUT OF STOCK"}
        </button>

        {!isDigital && (
          <p className="text-xs sm:text-sm text-gray-600 text-center">
            Free shipping on orders over $25
          </p>
        )}
      </div>

      {/* Pick Up in Store */}
      <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
        <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
          PICK UP IN STORE
        </h4>
        <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
          Your local store may have stock of this item.
        </p>
        <button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
          <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          FIND IN STORES
        </button>
      </div>
    </div>
  );
}
