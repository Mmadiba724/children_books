import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Pencil, Trash2, Image, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import bookService from "../services/bookService";
import type { Book } from "../types/book";
import AddBookModal from "./AddBookModal";
import { getImageUrl } from "../utils/imageUtils";

function BooksGrid({
    books,
    onEdit,
    onDelete,
}: Readonly<{
    books: Book[];
    onEdit: (book: Book) => void;
    onDelete: (book: Book) => void;
}>) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
                <div
                    key={book.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-100 hover:border-rose-200 transition-colors"
                >
                    {/* Book Cover */}
                    <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                        {book.coverImageUrl ? (
                            <img
                                src={getImageUrl(book.coverImageUrl)}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Image className="w-12 h-12 text-gray-400" />
                        )}
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                            {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                            {book.author}
                        </p>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {book.description}
                        </p>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-rose-600">
                                ${book.price.toFixed(2)}
                            </span>
                            <span
                                className={`text-xs px-2 py-1 rounded ${
                                    book.format === "DIGITAL"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700"
                                }`}
                            >
                                {book.format}
                            </span>
                        </div>

                        {book.format === "PHYSICAL" && (
                            <p className="text-xs text-gray-500 mb-2">
                                Stock: {book.stockQuantity}
                            </p>
                        )}

                        {book.categoryNames &&
                            book.categoryNames.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {book.categoryNames.map((cat) => (
                                        <span
                                            key={cat}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(book)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(book)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function BookManagement() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter and sort state
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterAuthor, setFilterAuthor] = useState<string>("");
    const [filterFormat, setFilterFormat] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");

    // Fetch books
    const fetchBooks = async () => {
        try {
            setIsLoading(true);
            const data = await bookService.getAllBooks();
            setBooks(data);
        } catch (error) {
            toast.error("Failed to load books");
            console.error("Error fetching books:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // Get unique categories from all books
    const uniqueCategories = useMemo(() => {
        const categories = new Set<string>();
        books.forEach((book) => {
            book.categoryNames?.forEach((cat) => categories.add(cat));
        });
        return Array.from(categories).sort((a, b) => a.localeCompare(b));
    }, [books]);

    // Get unique authors from all books
    const uniqueAuthors = useMemo(() => {
        const authors = new Set<string>();
        books.forEach((book) => {
            if (book.author) authors.add(book.author);
        });
        return Array.from(authors).sort((a, b) => a.localeCompare(b));
    }, [books]);

    // Filter and sort books
    const filteredAndSortedBooks = useMemo(() => {
        let result = [...books];

        // Apply filters
        if (filterCategory) {
            result = result.filter((book) =>
                book.categoryNames?.includes(filterCategory),
            );
        }

        if (filterAuthor) {
            result = result.filter((book) => book.author === filterAuthor);
        }

        if (filterFormat) {
            result = result.filter((book) => book.format === filterFormat);
        }

        // Apply sorting
        switch (sortBy) {
            case "newest":
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );
                break;
            case "oldest":
                result.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                );
                break;
            case "title-asc":
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "title-desc":
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "author-asc":
                result.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case "author-desc":
                result.sort((a, b) => b.author.localeCompare(a.author));
                break;
            default:
                break;
        }

        return result;
    }, [books, filterCategory, filterAuthor, filterFormat, sortBy]);

    // Clear all filters
    const clearFilters = () => {
        setFilterCategory("");
        setFilterAuthor("");
        setFilterFormat("");
        setSortBy("newest");
    };

    // Check if any filters are active
    const hasActiveFilters =
        filterCategory || filterAuthor || filterFormat || sortBy !== "newest";

    // Handle edit button click
    const handleEdit = (book: Book) => {
        setEditingBook(book);
        setIsAddModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (book: Book) => {
        if (
            !globalThis.confirm(
                `Are you sure you want to delete "${book.title}"?`,
            )
        ) {
            return;
        }

        try {
            await bookService.deleteBook(String(book.id));
            toast.success("Book deleted successfully");
            fetchBooks();
        } catch (error) {
            toast.error("Failed to delete book");
            console.error("Error deleting book:", error);
        }
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setEditingBook(null);
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    Manage Books
                </h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            showFilters || hasActiveFilters
                                ? "bg-rose-600 text-white hover:bg-rose-700"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filter & Sort
                        {hasActiveFilters && (
                            <span className="bg-white text-rose-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                                Active
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Book
                    </button>
                </div>
            </div>

            {/* Filter and Sort Panel */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-rose-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Filter & Sort Books
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700"
                            >
                                <X className="w-4 h-4" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label
                                htmlFor="filter-category"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Category
                            </label>
                            <select
                                id="filter-category"
                                value={filterCategory}
                                onChange={(e) =>
                                    setFilterCategory(e.target.value)
                                }
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {uniqueCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Author Filter */}
                        <div>
                            <label
                                htmlFor="filter-author"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Author
                            </label>
                            <select
                                id="filter-author"
                                value={filterAuthor}
                                onChange={(e) =>
                                    setFilterAuthor(e.target.value)
                                }
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none"
                            >
                                <option value="">All Authors</option>
                                {uniqueAuthors.map((author) => (
                                    <option key={author} value={author}>
                                        {author}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Format Filter */}
                        <div>
                            <label
                                htmlFor="filter-format"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Format
                            </label>
                            <select
                                id="filter-format"
                                value={filterFormat}
                                onChange={(e) =>
                                    setFilterFormat(e.target.value)
                                }
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none"
                            >
                                <option value="">All Formats</option>
                                <option value="DIGITAL">Digital</option>
                                <option value="PHYSICAL">Physical</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label
                                htmlFor="sort-by"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Sort By
                            </label>
                            <select
                                id="sort-by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title-asc">Title (A-Z)</option>
                                <option value="title-desc">Title (Z-A)</option>
                                <option value="author-asc">Author (A-Z)</option>
                                <option value="author-desc">
                                    Author (Z-A)
                                </option>
                                <option value="price-asc">
                                    Price (Low-High)
                                </option>
                                <option value="price-desc">
                                    Price (High-Low)
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing{" "}
                            <span className="font-semibold text-gray-900">
                                {filteredAndSortedBooks.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900">
                                {books.length}
                            </span>{" "}
                            {books.length === 1 ? "book" : "books"}
                        </p>
                    </div>
                </div>
            )}

            {/* Books List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                </div>
            ) : null}

            {!isLoading && filteredAndSortedBooks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">
                        {books.length === 0
                            ? "No books found. Create your first book!"
                            : "No books match the selected filters."}
                    </p>
                    {hasActiveFilters && books.length > 0 && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 text-rose-600 hover:text-rose-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {!isLoading && filteredAndSortedBooks.length > 0 && (
                <BooksGrid
                    books={filteredAndSortedBooks}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Add/Edit Book Modal */}
            <AddBookModal
                isOpen={isAddModalOpen}
                onClose={handleModalClose}
                onSuccess={fetchBooks}
                editBook={editingBook}
            />
        </div>
    );
}
