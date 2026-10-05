import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import BookCard from "../components/BookCard";
import BookDetailsColumn from "../components/BookDetailsColumn";
import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/ui/BookCover";
import RatingStars from "../components/ui/RatingStars";
import StatePanel from "../components/ui/StatePanel";
import { BookGridSkeleton } from "../components/ui/Skeletons";
import bookService from "../services/bookService";
import categoryService from "../services/categoryService";
import type { Book } from "../types/book";
import { useBookReviews } from "../hooks/useBookReviews";
import { useState, useEffect, useCallback } from "react";

function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading book details"
      className="kb-container grid gap-10 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16"
    >
      <div className="kb-skeleton mx-auto aspect-3/4 w-full max-w-xs rounded-2xl lg:max-w-md" />
      <div className="space-y-5">
        <div className="kb-skeleton h-6 w-24 rounded-full" />
        <div className="kb-skeleton h-12 w-4/5" />
        <div className="kb-skeleton h-5 w-1/3" />
        <div className="kb-skeleton h-44 w-full rounded-2xl" />
      </div>
      <span className="sr-only">Loading book details…</span>
    </div>
  );
}

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const { addReview, getReviewsForBook } = useBookReviews();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const fetchedBook = await bookService.getBookById(id);
        setBook(fetchedBook);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch book details";
        setError(errorMessage);
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, reloadKey]);

  const countMatchingCategories = (
    bookCategoryNames: string[] | undefined,
    targetCategories: string[],
  ): number => {
    if (!bookCategoryNames) return 0;
    return bookCategoryNames.filter((cat) => targetCategories.includes(cat))
      .length;
  };

  const sharesCategoryWithBook = (
    bookCategoryNames: string[] | undefined,
    targetCategories: string[],
  ): boolean => {
    if (!bookCategoryNames || bookCategoryNames.length === 0) return false;
    return bookCategoryNames.some((category) =>
      targetCategories.includes(category),
    );
  };

  // Fetch similar books based on shared categories
  const fetchSimilarBooks = useCallback(async () => {
    if (!book?.categoryNames?.length) {
      setSimilarBooks([]);
      return;
    }

    try {
      setLoadingSimilar(true);

      // Fetch all available categories to validate book categories
      const categories = await categoryService.getAllCategories();
      const categoryNames = new Set(categories.map((c) => c.name));

      // Get valid categories from the current book
      const bookCategories = book.categoryNames.filter((cat) =>
        categoryNames.has(cat),
      );

      if (bookCategories.length === 0) {
        setSimilarBooks([]);
        return;
      }

      const allBooks = await bookService.getAllBooks();

      // Filter books that share at least one category with the current book
      const similar = allBooks.filter((b) => {
        if (b.id === book.id) return false;
        if (!b.categoryNames || b.categoryNames.length === 0) return false;
        return sharesCategoryWithBook(b.categoryNames, bookCategories);
      });

      // Sort by number of matching categories (more matches = more similar)
      similar.sort(
        (a, b) =>
          countMatchingCategories(b.categoryNames, bookCategories) -
          countMatchingCategories(a.categoryNames, bookCategories),
      );

      setSimilarBooks(similar.slice(0, 8));
    } catch (err) {
      console.error("Error fetching similar books:", err);
      setSimilarBooks([]);
    } finally {
      setLoadingSimilar(false);
    }
  }, [book]);

  useEffect(() => {
    fetchSimilarBooks();
  }, [fetchSimilarBooks]);

  if (loading) {
    return (
      <PageTransition>
        <DetailSkeleton />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <StatePanel
        variant="error"
        title="We couldn't open this book"
        message="Something went wrong while loading it. Please try again."
        className="py-24"
        action={
          <>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="kb-btn kb-btn-primary"
            >
              Try again
            </button>
            <Link to="/books" className="kb-btn kb-btn-secondary">
              Browse books
            </Link>
          </>
        }
      />
    );
  }

  if (!book) {
    return (
      <StatePanel
        variant="search"
        title="Book not found"
        message="This book may have been moved or removed."
        className="py-24"
        action={
          <Link to="/books" className="kb-btn kb-btn-primary">
            Browse all books
          </Link>
        }
      />
    );
  }

  const bookReviews = getReviewsForBook(String(book.id));
  const rating =
    bookReviews.length > 0
      ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
      : null;
  const firstCategory = book.categoryNames?.[0];

  return (
    <PageTransition>
      <div>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="kb-container pt-5 text-left">
          <ol className="flex flex-wrap items-center gap-1 text-sm font-bold text-muted">
            <li>
              <Link to="/" className="hover:text-brand-dark">
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <li>
              <Link to="/books" className="hover:text-brand-dark">
                Books
              </Link>
            </li>
            {firstCategory && (
              <>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                <li>
                  <Link
                    to={`/books?category=${encodeURIComponent(firstCategory)}`}
                    className="hover:text-brand-dark"
                  >
                    {firstCategory}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Hero: cover + purchase */}
        <section className="kb-container grid gap-8 py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-12">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <div className="kb-paper mx-auto flex justify-center rounded-3xl border border-line px-8 py-8 sm:px-14 sm:py-12">
              <div className="w-full max-w-[15rem] sm:max-w-xs lg:max-w-sm">
                <BookCover
                  title={book.title}
                  coverImageUrl={book.coverImageUrl}
                  eager
                />
              </div>
            </div>
          </div>

          <BookDetailsColumn
            book={book}
            rating={rating}
            reviewCount={bookReviews.length}
          />
        </section>

        {/* Description */}
        <section
          aria-labelledby="about-book"
          className="border-y border-line bg-white/70 py-10 md:py-14"
        >
          <div className="kb-container text-left">
            <h2 id="about-book" className="kb-section-title mb-4">
              About this book
            </h2>
            <p className="max-w-prose text-lg leading-8 text-ink-soft">
              {book.description ||
                "No description available for this book yet."}
            </p>
          </div>
        </section>

        {/* Reviews */}
        <section
          aria-labelledby="reviews-title"
          className="kb-container py-10 text-left md:py-14"
        >
          <h2 id="reviews-title" className="kb-section-title mb-8">
            Reader reviews
          </h2>
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-14">
            <div className="lg:col-span-1">
              {rating !== null ? (
                <div className="mb-6">
                  <p className="font-display text-5xl font-extrabold">
                    {rating.toFixed(1)}
                    <span className="ml-1 text-xl font-bold text-muted">
                      / 5
                    </span>
                  </p>
                  <div className="mt-2">
                    <RatingStars value={rating} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    Based on {bookReviews.length}{" "}
                    {bookReviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              ) : (
                <p className="mb-6 text-ink-soft">
                  No ratings yet. Be the first to share what you thought.
                </p>
              )}

              <div className="space-y-2" hidden={bookReviews.length === 0}>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = bookReviews.filter(
                    (r) => r.rating === stars,
                  ).length;
                  const percentage =
                    bookReviews.length > 0
                      ? Math.round((count / bookReviews.length) * 100)
                      : 0;
                  return (
                    <div
                      key={stars}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-10 font-bold text-ink-soft">
                        {stars} star
                      </span>
                      <div
                        className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-deep"
                        role="presentation"
                      >
                        <div
                          className="h-full rounded-full bg-sun"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-ink-soft">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-line pt-6">
                <h3 className="font-display text-lg font-bold">
                  Share your thoughts
                </h3>
                <p className="mt-1 mb-4 text-sm text-ink-soft">
                  Reviews are saved on this device.
                </p>
                <AddReviewForm onAdd={(r) => addReview(String(book.id), r)} />
              </div>
            </div>

            <div className="lg:col-span-2">
              <ReviewsList bookReviews={bookReviews} />
            </div>
          </div>
        </section>

        {/* Similar books */}
        {(loadingSimilar || similarBooks.length > 0) && (
          <section
            aria-labelledby="similar-title"
            className="kb-paper border-t border-line py-10 md:py-14"
          >
            <div className="kb-container">
              <h2
                id="similar-title"
                className="kb-section-title mb-8 text-left"
              >
                You might also like
              </h2>
              {loadingSimilar ? (
                <BookGridSkeleton count={4} />
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
                  {similarBooks.map((b) => (
                    <BookCard book={b} key={b.id} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}
