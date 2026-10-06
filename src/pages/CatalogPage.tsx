import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  Heart,
  ShieldCheck,
  Tablet,
} from "lucide-react";
import bookService from "../services/bookService";
import BookCard from "../components/BookCard";
import BookRail from "../components/BookRail";
import Hero from "../components/Hero";
import PageTransition from "../components/PageTransition";
import SectionHeading from "../components/ui/SectionHeading";
import StatePanel from "../components/ui/StatePanel";
import { BookGridSkeleton } from "../components/ui/Skeletons";
import { getCategoryColor } from "../utils/categoryColors";
import type { Book } from "../types/book";

const FEATURED_COUNT = 8;
// A "new arrivals" shelf only adds value once there are more books than the grid shows.
const MIN_BOOKS_FOR_RAIL = 5;
// A category earns its own carousel once it has this many books; show the biggest few.
const MIN_BOOKS_FOR_CATEGORY_RAIL = 5;
const CATEGORY_RAIL_COUNT = 3;

const values = [
  {
    icon: Tablet,
    title: "Read on any screen",
    text: "Digital editions land in your personal library, ready to read on a phone, tablet or laptop.",
  },
  {
    icon: BookMarked,
    title: "Print or digital",
    text: "Choose a book to hold at bedtime, or one to open straight away. Many titles come both ways.",
  },
  {
    icon: Heart,
    title: "Chosen with care",
    text: "Warm, gentle stories and early-learning reads that suit curious young readers.",
  },
  {
    icon: ShieldCheck,
    title: "Safe, simple checkout",
    text: "Clear prices in UGX and an order history you can check any time.",
  },
];

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        setBooks(await bookService.getAllBooks());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch books");
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [reloadKey]);

  const allBooks = useMemo(() => (Array.isArray(books) ? books : []), [books]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    allBooks.forEach((b) =>
      b.categoryNames?.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)),
    );
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }, [allBooks]);

  const categoryRails = useMemo(
    () =>
      categories
        .filter((c) => c.count >= MIN_BOOKS_FOR_CATEGORY_RAIL)
        .slice(0, CATEGORY_RAIL_COUNT)
        .map(({ name }) => ({
          name,
          books: allBooks
            .filter((b) => b.categoryNames?.includes(name))
            .sort((a, b) =>
              (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
            ),
        })),
    [categories, allBooks],
  );

  const newest = useMemo(
    () =>
      [...allBooks]
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        .slice(0, 10),
    [allBooks],
  );

  const isFiltered = Boolean(query || selectedCategory);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBooks.filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.categoryNames?.some((c) => c.toLowerCase().includes(q));
      const matchesCategory =
        !selectedCategory || b.categoryNames?.includes(selectedCategory);
      return matchesQuery && matchesCategory;
    });
  }, [allBooks, query, selectedCategory]);

  const shelf = isFiltered ? filtered : allBooks.slice(0, FEATURED_COUNT);

  let shelfContent;
  if (loading) {
    shelfContent = <BookGridSkeleton count={FEATURED_COUNT} />;
  } else if (error) {
    shelfContent = (
      <StatePanel
        variant="error"
        title="We couldn't load the books"
        message="Please check your connection and try again."
        action={
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="kb-btn kb-btn-primary"
          >
            Try again
          </button>
        }
      />
    );
  } else if (shelf.length === 0) {
    shelfContent = (
      <StatePanel
        variant={isFiltered ? "search" : "empty"}
        title={isFiltered ? "No books match that search" : "No books yet"}
        message={
          isFiltered
            ? "Try a different word, or browse the whole library."
            : "New stories are on their way. Please check back soon."
        }
        action={
          isFiltered && (
            <Link to="/books" className="kb-btn kb-btn-primary">
              Browse all books
            </Link>
          )
        }
      />
    );
  } else {
    shelfContent = (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {shelf.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    );
  }

  return (
    <PageTransition>
      <div>
        <Hero books={allBooks} />

        {categories.length > 0 && !isFiltered && (
          <section
            aria-labelledby="browse-title"
            className="kb-container py-12 md:py-16"
          >
            <SectionHeading
              id="browse-title"
              eyebrow="Browse"
              title="Find a story by theme"
              description="Pick a shelf and see what's inside."
            />
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {categories.slice(0, 8).map(({ name, count }) => (
                <li key={name}>
                  <Link
                    to={`/books?category=${encodeURIComponent(name)}`}
                    className={`group flex h-full min-h-28 flex-col justify-between rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-soft) sm:p-5 ${getCategoryColor(name)}`}
                  >
                    <span className="font-display text-lg leading-tight font-bold capitalize sm:text-xl">
                      {name}
                    </span>
                    <span className="mt-4 flex items-center justify-between text-sm font-bold">
                      {count} {count === 1 ? "book" : "books"}
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!isFiltered && !loading && allBooks.length >= MIN_BOOKS_FOR_RAIL && (
          <section
            aria-labelledby="new-title"
            className="border-y border-line bg-white/60 py-12 md:py-16"
          >
            <div className="kb-container">
              <SectionHeading
                id="new-title"
                eyebrow="Just in"
                title="New on the shelf"
                action={
                  <Link to="/books" className="kb-btn kb-btn-quiet kb-btn-sm">
                    See everything{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                }
              />
              <BookRail books={newest} label="New books" />
            </div>
          </section>
        )}

        {!isFiltered &&
          !loading &&
          categoryRails.map(({ name, books: categoryBooks }) => (
            <section
              key={name}
              aria-labelledby={`rail-${name}`}
              className="kb-container py-12 md:py-16"
            >
              <SectionHeading
                id={`rail-${name}`}
                eyebrow="Category"
                title={name}
                action={
                  <Link
                    to={`/books?category=${encodeURIComponent(name)}`}
                    className="kb-btn kb-btn-quiet kb-btn-sm"
                  >
                    See all {categoryBooks.length}{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                }
              />
              <BookRail books={categoryBooks} label={`${name} books`} />
            </section>
          ))}

        <section
          id="catalog-grid"
          aria-labelledby="catalog-title"
          className="kb-container py-12 md:py-16"
        >
          <SectionHeading
            id="catalog-title"
            eyebrow={isFiltered ? "Results" : "Our library"}
            title={
              selectedCategory
                ? `${selectedCategory} books`
                : query
                  ? `Results for "${query}"`
                  : "Popular reads"
            }
            description={
              isFiltered && !loading && !error
                ? `${filtered.length} ${filtered.length === 1 ? "book" : "books"} found`
                : undefined
            }
            action={
              isFiltered ? (
                <Link to="/" className="kb-btn kb-btn-secondary kb-btn-sm">
                  Clear filters
                </Link>
              ) : undefined
            }
          />
          {shelfContent}

          {!isFiltered &&
            !loading &&
            !error &&
            allBooks.length > FEATURED_COUNT && (
              <div className="mt-12 text-center">
                <Link to="/books" className="kb-btn kb-btn-primary px-8">
                  Browse the full library ({allBooks.length})
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            )}
        </section>

        {!isFiltered && (
          <section
            aria-labelledby="values-title"
            className="kb-paper border-t border-line py-14 md:py-20"
          >
            <div className="kb-container">
              <SectionHeading
                id="values-title"
                eyebrow="Why families choose us"
                title="Storytime, made simple"
              />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {values.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="kb-card p-6 text-left">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}
