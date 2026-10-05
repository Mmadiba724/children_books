import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import bookService from "../services/bookService";
import BookCard from "../components/BookCard";
import PageTransition from "../components/PageTransition";
import StatePanel from "../components/ui/StatePanel";
import { BookGridSkeleton } from "../components/ui/Skeletons";
import type { Book } from "../types/book";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "title";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "title", label: "Title A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const FORMAT_LABELS: Record<string, string> = {
  DIGITAL: "Digital",
  PHYSICAL: "Print",
};

const formatLabel = (fmt: string) =>
  FORMAT_LABELS[fmt] ?? fmt.charAt(0) + fmt.slice(1).toLowerCase();

const isSortKey = (v: string | null): v is SortKey =>
  SORT_OPTIONS.some((o) => o.value === v);

export default function AllBooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // URL is the single source of truth for filters, so links from the
  // navbar, home page and category chips all stay in sync.
  const query = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "";
  const selectedFormat = searchParams.get("format") || "";
  const sortParam = searchParams.get("sort");
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "featured";

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        setBooks(await bookService.getAllBooks());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [reloadKey]);

  const updateFilters = (changes: Record<string, string>) => {
    const next = {
      q: query,
      category: selectedCategory,
      format: selectedFormat,
      sort: sort === "featured" ? "" : sort,
      ...changes,
    };
    const params = new URLSearchParams();
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.category) params.set("category", next.category);
    if (next.format) params.set("format", next.format);
    if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
    setSearchParams(params, { replace: true });
  };

  const categories = useMemo(() => {
    const all = books.flatMap((b) => b.categoryNames ?? []);
    return Array.from(new Set(all)).sort();
  }, [books]);

  const formats = useMemo(() => {
    const all = books.map((b) => b.format).filter(Boolean);
    return Array.from(new Set(all)).sort();
  }, [books]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = books.filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.categoryNames?.some((c) => c.toLowerCase().includes(q));
      const matchesCategory =
        !selectedCategory || b.categoryNames?.includes(selectedCategory);
      const matchesFormat = !selectedFormat || b.format === selectedFormat;
      return matchesQuery && matchesCategory && matchesFormat;
    });

    switch (sort) {
      case "newest":
        return [...result].sort((a, b) =>
          (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
        );
      case "title":
        return [...result].sort((a, b) => a.title.localeCompare(b.title));
      case "price-asc":
        return [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "price-desc":
        return [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      default:
        return result;
    }
  }, [books, query, selectedCategory, selectedFormat, sort]);

  const hasFilters = Boolean(query || selectedCategory || selectedFormat);
  const clearFilters = () => setSearchParams({}, { replace: true });

  let results;
  if (loading) {
    results = <BookGridSkeleton count={10} />;
  } else if (error) {
    results = (
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
  } else if (filtered.length === 0) {
    results = (
      <StatePanel
        variant={hasFilters ? "search" : "empty"}
        title={hasFilters ? "No books match your filters" : "No books yet"}
        message={
          hasFilters
            ? "Try removing a filter or searching for something different."
            : "New stories are on their way. Please check back soon."
        }
        action={
          hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="kb-btn kb-btn-primary"
            >
              Clear all filters
            </button>
          )
        }
      />
    );
  } else {
    results = (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  }

  return (
    <PageTransition>
      <div>
        <header className="kb-paper border-b border-line py-8 text-left md:py-12">
          <div className="kb-container">
            <p className="kb-eyebrow mb-1">Library</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight capitalize sm:text-5xl">
              {selectedCategory ? `${selectedCategory} books` : "All books"}
            </h1>
            <p className="mt-2 text-ink-soft" aria-live="polite">
              {loading
                ? "Loading the shelves…"
                : `${filtered.length} of ${books.length} ${books.length === 1 ? "book" : "books"}`}
            </p>
          </div>
        </header>

        <div className="kb-container py-6 md:py-8">
          <div className="mb-8 space-y-4 text-left">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <label htmlFor="books-search" className="sr-only">
                  Search by title, author or category
                </label>
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="books-search"
                  type="search"
                  value={query}
                  onChange={(e) => updateFilters({ q: e.target.value })}
                  placeholder="Search by title, author or category"
                  className="kb-input !rounded-full pr-11 pl-11"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => updateFilters({ q: "" })}
                    className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-brand-light hover:text-brand-dark"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:w-60">
                <label
                  htmlFor="books-sort"
                  className="text-sm font-bold whitespace-nowrap text-ink-soft"
                >
                  Sort by
                </label>
                <select
                  id="books-sort"
                  value={sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="kb-input !rounded-full font-bold"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {categories.length > 0 && (
              <div
                role="group"
                aria-label="Filter by category"
                className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
              >
                <button
                  type="button"
                  className="kb-chip"
                  aria-pressed={!selectedCategory}
                  onClick={() => updateFilters({ category: "" })}
                >
                  All categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="kb-chip"
                    aria-pressed={selectedCategory === cat}
                    onClick={() =>
                      updateFilters({
                        category: selectedCategory === cat ? "" : cat,
                      })
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {formats.length > 1 && (
                <div
                  role="group"
                  aria-label="Filter by format"
                  className="flex flex-wrap gap-2"
                >
                  <button
                    type="button"
                    className="kb-chip"
                    aria-pressed={!selectedFormat}
                    onClick={() => updateFilters({ format: "" })}
                  >
                    Any format
                  </button>
                  {formats.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className="kb-chip"
                      aria-pressed={selectedFormat === fmt}
                      onClick={() =>
                        updateFilters({
                          format: selectedFormat === fmt ? "" : fmt,
                        })
                      }
                    >
                      {formatLabel(fmt)}
                    </button>
                  ))}
                </div>
              )}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="kb-btn kb-btn-quiet kb-btn-sm"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {results}
        </div>
      </div>
    </PageTransition>
  );
}
