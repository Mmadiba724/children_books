import { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import bookService, {
    CreateBookPayload,
    UpdateBookPayload,
} from "../services/bookService";
import categoryService from "../services/categoryService";
import fileService from "../services/fileService";
import authService from "../services/authService";
import tokenStorage from "../utils/tokenStorage";
import type { Book } from "../types/book";
import { getImageUrl } from "../utils/imageUtils";

interface Category {
    id: string;
    name: string;
}

interface AddBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editBook?: Book | null;
}

interface BookFormData {
    title: string;
    author: string;
    description: string;
    price: string;
    format: "DIGITAL" | "PHYSICAL";
    stockQuantity: string;
    categoryIds: number[];
}

const AddBookModal = ({
    isOpen,
    onClose,
    onSuccess,
    editBook,
}: AddBookModalProps) => {
    const [formData, setFormData] = useState<BookFormData>({
        title: "",
        author: "",
        description: "",
        price: "",
        format: "DIGITAL",
        stockQuantity: "0",
        categoryIds: [],
    });

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string>("");
    const [existingFileId, setExistingFileId] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Load categories and populate form when editing
    useEffect(() => {
        if (isOpen) {
            loadCategories();

            // Populate form if editing
            if (editBook) {
                setFormData({
                    title: editBook.title,
                    author: editBook.author,
                    description: editBook.description || "",
                    price: String(editBook.price),
                    format:
                        editBook.format === "PHYSICAL" ? "PHYSICAL" : "DIGITAL",
                    stockQuantity: String(editBook.stockQuantity || 0),
                    categoryIds: [], // Will be populated after categories load
                });
                if (editBook.coverImageUrl) {
                    setCoverImagePreview(getImageUrl(editBook.coverImageUrl));
                }
                if (editBook.fileId) {
                    setExistingFileId(editBook.fileId);
                }
            } else {
                // Reset form for adding new book
                resetForm();
            }

            // Clear any previous errors and check authentication status
            const isAuth = authService.isAuthenticated();
            const token = authService.getAuthToken();
            console.log("AddBookModal opened - Auth check:", {
                isAuthenticated: isAuth,
                hasToken: !!token,
                tokenLength: token?.length,
            });

            if (isAuth) {
                setErrors({});
            } else {
                toast.error(
                    "You must be logged in to add a book. Please sign in first.",
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editBook]);

    const loadCategories = async () => {
        try {
            const fetchedCategories = await categoryService.getAllCategories();
            setCategories(fetchedCategories);

            // Populate category IDs when editing
            if (editBook?.categoryNames && editBook.categoryNames.length > 0) {
                const categoryIds = fetchedCategories
                    .filter((cat) => editBook.categoryNames?.includes(cat.name))
                    .map((cat) => Number.parseInt(cat.id));
                console.log("Loaded categories for editing book:", {
                    categoryNames: editBook.categoryNames,
                    fetchedCategoryIds: categoryIds,
                    fetchedCategories: fetchedCategories,
                });
                setFormData((prev) => ({ ...prev, categoryIds }));
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
            toast.error("Failed to load categories");
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleCategoryChange = (categoryId: number) => {
        setFormData((prev) => {
            const categoryIds = prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter((id) => id !== categoryId)
                : [...prev.categoryIds, categoryId];
            console.log("Category changed:", { categoryId, newCategoryIds: categoryIds });
            return { ...prev, categoryIds };
        });
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select a valid image file");
                return;
            }
            setCoverImage(file);
            setCoverImagePreview(URL.createObjectURL(file));
            setErrors({ ...errors, coverImage: "" });
        }
    };

    const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ["application/pdf", "application/epub+zip"];
            if (
                !validTypes.includes(file.type) &&
                !file.name.endsWith(".epub")
            ) {
                toast.error("Please select a valid PDF or EPUB file");
                return;
            }
            setBookFile(file);
            setErrors({ ...errors, bookFile: "" });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (!formData.author.trim()) {
            newErrors.author = "Author is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (!formData.price || Number.parseFloat(formData.price) <= 0) {
            newErrors.price = "Please enter a valid price";
        }

        if (formData.categoryIds.length === 0) {
            newErrors.categories = "Please select at least one category";
        }

        if (!coverImage && !editBook?.coverImageUrl) {
            newErrors.coverImage = "Cover image is required";
        }

        if (formData.format === "DIGITAL" && !bookFile && !editBook?.fileId) {
            newErrors.bookFile = "Book file is required for digital format";
        }

        if (formData.format === "PHYSICAL") {
            const stock = Number.parseInt(formData.stockQuantity);
            if (Number.isNaN(stock) || stock < 0) {
                newErrors.stockQuantity = "Please enter a valid stock quantity";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            toast.error(
                "You must be logged in to add a book. Please sign in first.",
            );
            return;
        }

        setIsLoading(true);
        setIsUploadingFiles(true);

        try {
            let coverImageId: string | undefined;
            let fileId: string | undefined;

            // Upload cover image if provided
            if (coverImage) {
                const imagePath = await fileService.uploadImage(coverImage);
                console.log("Image upload response (path):", imagePath);
                coverImageId = imagePath;
                console.log("Using coverImageUrl:", coverImageId);
            }

            // Upload book file if digital and provided
            if (formData.format === "DIGITAL" && bookFile) {
                const filePath = await fileService.uploadBookFile(bookFile);
                console.log("File upload response (path):", filePath);
                fileId = filePath;
                console.log("Using fileId:", fileId);
            }

            setIsUploadingFiles(false);

            if (editBook) {
                // Update existing book
                console.log("=== EDIT BOOK DEBUG START ===");
                console.log("Editing book ID:", editBook.id);
                console.log("Initial editBook.categoryNames:", editBook.categoryNames);
                console.log("formData.categoryIds selected by user:", formData.categoryIds);
                console.log("Available categories:", categories);

                const updatePayload: UpdateBookPayload = {
                    title: formData.title,
                    author: formData.author,
                    description: formData.description,
                    price: Number.parseFloat(formData.price),
                    format: formData.format,
                    stockQuantity:
                        formData.format === "PHYSICAL"
                            ? Number.parseInt(formData.stockQuantity)
                            : 0,
                };

                // Always include categoryIds - send all selected categories
                if (formData.categoryIds.length > 0) {
                    updatePayload.categoryIds = formData.categoryIds;
                    console.log("Sending categoryIds:", formData.categoryIds);
                } else {
                    console.warn("No categories selected in form");
                }

                // Always preserve coverImageUrl
                if (coverImageId) {
                    updatePayload.coverImageUrl = coverImageId;
                } else if (editBook.coverImageUrl) {
                    updatePayload.coverImageUrl = editBook.coverImageUrl;
                }

                // Handle fileId based on format
                if (formData.format === "DIGITAL") {
                    // For DIGITAL books: preserve or update fileId
                    if (fileId) {
                        updatePayload.fileId = fileId;
                    } else if (editBook.fileId) {
                        updatePayload.fileId = editBook.fileId;
                    }
                } else {
                    // For PHYSICAL books: always set fileId to null
                    updatePayload.fileId = null;
                }

                console.log("=== FINAL UPDATE PAYLOAD ===");
                console.log(JSON.stringify(updatePayload, null, 2));
                console.log("=== END DEBUG ===");

                await bookService.updateBook(
                    String(editBook.id),
                    updatePayload,
                );
                toast.success("Book updated successfully!");
            } else {
                // Create new book
                const bookPayload: CreateBookPayload = {
                    title: formData.title,
                    author: formData.author,
                    description: formData.description,
                    price: Number.parseFloat(formData.price),
                    format: formData.format,
                    coverImageUrl: coverImageId,
                    fileId: formData.format === "DIGITAL" ? fileId : null,
                    stockQuantity:
                        formData.format === "PHYSICAL"
                            ? Number.parseInt(formData.stockQuantity)
                            : 0,
                    categoryIds: formData.categoryIds,
                };

                // Debug: Log auth status and payload
                const token = authService.getAuthToken();
                console.log(
                    "Creating book with auth token:",
                    token ? "Present" : "Missing",
                );
                console.log(
                    "Book payload being sent:",
                    JSON.stringify(bookPayload, null, 2),
                );

                await bookService.createBook(bookPayload);
                toast.success("Book created successfully!");
            }

            // Reset form and close modal
            resetForm();
            onClose();

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: unknown) {
            console.error(
                editBook ? "Error updating book:" : "Error creating book:",
                error,
            );
            let errorMessage = editBook
                ? "Failed to update book. Please try again."
                : "Failed to create book. Please try again.";

            // Check for authentication errors
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: {
                        status?: number;
                        data?: Record<string, unknown> | string;
                    };
                };

                console.error("Full error response:", axiosError.response);

                if (axiosError.response?.status === 400) {
                    // Bad Request - show detailed error
                    const errorData = axiosError.response.data;
                    console.error("400 Bad Request details:", errorData);

                    if (typeof errorData === "string") {
                        errorMessage = errorData;
                    } else if (errorData && typeof errorData === "object") {
                        if (
                            "message" in errorData &&
                            typeof errorData.message === "string"
                        ) {
                            errorMessage = errorData.message;
                        } else if (
                            "error" in errorData &&
                            typeof errorData.error === "string"
                        ) {
                            errorMessage = errorData.error;
                        } else if ("errors" in errorData) {
                            // Handle validation errors array
                            const errors = errorData.errors;
                            errorMessage = Array.isArray(errors)
                                ? errors.join(", ")
                                : JSON.stringify(errors);
                        } else {
                            errorMessage = `Bad Request (400): ${JSON.stringify(errorData)}`;
                        }
                    } else {
                        errorMessage =
                            "Bad Request (400): Invalid request data";
                    }
                } else if (axiosError.response?.status === 401) {
                    errorMessage =
                        "Authentication failed. Please log in again and try.";
                    // Clear auth token if it's invalid
                    tokenStorage.clearAll();
                } else if (axiosError.response?.data) {
                    const errorData = axiosError.response.data;
                    if (typeof errorData === "string") {
                        errorMessage = errorData;
                    } else if (
                        typeof errorData === "object" &&
                        "message" in errorData
                    ) {
                        errorMessage = String(errorData.message);
                    } else {
                        errorMessage = `Error ${axiosError.response.status}: ${JSON.stringify(errorData)}`;
                    }
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            setIsUploadingFiles(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            author: "",
            description: "",
            price: "",
            format: "DIGITAL",
            stockQuantity: "0",
            categoryIds: [],
        });
        setCoverImage(null);
        setBookFile(null);
        setCoverImagePreview("");
        setExistingFileId(null);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 my-8 relative">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                    aria-label="Close modal"
                    disabled={isLoading}
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        {editBook ? "Edit Book" : "Add New Book"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Upload Status */}
                        {isUploadingFiles && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Uploading files...</span>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border-2 rounded focus:outline-none focus:border-green-700 ${
                                    errors.title
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter book title"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Author */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Author <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border-2 rounded focus:outline-none focus:border-green-700 ${
                                    errors.author
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter author name"
                            />
                            {errors.author && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.author}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-4 py-2 border-2 rounded focus:outline-none focus:border-green-700 ${
                                    errors.description
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter book description"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Price and Format Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-4 py-2 border-2 rounded focus:outline-none focus:border-green-700 ${
                                        errors.price
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            {/* Format */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Format{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="format"
                                    value={formData.format}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-green-700"
                                >
                                    <option value="DIGITAL">Digital</option>
                                    <option value="PHYSICAL">Physical</option>
                                </select>
                            </div>
                        </div>

                        {/* Stock Quantity (only for physical books) */}
                        {formData.format === "PHYSICAL" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock Quantity{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    value={formData.stockQuantity}
                                    onChange={handleInputChange}
                                    min="0"
                                    className={`w-full px-4 py-2 border-2 rounded focus:outline-none focus:border-green-700 ${
                                        errors.stockQuantity
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="0"
                                />
                                {errors.stockQuantity && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.stockQuantity}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Categories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categories{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-gray-300 rounded p-3 max-h-32 overflow-y-auto">
                                {categories.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Loading categories...
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <label
                                                key={category.id}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categoryIds.includes(
                                                        Number.parseInt(
                                                            category.id,
                                                        ),
                                                    )}
                                                    onChange={() =>
                                                        handleCategoryChange(
                                                            Number.parseInt(
                                                                category.id,
                                                            ),
                                                        )
                                                    }
                                                    className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-green-700"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {category.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {errors.categories && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.categories}
                                </p>
                            )}
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cover Image{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-green-700 transition">
                                    <Upload size={20} className="mr-2" />
                                    <span className="text-sm">
                                        {coverImage
                                            ? coverImage.name
                                            : "Choose image file"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        className="hidden"
                                    />
                                </label>
                                {coverImagePreview && (
                                    <img
                                        src={coverImagePreview}
                                        alt="Cover preview"
                                        className="w-16 h-20 object-cover rounded border"
                                    />
                                )}
                            </div>
                            {errors.coverImage && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.coverImage}
                                </p>
                            )}
                        </div>

                        {/* Book File Upload (only for digital books) */}
                        {formData.format === "DIGITAL" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Book File (PDF/EPUB){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-green-700 transition">
                                        <Upload size={20} className="mr-2" />
                                        <span className="text-sm">
                                            {bookFile
                                                ? bookFile.name
                                                : "Choose book file"}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".pdf,.epub,application/pdf,application/epub+zip"
                                            onChange={handleBookFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {existingFileId && !bookFile && (
                                        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded border border-gray-200">
                                            <p className="font-medium">Existing file:</p>
                                            <p className="text-gray-500 truncate max-w-xs">{existingFileId}</p>
                                        </div>
                                    )}
                                </div>
                                {errors.bookFile && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.bookFile}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading && (
                                    <Loader2
                                        className="animate-spin"
                                        size={20}
                                    />
                                )}
                                {isLoading ? "Creating Book..." : "Create Book"}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBookModal;
