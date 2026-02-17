import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Grid, List } from "lucide-react";
import BookCard from "../components/BookCard";
import bookService from "../services/bookService";
import type { Book } from "../types/book";
import categoryService, { Category } from "../services/categoryService";
import { getImageUrl } from "../utils/imageUtils";

export default function SearchResultsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState<
        "relevance" | "price-low" | "price-high" | "newest"
    >("relevance");
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    const searchQuery = searchParams.get("q") || "";
    const selectedCategory = searchParams.get("category") || "";

    // Fetch books and categories
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [booksRes, categoriesRes] = await Promise.all([
                    bookService.getAllBooks(),
                    categoryService.getAllCategories(),
                ]);
                setBooks(booksRes);
                setCategories(categoriesRes);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter and sort books
    const filteredAndSortedBooks = useMemo(() => {
        let results = books;

        // Apply search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            results = results.filter(
                (book) =>
                    book.title.toLowerCase().includes(lowerQuery) ||
                    book.author?.toLowerCase().includes(lowerQuery) ||
                    book.description?.toLowerCase().includes(lowerQuery),
            );
        }

        // Apply category filter
        if (selectedCategory) {
            results = results.filter((book) =>
                book.categoryNames?.some(
                    (cat) =>
                        cat.toLowerCase() === selectedCategory.toLowerCase(),
                ),
            );
        }

        // Apply sorting
        const sorted = [...results];
        switch (sortBy) {
            case "price-low":
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case "price-high":
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case "newest":
                sorted.sort(
                    (a, b) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime(),
                );
                break;
            case "relevance":
            default:
                // Keep original order
                break;
        }

        return sorted;
    }, [books, searchQuery, selectedCategory, sortBy]);

    // Paginate results
    const totalPages = Math.ceil(filteredAndSortedBooks.length / itemsPerPage);
    const paginatedBooks = useMemo(() => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedBooks.slice(startIdx, startIdx + itemsPerPage);
    }, [filteredAndSortedBooks, currentPage, itemsPerPage]);

    const startResult =
        filteredAndSortedBooks.length === 0
            ? 0
            : (currentPage - 1) * itemsPerPage + 1;
    const endResult = Math.min(
        currentPage * itemsPerPage,
        filteredAndSortedBooks.length,
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Results Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {searchQuery
                            ? `Search Results for "${searchQuery}"`
                            : "All Books"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {filteredAndSortedBooks.length === 0
                            ? "No results found"
                            : `${startResult} - ${endResult} of ${filteredAndSortedBooks.length} results`}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-6 sticky top-24">
                            {/* Category Filter */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Categories
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value=""
                                            checked={selectedCategory === ""}
                                            onChange={() =>
                                                setSearchParams({
                                                    q: searchQuery,
                                                })
                                            }
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-3 text-gray-700">
                                            All Categories
                                        </span>
                                    </label>
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="flex items-center"
                                        >
                                            <input
                                                type="radio"
                                                name="category"
                                                value={category.name}
                                                checked={
                                                    selectedCategory ===
                                                    category.name
                                                }
                                                onChange={() =>
                                                    setSearchParams({
                                                        q: searchQuery,
                                                        category: category.name,
                                                    })
                                                }
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <span className="ml-3 text-gray-700">
                                                {category.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter (placeholder) */}
                            <div className="mb-8 pb-8 border-b">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Price Range
                                </h3>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-3 text-gray-700">
                                            Under $10
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-3 text-gray-700">
                                            $10 - $25
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-3 text-gray-700">
                                            $25 - $50
                                        </span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-3 text-gray-700">
                                            Over $50
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Results */}
                    <div className="lg:col-span-3">
                        {/* Toolbar */}
                        <div className="bg-white rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <label className="text-gray-700 text-sm">
                                    Show:
                                </label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-gray-700 text-sm">
                                        Sort by:
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(
                                                e.target.value as
                                                    | "relevance"
                                                    | "price-low"
                                                    | "price-high"
                                                    | "newest",
                                            )
                                        }
                                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                                    >
                                        <option value="relevance">
                                            Top Matches
                                        </option>
                                        <option value="newest">Newest</option>
                                        <option value="price-low">
                                            Price: Low to High
                                        </option>
                                        <option value="price-high">
                                            Price: High to Low
                                        </option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 border-l pl-4">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"}`}
                                        title="Grid view"
                                    >
                                        <Grid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded ${viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"}`}
                                        title="List view"
                                    >
                                        <List size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Grid/List */}
                        {paginatedBooks.length === 0 ? (
                            <div className="bg-white rounded-lg p-12 text-center">
                                <p className="text-gray-500 text-lg">
                                    No books found matching your criteria.
                                </p>
                            </div>
                        ) : null}

                        {paginatedBooks.length > 0 && viewMode === "grid" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedBooks.map((book) => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        )}

                        {paginatedBooks.length > 0 && viewMode === "list" && (
                            <div className="space-y-4">
                                {paginatedBooks.map((book) => (
                                    <div
                                        key={book.id}
                                        className="bg-white rounded-lg p-4 flex gap-4"
                                    >
                                        <div className="w-24 h-32 shrink-0 bg-gray-200 rounded flex items-center justify-center">
                                            {book.coverImageUrl ? (
                                                <img
                                                    src={getImageUrl(
                                                        book.coverImageUrl,
                                                    )}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover rounded"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : null}
                                            {!book.coverImageUrl && (
                                                <svg
                                                    className="w-12 h-12 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.5S6.5 26.747 12 26.747s10-4.5 10-10.247S17.5 6.253 12 6.253z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {book.title}
                                            </h3>
                                            <p className="text-gray-600">
                                                {book.author}
                                            </p>
                                            <p className="text-gray-700 mt-2 line-clamp-2">
                                                {book.description}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    $
                                                    {(book.price || 0).toFixed(
                                                        2,
                                                    )}
                                                </span>
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(p - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {Array.from({
                                    length: Math.min(5, totalPages),
                                }).map((_, i) => {
                                    const pageNum =
                                        Math.max(1, currentPage - 2) + i;
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() =>
                                                setCurrentPage(pageNum)
                                            }
                                            className={`px-4 py-2 rounded transition ${
                                                currentPage === pageNum
                                                    ? "bg-blue-600 text-white"
                                                    : "border border-gray-300 hover:bg-gray-100"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(p + 1, totalPages),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
