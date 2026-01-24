import { useParams } from "react-router-dom";
import { getBookById, books as allBooks, type Book } from "../data/books";
import BookCard from "../components/BookCard";
import BookDetailsColumn from "../components/BookDetailsColumn";
import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";
// import { useCart } from "../context/CartContext";
import { useBookReviews } from "../hooks/useBookReviews";
import { useMemo } from "react";
// import { useState, useMemo } from "react";

// Mock ratings for display — can be replaced with real data later
const MOCK_RATINGS: Record<string, number> = {
    "bunny-adventure": 4.6,
    "stella-stargazer": 4.8,
    "little-chef": 4.4,
    "forest-music": 4.2,
    "milo-moonboat": 4.9,
    "rainbow-garden": 4.3,
};

export default function BookDetailPage() {
    const { id } = useParams();
    const book = id ? getBookById(id) : undefined;
    // const { add } = useCart();
    const { addReview, getReviewsForBook } = useBookReviews();
    // const [qty, setQty] = useState(1);

    // Compute similar books by category or ageRange
    const similarBooks: Book[] = useMemo(() => {
        if (!book) return [];
        const matches = allBooks.filter((b) => {
            if (b.id === book.id) return false;
            // match by shared category
            const sharesCategory =
                b.categories &&
                book.categories &&
                b.categories.some((c) => book.categories?.includes(c));
            const sameAge =
                b.ageRange &&
                book.ageRange &&
                b.ageRange.split("-")[0] === book.ageRange.split("-")[0];
            return Boolean(sharesCategory || sameAge);
        });
        return matches.slice(0, 4);
    }, [book]);

    if (!book) return <div className="p-6">Book not found.</div>;

    const rating = MOCK_RATINGS[book.id] ?? 4.4;
    const bookReviews = getReviewsForBook(book.id);

    return (
        <div className="max-w-8xl mx-auto p-4 sm:p-6 px-4 sm:px-6 lg:px-12">
            {/* top section */}
            <div className="flex flex-col items-start mx-auto justify-center lg:grid lg:grid-cols-2 lg:gap-6 w-400 ">
                {/* Left column: cover + preview */}
                <div className="lg:col-span-1 justify-self-end pr-12">
                    {/* here we can fetch/show other covers if they exist */}

                    {/* cover image of the book */}
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full shadow-xl mb-4 sm:mb-6 object-cover max-w-md mx-auto "
                        style={{ aspectRatio: "3 / 4" }}
                    />

                    {/* Add to Wishlist button */}
                    <button className="flex items-center justify-center gap-2 w-full max-w-md mx-auto text-teal-600 hover:text-teal-700 py-2 transition-colors">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <span className="font-medium">Add to Wishlist</span>
                    </button>
                </div>

                {/* Right column: order summary */}
                <aside className="lg:col-span-1 lg:sticky lg:top-24 ">
                    <div className="px-4">
                        {/* Middle column: details, description, author, reviews */}
                        <BookDetailsColumn
                            book={book}
                            rating={rating}
                            // bookReviews={bookReviews}
                        />
                    </div>
                </aside>
            </div>

            {/* book overview */}
            <div className="mt-8 sm:mt-12 max-w-7xl mx-auto">
                <h2 className="text-3xl font-serif italic text-gray-700 mb-6">
                    Overview
                </h2>
                <div className="bg-white border border-gray-300 p-8 sm:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left column: Main description */}
                        <div className="space-y-4">
                            <p className="text-gray-900 leading-relaxed text-sm">
                                {book.description}
                            </p>
                            {book.previewPages &&
                                book.previewPages.length > 0 && (
                                    <>
                                        {book.previewPages.map(
                                            (preview, index) => (
                                                <p
                                                    key={index}
                                                    className="text-gray-900 leading-relaxed text-sm"
                                                >
                                                    {preview}
                                                </p>
                                            ),
                                        )}
                                    </>
                                )}
                        </div>

                        {/* Right column: Highlights and features */}
                        <div className="space-y-6">
                            <p className="text-gray-900 leading-relaxed text-sm">
                                This engaging story captivates young readers
                                with its vivid imagery and heartwarming
                                narrative, making it perfect for bedtime reading
                                or classroom story time.
                            </p>

                            <ul className="space-y-3 text-sm text-gray-900">
                                {book.ageRange && (
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-900 mt-1">
                                            •
                                        </span>
                                        <span>
                                            Perfect for ages {book.ageRange}{" "}
                                            years
                                        </span>
                                    </li>
                                )}
                                {book.categories &&
                                    book.categories.length > 0 && (
                                        <li className="flex items-start gap-2">
                                            <span className="text-gray-900 mt-1">
                                                •
                                            </span>
                                            <span>
                                                Features themes of{" "}
                                                {book.categories
                                                    .join(", ")
                                                    .toLowerCase()}
                                            </span>
                                        </li>
                                    )}
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-900 mt-1">
                                        •
                                    </span>
                                    <span>
                                        Beautifully illustrated story that
                                        captures imagination and inspires
                                        creativity
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-900 mt-1">
                                        •
                                    </span>
                                    <span>
                                        Includes discussion questions for family
                                        reading time and book clubs
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 sm:mt-12 max-w-7xl mx-auto">
                <h2 className="text-3xl font-serif italic text-gray-700 mb-6">
                    Testimonials
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column: Rating summary */}
                    <div className="lg:col-span-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Customer reviews
                        </h3>

                        {/* Overall rating */}
                        <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-2xl ${
                                        i < Math.floor(rating)
                                            ? "text-orange-400"
                                            : "text-gray-300"
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                            <span className="text-lg font-normal text-gray-900 ml-2">
                                {rating.toFixed(1)} out of 5
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            {bookReviews.length} global ratings
                        </p>

                        {/* Rating breakdown */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = bookReviews.filter(
                                    (r) => r.rating === stars,
                                ).length;
                                const percentage =
                                    bookReviews.length > 0
                                        ? Math.round(
                                              (count / bookReviews.length) *
                                                  100,
                                          )
                                        : 0;
                                return (
                                    <div
                                        key={stars}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-blue-600 hover:text-orange-600 cursor-pointer w-12">
                                            {stars} star
                                        </span>
                                        <div className="flex-1 h-5 bg-gray-200 rounded overflow-hidden">
                                            <div
                                                className="h-full bg-orange-400"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-blue-600 hover:text-orange-600 cursor-pointer w-10 text-right">
                                            {percentage}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Review this product */}
                        <div className="mt-8 pt-6 border-t border-gray-300">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                                Review this product
                            </h4>
                            <p className="text-sm text-gray-700 mb-4">
                                Share your thoughts with other customers
                            </p>
                            <AddReviewForm
                                onAdd={(r) => addReview(book.id, r)}
                            />
                        </div>
                    </div>

                    {/* Right column: Reviews list */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Top reviews
                        </h3>
                        <ReviewsList bookReviews={bookReviews} />
                    </div>
                </div>
            </div>

            {/* About Author */}
            <div className=""></div>

            {/* Similar books */}
            <div className="mt-8 sm:mt-12">
                <h2 className="text-3xl font-serif italic text-gray-700 mb-6">
                    Similar Books
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {similarBooks.length === 0 && (
                        <div className="text-sm text-gray-500">
                            We couldn't find similar books — try browsing the
                            catalog.
                        </div>
                    )}
                    {similarBooks.map((b) => (
                        <BookCard book={b} key={b.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
