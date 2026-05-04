import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import bookService from "../services/bookService";
import BookCard from "../components/BookCard";
import PageTransition from "../components/PageTransition";
import type { Book } from "../types/book";
import { Search, X } from "lucide-react";

export default function AllBooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [selectedFormat, setSelectedFormat] = useState(
    searchParams.get("format") || "",
  );

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetched = await bookService.getAllBooks();
        setBooks(fetched);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Sync state FROM URL when navbar (or any external link) changes params
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedFormat(searchParams.get("format") || "");
  }, [searchParams]);

  // Sync filters TO URL when user interacts with the filter controls
  const updateFilters = (
    newQuery: string,
    newCategory: string,
    newFormat: string,
  ) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set("q", newQuery.trim());
    if (newCategory) params.set("category", newCategory);
    if (newFormat) params.set("format", newFormat);
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
    return books.filter((b) => {
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
  }, [books, query, selectedCategory, selectedFormat]);

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasFilters = query || selectedCategory || selectedFormat;

  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-light">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h1 className="text-4xl font-serif font-bold italic text-gray-800 mb-2">
              All Books
            </h1>
            <p className="text-gray-500 text-sm">
              {loading
                ? "Loading..."
                : `${filtered.length} of ${books.length} books`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={query}
                onChange={(e) =>
                  updateFilters(
                    e.target.value,
                    selectedCategory,
                    selectedFormat,
                  )
                }
                placeholder="Search by title, author, or category…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white"
              />
              {query && (
                <button
                  onClick={() =>
                    updateFilters("", selectedCategory, selectedFormat)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) =>
                updateFilters(query, e.target.value, selectedFormat)
              }
              className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 min-w-[160px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Format filter */}
            <select
              value={selectedFormat}
              onChange={(e) =>
                updateFilters(query, selectedCategory, e.target.value)
              }
              className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 min-w-[140px]"
            >
              <option value="">All Formats</option>
              {formats.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt.charAt(0) + fmt.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-sm text-brand border border-brand-light rounded-lg hover:bg-brand-light transition-colors whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* States */}
          {loading && (
            <div className="flex justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Loading books…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-gray-500">No books found.</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 underline text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filtered.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
