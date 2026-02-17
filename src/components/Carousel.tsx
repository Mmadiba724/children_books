import { useRef, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUtils";
import bookService from "../services/bookService";
import { Star } from "lucide-react";
import type { Book } from "../types/book";

type CarouselBook = {
    img: string;
    title: string;
    author: string;
    rating: number;
    price: number;
    realBook: Book; // Store the actual book object with real ID
};

const Carousel = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<string[]>([]);
    const [carouselBooks, setCarouselBooks] = useState<CarouselBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
    const { add } = useCart();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const books = await bookService.getAllBooks();
                if (books && Array.isArray(books)) {
                    // Transform API books to carousel format
                    const carouselData = books.map((b: Book) => ({
                        img: getImageUrl(b.coverImageUrl),
                        title: b.title,
                        author: b.author,
                        rating: 4.5, // Default rating - could be replaced with real data
                        price: (b.price || 0) * 100, // Convert to cents to match existing logic
                        realBook: b, // Store the actual book object
                    }));

                    setCarouselBooks(carouselData);
                    setImages(carouselData.map((b) => b.img));
                }
            } catch (err) {
                console.error("Error fetching books for carousel:", err);
                setCarouselBooks([]);
                setImages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!carouselRef.current) return;
        const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;

        if (direction === "left") {
            if (scrollLeft <= 0) {
                // Move last image to the front
                setImages((prev) => [
                    prev[prev.length - 1],
                    ...prev.slice(0, -1),
                ]);
                // Wait for state update, then scroll to the new first image
                setTimeout(() => {
                    if (carouselRef.current) {
                        carouselRef.current.scrollLeft = clientWidth;
                    }
                }, 50);
            } else {
                carouselRef.current.scrollTo({
                    left: scrollLeft - clientWidth,
                    behavior: "smooth",
                });
            }
        }
        // handle right scroll
        if (direction === "right") {
            if (scrollLeft + clientWidth >= scrollWidth - 1) {
                // Move first image to the end
                setImages((prev) => [...prev.slice(1), prev[0]]);
                setTimeout(() => {
                    if (carouselRef.current) {
                        carouselRef.current.scrollLeft = 0;
                    }
                }, 50);
            } else {
                carouselRef.current.scrollTo({
                    left: scrollLeft + clientWidth,
                    behavior: "smooth",
                });
            }
        }
    };

    return (
        <div className="w-full py-6">
            <div className="flex flex-col gap-4 max-w-8xl px-25 mx-auto">
                <div className="flex items-center justify-between px-4 gap-4 mb-2">
                    <h2 className="text-3xl font-serif italic text-gray-700 mb-6">
                        New books
                    </h2>

                    {/* Scroll buttons */}
                    <div className="flex gap-2">
                        <button
                            aria-label="Scroll Left"
                            className="bg-black/10 border-none text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center"
                            onClick={() => scroll("left")}
                        >
                            &#8249;
                        </button>
                        <button
                            aria-label="Scroll Right"
                            className="bg-black/10 border-none text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center"
                            onClick={() => scroll("right")}
                        >
                            &#8250;
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">Loading books...</p>
                    </div>
                )}

                {!loading && carouselBooks.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">No books available.</p>
                    </div>
                )}

                {!loading && carouselBooks.length > 0 && (
                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto scroll-smooth gap-4 py-2 px-4"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {images.map((img, idx) => {
                            // Find the book info for this image
                            const book =
                                carouselBooks.find((b) => b.img === img) ||
                                carouselBooks[idx];
                            const hasError = imageErrors.has(img);
                            return (
                                <div
                                    className="min-w-[220px] pb-8  h-[420px] rounded-2xl overflow-hidden shadow-md bg-white shrink-0 transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex flex-col"
                                    key={String(img) + idx}
                                >
                                    <div className="relative  h-[220px] w-full">
                                        {!hasError ? (
                                            <img
                                                src={book.img}
                                                alt={book.title}
                                                className="w-full h-full object-cover block"
                                                onError={() => {
                                                    setImageErrors((prev) =>
                                                        new Set(prev).add(img),
                                                    );
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-[220px] bg-gray-200 flex items-center justify-center">
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

                                    <div className="flex-1 flex flex-col justify-between py-4 px-4">
                                        <div>
                                            <div className="mb-2 inline-flex items-center gap-2 bg-rose-50 px-2 py-1 rounded-full text-sm text-rose-600 w-fit">
                                                <Star className="w-4 h-4 text-yellow-400" />
                                                <span className="font-semibold">
                                                    {book.rating}
                                                </span>
                                            </div>

                                            <p
                                                className="text-sm text-gray-700 truncate text-left"
                                                title={book.author}
                                            >
                                                By {book.author}
                                            </p>
                                            <h4
                                                className="text-sm h-12 font-semibold text-gray-900 text-left break-words w-64 line-clamp-2"
                                                title={book.title}
                                            >
                                                {book.title}
                                            </h4>
                                            <h4 className="text-md font-bold text-indigo-600">
                                                ugx{" "}
                                                {(book.price / 100).toFixed(2)}
                                            </h4>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await add(book.realBook, 1);
                                            }}
                                            className="mt-3 bg-linear-to-r from-rose-400 to-amber-400 text-black font-semibold py-2 px-3 rounded-full transition-colors w-full"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Carousel;
