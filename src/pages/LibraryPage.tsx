import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Library } from "lucide-react";
import toast from "react-hot-toast";
import libraryService, { type LibraryBook } from "../services/libraryService";
import { parseLocalDate, formatLocalDate } from "../utils/dateUtils";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/ui/BookCover";
import StatePanel from "../components/ui/StatePanel";
import { BookGridSkeleton } from "../components/ui/Skeletons";

const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const LibraryPage = () => {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      const books = await libraryService.getMyLibrary();
      setBooks(books);
    } catch (error) {
      console.error("Failed to load library:", error);
      setLoadFailed(true);
      toast.error("Failed to load your library");
    } finally {
      setIsLoading(false);
    }
  };

  const recentCount = books.filter(
    (b) =>
      (parseLocalDate(b.purchasedAt)?.getTime() ?? 0) >
      Date.now() - RECENT_WINDOW_MS,
  ).length;

  let content;
  if (isLoading) {
    content = <BookGridSkeleton count={4} />;
  } else if (loadFailed) {
    content = (
      <StatePanel
        variant="error"
        title="We couldn't open your library"
        message="Please check your connection and try again."
        action={
          <button
            type="button"
            onClick={loadLibrary}
            className="kb-btn kb-btn-primary"
          >
            Try again
          </button>
        }
      />
    );
  } else if (books.length === 0) {
    content = (
      <StatePanel
        variant="empty"
        title="Your shelf is waiting"
        message="Digital books you buy will appear here, ready to read any time."
        action={
          <Link to="/books" className="kb-btn kb-btn-primary">
            Find a story
          </Link>
        }
      />
    );
  } else {
    content = (
      <>
        <p className="mb-8 text-left text-ink-soft" aria-live="polite">
          <strong className="font-extrabold text-ink">{books.length}</strong>{" "}
          {books.length === 1 ? "book" : "books"}
          {recentCount > 0 && (
            <>
              {" · "}
              <strong className="font-extrabold text-ink">
                {recentCount}
              </strong>{" "}
              added in the last 30 days
            </>
          )}
        </p>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {books.map((book) => {
            return (
              <li key={book.id} className="flex flex-col text-left">
                <Link
                  to={`/library/${book.bookId}/read`}
                  aria-label={`Read ${book.bookTitle}`}
                  className="group block rounded-xl px-1 pt-1 text-left"
                >
                  <div className="transition-transform duration-300 group-hover:-translate-y-1.5">
                    <BookCover
                      title={book.bookTitle}
                      coverImageUrl={book.coverImageUrl}
                      className="transition-shadow duration-300 group-hover:shadow-(--shadow-lift)"
                    />
                  </div>
                </Link>

                <h2 className="mt-4 line-clamp-2 font-display text-base leading-snug font-bold capitalize sm:text-lg">
                  {book.bookTitle}
                </h2>
                <p className="mt-1 line-clamp-1 text-sm text-ink-soft">
                  by {book.bookAuthor}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  Added {formatLocalDate(book.purchasedAt)}
                </p>

                <div className="mt-4">
                  <Link
                    to={`/library/${book.bookId}/read`}
                    className="kb-btn kb-btn-teal kb-btn-sm w-full"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Read book
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <PageTransition>
      <div>
        <header className="kb-paper border-b border-line py-8 text-left md:py-12">
          <div className="kb-container">
            <p className="kb-eyebrow mb-1 flex items-center gap-1.5">
              <Library className="h-4 w-4" aria-hidden="true" />
              Your collection
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              My library
            </h1>
            <p className="mt-2 text-ink-soft">
              Every digital book you own, ready whenever storytime is.
            </p>
          </div>
        </header>
        <div className="kb-container py-8 md:py-12">{content}</div>
      </div>
    </PageTransition>
  );
};

export default LibraryPage;
