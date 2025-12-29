import { Link } from "react-router-dom";
import type { Book } from "../data/books";
import { useCart } from "../context/CartContext";

export default function BookCard({ book }: { readonly book: Book }) {
    const { add } = useCart();

    return (
        <article className="rounded-xl shadow-lg p-4 bg-white hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col">
            <div className="relative">
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-56 object-cover rounded-lg"
                />
                {book.ageRange && (
                    <span className="absolute top-3 left-3 bg-linear-to-r from-pink-400 to-rose-300 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {book.ageRange}
                    </span>
                )}
                <span className="absolute top-3 right-3 bg-white/90 text-indigo-600 px-3 py-1 rounded-full font-bold">
                    ${(book.priceCents / 100).toFixed(2)}
                </span>
            </div>

            <div className="mt-3 flex-1 text-left">
                <h3 className="text-lg font-extrabold text-rose-600">
                    {book.title}
                </h3>
                <p className="text-sm text-gray-600">{book.author}</p>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <Link
                    to={`/book/${book.id}`}
                    className="bg-linear-to-r from-indigo-500 to-cyan-500 text-white px-4 py-2 rounded-full shadow"
                >
                    Peek Inside
                </Link>
                <button
                    onClick={() => add(book, 1)}
                    aria-label={`Add ${book.title} to cart`}
                    className="bg-amber-400 hover:bg-amber-500 text-black px-3 py-2 rounded-full font-semibold shadow"
                >
                    Add
                </button>
            </div>
        </article>
    );
}
