import { Link } from "react-router-dom";
import { useState } from "react";
import type { Book } from "../types/book";
// import { useCart } from "../context/CartContext";

export default function BookCard({ book }: { readonly book: Book }) {
    // const { add } = useCart();
    const [imageError, setImageError] = useState(false);

    const coverImage = book.coverImageUrl || null;
    const price = book.price || 0;

    return (
        <Link to={`/book/${book.id}`}>
            <article className="h-100 rounded-xl shadow-lg p-4 bg-white hover:shadow-2xl transition-transform transform hover:-translate-y-1 flex flex-col">
                <div className="relative">
                    {!imageError && coverImage ? (
                        <img
                            src={coverImage}
                            alt={book.title}
                            className="w-full h-56 object-cover rounded-lg"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-56 rounded-lg bg-gray-200 flex items-center justify-center">
                            <div className="text-center p-4">
                                <svg
                                    className="w-12 h-12 mx-auto mb-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="text-xs text-gray-500 font-medium">
                                    No Cover
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-3 flex-1 justify-between h-full p-4 text-left">
                    <h3 className="text-lg font-extrabold text-rose-600 line-clamp-2 break-words h-12 ">
                        {book.title}
                    </h3>
                    <div className="flex justify-between items-center pt-3">
                        {book.categoryNames &&
                            book.categoryNames.length > 0 && (
                                <span className=" bg-linear-to-r from-pink-400 to-rose-300 text-white text-xs font-semibold px-2 py-1 rounded-full w-52">
                                    {book.categoryNames[0]}
                                </span>
                            )}
                        <span className=" bg-white/90 text-indigo-600 px-3 py-1 rounded-full font-bold w-64 text-xs">
                            Price: ugx {price.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                        By {book.author}
                    </p>
                </div>
            </article>
        </Link>
    );
}
