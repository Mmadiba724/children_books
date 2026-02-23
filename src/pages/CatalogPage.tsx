import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import bookService from "../services/bookService";
import BookCard from "../components/BookCard";
import Carousel from "../components/Carousel";
import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";
import type { Book } from "../types/book";

export default function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize query and category from URL params
    useEffect(() => {
        const qParam = searchParams.get("q");
        const categoryParam = searchParams.get("category");
        setQuery(qParam || "");
        setSelectedCategory(categoryParam || "");
    }, [searchParams]);

    // Handle search input change - update both state and URL
    const handleSearch = (newQuery: string) => {
        setQuery(newQuery);
        const params = new URLSearchParams();
        if (newQuery.trim()) {
            params.append("q", newQuery.trim());
        }
        if (selectedCategory && selectedCategory !== "All") {
            params.append("category", selectedCategory);
        }
        setSearchParams(params);
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedBooks = await bookService.getAllBooks();
                setBooks(fetchedBooks);
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch books";
                setError(errorMessage);
                console.error("Error fetching books:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const normalized = (s: string) => s.trim().toLowerCase();

    const filtered = useMemo(() => {
        const booksArray = Array.isArray(books) ? books : [];
        let result = booksArray;

        // Filter by search query
        if (query) {
            const q = normalized(query);
            result = result.filter((b) => {
                return (
                    normalized(b.title).includes(q) ||
                    normalized(b.author).includes(q) ||
                    b.categoryNames?.some((cat) => normalized(cat).includes(q))
                );
            });
        }

        // Filter by category
        if (selectedCategory && selectedCategory !== "All") {
            result = result.filter((b) =>
                b.categoryNames?.includes(selectedCategory),
            );
        }

        return result;
    }, [query, selectedCategory, books]);

    return (
        <div className="max-w-8xl mx-auto px-4 md:px-6">
            <Hero
                onSearch={handleSearch}
                query={query}
                searchResults={filtered}
            />

            <main className="mt-10 px-4 md:px-8 max-w-8xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <h2 className="text-3xl md:text-3xl font-serif italic text-gray-700">
                        {selectedCategory ? `${selectedCategory} Books` : "All Books"}
                    </h2>
                    {query && (
                        <div className="text-sm text-gray-600">
                            Found {filtered.length} matches
                            <button
                                onClick={() => setQuery("")}
                                className="ml-3 text-rose-600 underline"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">Loading books...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">
                            {query
                                ? "No books found matching your search."
                                : "No books available."}
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <div
                        id="catalog-grid"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {filtered.map((b) => (
                            <BookCard key={b.id} book={b}/>
                        ))}
                    </div>
                )}
            </main>

            <section className="mt-6">
                <Carousel />
            </section>

            <Testimonials />
        </div>
    );
}
