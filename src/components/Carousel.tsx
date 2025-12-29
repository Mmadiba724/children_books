import { useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import type { Book } from "../data/books";

import { books as siteBooks } from "../data/books";
import { Star } from "lucide-react";

// Use the app's shared book data for the carousel so images and details stay consistent
const bookData = siteBooks.map((b) => ({
    img: b.coverUrl,
    title: b.title,
    author: b.author,
    // placeholder rating — we can add a real rating field later
    rating: 4.5,
    price: b.priceCents,
}));

const initialImages = bookData.map((b) => b.img);

const Carousel = () => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState(initialImages);
    const [carouselBooks] = useState(bookData);
    const { add } = useCart();

    type CarouselBook = {
        img: string;
        title: string;
        author: string;
        rating: number;
        price: number;
    };

    const asBook = (b: CarouselBook, idx: number): Book => ({
        id: `carousel-${idx}`,
        title: b.title,
        author: b.author,
        priceCents: b.price,
        coverUrl: b.img,
        description: b.title,
        previewPages: [b.title],
    });

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
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-4 gap-4 mb-2">
                    <h3 className="text-3xl font-bold text-left text-rose-600">
                        New Books
                    </h3>

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
                <div
                    ref={carouselRef}
                    className="flex overflow-x-auto scroll-smooth gap-4 px-4"
                    style={{ scrollbarWidth: "none" }}
                >
                    {images.map((img, idx) => {
                        // Find the book info for this image
                        const book =
                            carouselBooks.find((b) => b.img === img) ||
                            carouselBooks[idx];
                        return (
                            <div
                                className="min-w-[220px] h-[420px] rounded-2xl overflow-hidden shadow-md bg-white shrink-0 transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex flex-col"
                                key={String(img) + idx}
                            >
                                <div className="relative h-[220px] w-full">
                                    <img
                                        src={book.img}
                                        alt={book.title}
                                        className="w-full h-full object-cover block"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between p-4">
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
                                            className="text-lg font-semibold text-gray-900 truncate text-left"
                                            title={book.title}
                                        >
                                            {book.title}
                                        </h4>
                                        <h4 className="text-md font-bold text-indigo-600">
                                            ${(book.price / 100).toFixed(2)}
                                        </h4>
                                    </div>
                                    <button
                                        onClick={() =>
                                            add(asBook(book, idx), 1)
                                        }
                                        className="mt-3 bg-linear-to-r from-rose-400 to-amber-400 text-black font-semibold py-2 px-3 rounded-full transition-colors w-full"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Carousel;
