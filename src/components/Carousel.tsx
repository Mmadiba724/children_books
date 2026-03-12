import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { getImageUrl } from "../utils/imageUtils";
import bookService from "../services/bookService";
import CarouselCard from "./CarouselCard";
import { slideUpVariants } from "../utils/animations";
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
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [carouselBooks, setCarouselBooks] = useState<CarouselBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        }
      } catch (err) {
        console.error("Error fetching books for carousel:", err);
        setCarouselBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current || isTransitioning) return;

    const carousel = carouselRef.current;
    const cardWidth = carousel.querySelector("div")?.offsetWidth || 0;
    const gap = 24; // gap-6 = 24px
    const scrollAmount = cardWidth + gap;

    setIsTransitioning(true);

    if (direction === "left") {
      carousel.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    } else {
      carousel.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }

    // Reset transition lock after animation
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Handle infinite loop by checking scroll position
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || carouselBooks.length === 0) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;
      const itemWidth = carousel.querySelector("div")?.offsetWidth || 0;
      const gap = 24;
      const totalItemWidth = itemWidth + gap;

      // If scrolled to or past the cloned section at the end
      if (scrollLeft + clientWidth >= scrollWidth - totalItemWidth) {
        // Jump back to the start of real items (after first clone set)
        carousel.style.scrollBehavior = "auto";
        carousel.scrollLeft = totalItemWidth * carouselBooks.length;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
        }, 50);
      }

      // If scrolled to or before the cloned section at the start
      if (scrollLeft <= totalItemWidth) {
        // Jump to the end of real items (before last clone set)
        carousel.style.scrollBehavior = "auto";
        carousel.scrollLeft = totalItemWidth * carouselBooks.length;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
        }, 50);
      }
    };

    carousel.addEventListener("scroll", handleScroll);

    // Initialize scroll position to start of real items
    carousel.scrollLeft =
      (carousel.querySelector("div")?.offsetWidth || 0) * carouselBooks.length;

    return () => carousel.removeEventListener("scroll", handleScroll);
  }, [carouselBooks]);

  return (
    <motion.div
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={slideUpVariants}
      className="w-full py-6"
    >
      <div className="flex flex-col gap-4 max-w-8xl px-4 mb-8 md:px-8 mx-auto">
        <h2 className="text-6xl md:text-3xl font-serif italic text-gray-700 capitalize font-bold">
          New books
        </h2>

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
          <div className="relative flex items-center gap-2 h-full">
            {/* Left Arrow */}
            <button
              aria-label="Scroll Left"
              className="absolute left-0 top-0 z-10 bg-black/20 hover:bg-black/10 shadow-lg cursor-pointer w-12 h-full flex items-center justify-center hover:shadow-xl transition-all"
              onClick={() => scroll("left")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-8 h-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Carousel Content */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 md:gap-6 py-2 hide-scrollbar w-full px-14"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Clone last items at the start for infinite loop */}
              {carouselBooks.map((book, idx) => {
                const hasError = imageErrors.has(book.img);
                return (
                  <div
                    key={`clone-start-${idx}`}
                    className="snap-center shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-18px)]"
                  >
                    <CarouselCard
                      book={book.realBook}
                      coverImage={book.img}
                      price={book.price / 100}
                      hasError={hasError}
                      onImageError={() => {
                        setImageErrors((prev) => new Set(prev).add(book.img));
                      }}
                    />
                  </div>
                );
              })}

              {/* Real items */}
              {carouselBooks.map((book, idx) => {
                const hasError = imageErrors.has(book.img);
                return (
                  <div
                    key={`real-${idx}`}
                    className="snap-center shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-18px)]"
                  >
                    <CarouselCard
                      book={book.realBook}
                      coverImage={book.img}
                      price={book.price / 100}
                      hasError={hasError}
                      onImageError={() => {
                        setImageErrors((prev) => new Set(prev).add(book.img));
                      }}
                    />
                  </div>
                );
              })}

              {/* Clone first items at the end for infinite loop */}
              {carouselBooks.map((book, idx) => {
                const hasError = imageErrors.has(book.img);
                return (
                  <div
                    key={`clone-end-${idx}`}
                    className="snap-center shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-18px)]"
                  >
                    <CarouselCard
                      book={book.realBook}
                      coverImage={book.img}
                      price={book.price / 100}
                      hasError={hasError}
                      onImageError={() => {
                        setImageErrors((prev) => new Set(prev).add(book.img));
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button
              aria-label="Scroll Right"
              className="absolute right-0 top-0 z-10 bg-black/20 hover:bg-black/10 shadow-lg cursor-pointer w-12 h-full flex items-center justify-center hover:shadow-xl transition-all"
              onClick={() => scroll("right")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-8 h-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Carousel;
