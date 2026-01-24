import { Link } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";
import { type Book } from "../data/books";
import { useCart } from "../context/CartContext";
import { useState } from "react";

type BookDetailsColumnProps = {
    book: Book;
    rating: number;
    // bookReviews: Review[];
};

// type Review = {
//     id: string;
//     rating: number;
//     comment: string;
//     reviewer: string;
//     date: string;
// };

// type BookFormat = "hardcover" | "paperback" | "ebook";

const QuantitySelector = () => {
    const [qty, setQty] = useState(1);

    return (
        <div className="flex items-center border border-gray-300 rounded w-32">
            <button
                aria-label="decrease"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-2 text-lg font-semibold hover:bg-gray-50 transition"
            >
                −
            </button>
            <div className="flex-1 text-center font-bold text-base border-x border-gray-300 py-2">
                {qty}
            </div>
            <button
                aria-label="increase"
                onClick={() => setQty(qty + 1)}
                className="px-4 py-2 text-lg font-semibold hover:bg-gray-50 transition"
            >
                +
            </button>
        </div>
    );
};

export default function BookDetailsColumn({
    book,
    rating,
}: Readonly<BookDetailsColumnProps>) {
    const { add } = useCart();

    const basePrice = book.priceCents / 100;

    const ebookPrice = (basePrice * 0.65).toFixed(2);

    const handleAddToCart = () => {
        add(book);
    };

    return (
        <div className="space-y-6 w-[40rem] text-left">
            {/* Title and Author */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                    {book.title}
                </h1>
                <p className="text-base text-gray-600 mt-2">
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
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-xl ${
                                    i < Math.floor(rating)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">
                        <span className="font-bold" >{rating.toFixed(1)} </span>
                    </span>
                </div>
            </div>

            {/* Format Selection */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">eBook</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">
                    ${ebookPrice}
                </div>

                {/* <Link
                    to="#"
                    className="text-sm text-teal-600 hover:text-teal-700 hover:underline inline-block mb-6"
                >
                    View All Available Formats & Editions
                </Link> */}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Quantity
                    </label>
                    <QuantitySelector />
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2 mb-3"
                >
                    <ShoppingCart className="w-5 h-5" />
                    ADD TO CART
                </button>

                <button
                    onClick={() => add(book, 5)}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold py-3 px-6 rounded transition-colors"
                >
                    Add 5 (Gift Package)
                </button>

                <p className="text-sm text-gray-600 mt-4 text-center">
                    Free shipping on orders over $25
                </p>
            </div>

            {/* Premium Members Section */}
            {/* <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">📖</div>
                    <div className="text-sm text-gray-700">
                        <span className="font-semibold">Premium Members</span>{" "}
                        get an additional{" "}
                        <span className="font-semibold">10% off</span> AND
                        collect stamps to save with{" "}
                        <span className="font-semibold">Rewards</span>.{" "}
                        <span className="text-gray-600">
                            10 stamps = $5 reward
                        </span>{" "}
                        <Link to="#" className="text-teal-600 hover:underline">
                            Learn more
                        </Link>
                    </div>
                </div>
            </div> */}

            {/* Ship This Item */}
            {/* <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="font-bold text-gray-900 text-base mb-2">
                    SHIP THIS ITEM
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                    In stock. Ships in 1-2 days.
                </p>
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="w-5 h-5" />
                    ADD TO CART
                </button>
            </div> */}

            {/* Pick Up in Store */}
            <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="font-bold text-gray-900 text-base mb-2">
                    PICK UP IN STORE
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                    Your local store may have stock of this item.
                </p>
                <button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2">
                    <Store className="w-5 h-5" />
                    FIND IN STORES
                </button>
            </div>
        </div>
    );
}
