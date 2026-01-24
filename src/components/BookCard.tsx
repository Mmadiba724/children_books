import { Link } from "react-router-dom";
import type { Book } from "../data/books";
// import { useCart } from "../context/CartContext";

export default function BookCard({ book }: { readonly book: Book }) {
    // const { add } = useCart();

    return (
        <Link to={`/book/${book.id}`}>
            <article className="h-100 rounded-xl shadow-lg p-4 bg-white hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col">
                <div className="relative">
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-56 object-cover rounded-lg"
                    />
                </div>

                <div className="mt-3 flex-1 justify-between h-full p-4 text-left">
                    <h3 className="text-lg font-extrabold text-rose-600 line-clamp-2 break-words h-12 ">
                        {book.title}
                    </h3>
                    <div className="flex justify-between items-center pt-3">
                        {book.ageRange && (
                            <span className=" bg-linear-to-r from-pink-400 to-rose-300 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                Age Range: {book.ageRange}
                            </span>
                        )}
                        <span className=" bg-white/90 text-indigo-600 px-3 py-1 rounded-full font-bold">
                            Price: ${(book.priceCents / 100).toFixed(2)}
                        </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">By {book.author}</p>
                </div>
            </article>
        </Link>
    );
}
