import { useParams, Link } from "react-router-dom";
import { getBookById, books as allBooks, type Book } from "../data/books";
import BookPreview from "../components/BookPreview";
import BookCard from "../components/BookCard";
import { useCart } from "../context/CartContext";
import { useState, useMemo } from "react";
import { Star } from "lucide-react";

// Review type used locally
type Review = { name: string; rating: number; text: string; date?: string };

function ReviewsList({
    bookReviews,
}: Readonly<{
    bookReviews: Review[];
}>) {
    return (
        <div className="space-y-4">
            {bookReviews.length === 0 && (
                <div className="text-sm text-gray-500">
                    No reviews yet — be the first to review this book.
                </div>
            )}
            {bookReviews.map((r) => {
                const key = `${r.name}-${r.text.slice(0, 24)}`;
                return (
                    <div
                        key={key}
                        className="bg-white rounded-lg p-3 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="font-semibold">{r.name}</div>
                            <div className="text-sm text-gray-500">
                                {Array.from({ length: r.rating }).map(
                                    (_, sIdx) => (
                                        <Star
                                            key={`star-${r.name}-${sIdx}`}
                                            className="w-4 h-4 text-yellow-400 inline"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                            {r.text}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AddReviewForm({ onAdd }: Readonly<{ onAdd: (r: Review) => void }>) {
    const [name, setName] = useState("");
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [success, setSuccess] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !text.trim()) return;
        onAdd({
            name: name.trim(),
            rating,
            text: text.trim(),
            date: new Date().toISOString(),
        });
        setName("");
        setRating(5);
        setText("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
    }

    return (
        <form
            onSubmit={submit}
            className="mt-4 bg-white rounded-lg p-4 shadow-sm"
        >
            <h4 className="block text-sm font-medium text-gray-700">
                Add your review
            </h4>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label htmlFor="review-name" className="sr-only">
                    Your name
                </label>
                <input
                    id="review-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input input-bordered w-full sm:col-span-1"
                />

                <label htmlFor="review-rating" className="sr-only">
                    Rating
                </label>
                <select
                    id="review-rating"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="input input-bordered w-full sm:col-span-1"
                >
                    {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                            {r} stars
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="btn btn-primary w-full sm:col-span-1"
                >
                    Submit
                </button>
            </div>

            <label htmlFor="review-text" className="sr-only">
                Write your review
            </label>
            <textarea
                id="review-text"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your review"
                rows={3}
                className="mt-3 input input-bordered w-full"
            />
            {success && (
                <div className="mt-2 text-sm text-rose-600">
                    Thanks for your review!
                </div>
            )}
        </form>
    );
}

function BookDetailsColumn({
    book,
    rating,
    bookReviews,
    // onAddReview,
}: Readonly<{
    book: Book;
    rating: number;
    bookReviews: Review[];
    onAddReview: (r: Review) => void;
}>) {
    return (
        <div className="lg:col-span-1">
            <h1 className="text-4xl font-extrabold text-rose-600">
                {book.title}
            </h1>
            <p className="text-gray-700 mt-1">
                by{" "}
                <Link
                    to={`/search?author=${encodeURIComponent(book.author)}`}
                    className="text-indigo-600 font-medium"
                >
                    {book.author}
                </Link>
            </p>

            <div className="mt-4 flex items-center gap-4">
                <div className="inline-flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                        ({bookReviews.length} reviews)
                    </span>
                </div>

                <div className="text-sm text-gray-500">
                    {book.ageRange ? `Ages ${book.ageRange}` : ""}
                </div>

                <div className="ml-2 flex gap-2">
                    {book.categories?.map((c) => (
                        <span
                            key={c}
                            className="text-sm px-2 py-1 rounded-full bg-rose-50 text-rose-600"
                        >
                            {c}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-6 text-gray-700 leading-relaxed">
                <p>{book.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Sneak Peek</h4>
                <BookPreview book={book} />
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">About the author</h3>
                <p className="text-sm text-gray-600">
                    {book.author} is a children's author who writes gentle
                    stories for early readers. Their books focus on curiosity,
                    kindness, and cozy adventures. (Author bio placeholder — we
                    can add real bios later.)
                </p>
            </div>

            
        </div>
    );
}

export default function BookDetailPage() {
    const { id } = useParams();
    const book = id ? getBookById(id) : undefined;
    const { add } = useCart();
    const [qty, setQty] = useState(1);

    // Mock ratings and reviews for display — can be replaced with real data later
    const mockRatings: Record<string, number> = {
        "bunny-adventure": 4.6,
        "stella-stargazer": 4.8,
        "little-chef": 4.4,
        "forest-music": 4.2,
        "milo-moonboat": 4.9,
        "rainbow-garden": 4.3,
    };

    const reviewsByBook: Record<string, Review[]> = {
        "bunny-adventure": [
            {
                name: "Ava",
                rating: 5,
                text: "My toddler loves the bunny—so gentle and fun!",
                date: new Date().toISOString(),
            },
            {
                name: "Noah",
                rating: 4,
                text: "Great pictures and rhythm; bedtime winner.",
                date: new Date().toISOString(),
            },
        ],
    };

    // Persisted reviews (localStorage). Merge saved reviews with built-in ones.
    const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>(
        () => {
            let parsed: Record<string, Review[]> = {};
            try {
                parsed = JSON.parse(
                    localStorage.getItem("bookReviews") || "{}"
                );
            } catch (e) {
                console.warn("Failed to parse saved reviews", e);
                parsed = {};
            }
            const merged: Record<string, Review[]> = { ...reviewsByBook };
            Object.keys(parsed).forEach((k) => {
                merged[k] = [...(merged[k] || []), ...parsed[k]];
            });
            return merged;
        }
    );

    const addReview = (bookId: string, r: Review) => {
        setReviewsMap((prev) => {
            const next = {
                ...prev,
                [bookId]: [
                    ...(prev[bookId] || []),
                    { ...r, date: new Date().toISOString() },
                ],
            };
            try {
                // Save only user-added reviews to localStorage to avoid duplicating built-ins
                const saved: Record<string, Review[]> = {};
                Object.keys(next).forEach((id) => {
                    // to preserve built-ins, save only items beyond the built-in count
                    const built = reviewsByBook[id] || [];
                    if (next[id].length > built.length) {
                        saved[id] = next[id].slice(built.length);
                    }
                });
                localStorage.setItem("bookReviews", JSON.stringify(saved));
            } catch (e) {
                console.warn("Failed to save reviews", e);
            }
            return next;
        });
    };

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

    const rating = mockRatings[book.id] ?? 4.4;
    const bookReviews = reviewsMap[book.id] ?? reviewsByBook[book.id] ?? [];

    return (
        <div className="max-w-8xl mx-auto p-6 px-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left column: cover + preview */}
                <div className="lg:col-span-1">
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full rounded-3xl shadow-xl mb-6 object-cover"
                        style={{ aspectRatio: "3 / 4" }}
                    />
                </div>

                {/* Middle column: details, description, author, reviews */}
                <BookDetailsColumn
                    book={book}
                    rating={rating}
                    bookReviews={bookReviews}
                    onAddReview={(r) => addReview(book.id, r)}
                />

                {/* Right column: order summary */}
                <aside className="lg:col-span-1 sticky top-24">
                    <div className="bg-rose-50 rounded-2xl p-6 shadow">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-3xl font-bold text-indigo-600">
                            ${(book.priceCents / 100).toFixed(2)}
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                            Quantity
                        </div>
                        <div className="mt-2 flex items-center bg-white rounded-full shadow px-2 w-fit">
                            <button
                                aria-label="decrease"
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="px-3 py-1 text-xl"
                            >
                                −
                            </button>
                            <div className="px-4 font-bold">{qty}</div>
                            <button
                                aria-label="increase"
                                onClick={() => setQty(qty + 1)}
                                className="px-3 py-1 text-xl"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={() => add(book, qty)}
                            className="mt-4 w-full bg-linear-to-r from-indigo-500 to-cyan-500 text-white px-4 py-3 rounded-full shadow"
                        >
                            Add to cart
                        </button>
                        <button
                            onClick={() => add(book, 5)}
                            className="mt-3 w-full bg-amber-400 text-black px-4 py-3 rounded-full"
                        >
                            Add 5 (gift)
                        </button>

                        <div className="mt-4 text-sm text-gray-600">
                            Free shipping on orders over $25
                        </div>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-3">Reviews</h3>
                        <AddReviewForm onAdd={(r) => addReview(book.id, r)} />
                        <div className="mt-4">
                            <ReviewsList bookReviews={bookReviews} />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Similar books */}
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-rose-600 mb-4">
                    Similar books
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
