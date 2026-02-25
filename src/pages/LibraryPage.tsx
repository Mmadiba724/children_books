import { useState, useEffect } from "react";
import { Book, Loader2, Download, Eye, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import libraryService, { type LibraryBook } from "../services/libraryService";
import { getImageUrl } from "../utils/imageUtils";

const LibraryPage = () => {
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingBookId, setLoadingBookId] = useState<string | null>(null);

    useEffect(() => {
        loadLibrary();
    }, []);

    const loadLibrary = async () => {
        try {
            setIsLoading(true);
            const books = await libraryService.getMyLibrary();
            setBooks(books);
        } catch (error) {
            console.error("Failed to load library:", error);
            toast.error("Failed to load your library");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadBook = async (bookId: number, title: string) => {
        try {
            setLoadingBookId(String(bookId));
            const { url } = await libraryService.getBookReadUrl(String(bookId));
            if (url) {
                window.open(url, "_blank");
            } else {
                toast.error("Book reading URL not available");
            }
        } catch (error) {
            console.error("Failed to get read URL:", error);
            toast.error(`Failed to open ${title}`);
        } finally {
            setLoadingBookId(null);
        }
    };

    const handleDownloadBook = async (bookId: number, title: string) => {
        try {
            setLoadingBookId(String(bookId));
            const { url } = await libraryService.getBookDownloadUrl(
                String(bookId),
            );
            if (url) {
                window.open(url, "_blank");
                toast.success(`Downloading ${title}`);
            } else {
                toast.error("Download URL not available");
            }
        } catch (error) {
            console.error("Failed to download book:", error);
            toast.error(`Failed to download ${title}`);
        } finally {
            setLoadingBookId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                        <p className="ml-3 text-gray-600">
                            Loading your library...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8 flex flex-col items-center justify-center gap-2 w-full">
                    <div className="flex items-center gap-3 mb-2">
                        <Book className="w-8 h-8 text-rose-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Library
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Access all your purchased books and digital content
                    </p>
                </div>

                {/* Empty State */}
                {books.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Book className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Your library is empty
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Start building your collection by purchasing books
                            from our catalog
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Browse Books
                        </a>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-96">
                            <div className="bg-white rounded-lg shadow-sm p-4 h-20 border border-gray-200">
                                <p className="text-sm text-gray-600 mb-1">
                                    Total Books
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {books.length}
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200 h-20">
                                <p className="text-sm text-gray-600 mb-1">
                                    Recently Added
                                </p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {
                                        books.filter(
                                            (b) =>
                                                new Date(b.purchasedAt) >
                                                new Date(
                                                    Date.now() -
                                                        30 *
                                                            24 *
                                                            60 *
                                                            60 *
                                                            1000,
                                                ),
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Books Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map((book) => (
                                <div
                                    key={book.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
                                >
                                    {/* Book Cover */}
                                    <div className="relative aspect-3/4 bg-gray-100">
                                        <img
                                            src={
                                                getImageUrl(book.coverImageUrl) ||
                                                "https://via.placeholder.com/300x400?text=No+Cover"
                                            }
                                            alt={book.bookTitle}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "https://via.placeholder.com/300x400?text=No+Cover";
                                            }}
                                        />
                                    </div>

                                    {/* Book Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                                            {book.bookTitle}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {book.bookAuthor}
                                        </p>

                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                Purchased:{" "}
                                                {new Date(
                                                    book.purchasedAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <button
                                                onClick={() =>
                                                    handleReadBook(
                                                        book.bookId,
                                                        book.bookTitle,
                                                    )
                                                }
                                                disabled={
                                                    loadingBookId ===
                                                    String(book.bookId)
                                                }
                                                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                {loadingBookId ===
                                                String(book.bookId) ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Loading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4" />
                                                        <span>Read Now</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDownloadBook(
                                                        book.bookId,
                                                        book.bookTitle,
                                                    )
                                                }
                                                disabled={
                                                    loadingBookId ===
                                                    String(book.bookId)
                                                }
                                                className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LibraryPage;
