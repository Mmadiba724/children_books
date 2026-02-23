import { useRef, useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUtils";
import bookService from "../services/bookService";
import CarouselCard from "./CarouselCard";
import type { Book } from "../types/book";

type CarouselBook = {
    img: string;
    title: string;
    author: string;
    price: number;
    realBook: Book; // Store the actual book object with real ID
};

const Carousel = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<string[]>([]);
    const [carouselBooks, setCarouselBooks] = useState<CarouselBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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
            <div className="flex flex-col gap-4 max-w-8xl px-4 md:px-8 mx-auto">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-2xl md:text-3xl font-serif italic text-gray-700">
                        New books
                    </h2>

                    {/* Scroll buttons */}
                    <div className="flex gap-2">
                        <button
                            aria-label="Scroll Left"
                            className="bg-black/10 border-none text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/20 transition-colors"
                            onClick={() => scroll("left")}
                        >
                            &#8249;
                        </button>
                        <button
                            aria-label="Scroll Right"
                            className="bg-black/10 border-none text-2xl cursor-pointer rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/20 transition-colors"
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
                        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 md:gap-6 py-2 hide-scrollbar"
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
                                    key={String(img) + idx}
                                    className="snap-center shrink-0 w-full md:w-[calc(50%-12px)]"
                                >
                                    <CarouselCard
                                        book={book.realBook}
                                        coverImage={book.img}
                                        price={book.price / 100}
                                        hasError={hasError}
                                        onImageError={() => {
                                            setImageErrors((prev) =>
                                                new Set(prev).add(img)
                                            );
                                        }}
                                    />
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
