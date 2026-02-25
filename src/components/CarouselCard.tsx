
import { useCart } from "../context/CartContext";
import { getCategoryColor } from "../utils/categoryColors";
import type { Book } from "../types/book";

interface CarouselCardProps {
    book: Book;
    coverImage: string;
    price: number;
    onImageError: () => void;
    hasError: boolean;
}

export default function CarouselCard({
    book,
    coverImage,
    price,
    onImageError,
    hasError,
}: CarouselCardProps) {
    const { add } = useCart();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await add(book, 1);
    };

    return (
        <article
            className="group w-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col rounded-lg "
        >
            {/* Book Cover with Overlay */}
            <div className="relative mb-4 overflow-hidden">
                {!hasError ? (
                    <img
                        src={coverImage}
                        alt={book.title}
                        className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                        onError={onImageError}
                    />
                ) : (
                    <div className="w-full h-80 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center p-4">
                            <svg
                                className="w-16 h-16 mx-auto mb-2 text-gray-300"
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
                            <p className="text-sm text-gray-400 font-medium">
                                No Cover Available
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Add Button Overlay */}
                {/*<div*/}
                {/*    className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${*/}
                {/*        isHovered ? "opacity-100" : "opacity-0"*/}
                {/*    }`}*/}
                {/*>*/}
                {/*    <button*/}
                {/*        onClick={handleAddToCart}*/}
                {/*        className="bg-white text-gray-800 font-bold py-3 px-8 hover:bg-gray-100 transition-colors duration-200 uppercase tracking-wide text-sm shadow-lg"*/}
                {/*    >*/}
                {/*        Quick Add*/}
                {/*    </button>*/}
                {/*</div>*/}
            </div>

            {/* Book Info */}
            <div className="text-center px-3">
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-12 capitalize">
                    {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{book.author}</p>

                {/* Price and Category */}
                <div className="flex flex-col items-center gap-2 mt-2">
                    <span className="text-base font-bold text-gray-900">
                        UGX {price.toFixed(2)}
                    </span>
                    {book.categoryNames && book.categoryNames.length > 0 && (
                        <span
                            className={`text-xs font-medium px-3 py-1 border ${getCategoryColor(
                                book.categoryNames[0]
                            )}`}
                        >
                            {book.categoryNames[0]}
                        </span>
                    )}
                </div>
            </div>

            {/* Add to Cart Button - Always Visible */}
            <div className="px-3 pb-4 mt-3">
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-rose-600 text-white font-semibold py-2.5 px-4 hover:bg-rose-700 transition-colors duration-200 text-sm"
                >
                    Add to Cart
                </button>
            </div>
        </article>
    );
}



