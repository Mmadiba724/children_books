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
import { adminBtn, adminInput } from "./admin/adminStyles";

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
  isbn: string;
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
    isbn: "",
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
          isbn: editBook.isbn,
          description: editBook.description || "",
          price: String(editBook.price),
          format: editBook.format === "PHYSICAL" ? "PHYSICAL" : "DIGITAL",
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
      console.log("Category changed:", {
        categoryId,
        newCategoryIds: categoryIds,
      });
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
      if (!validTypes.includes(file.type) && !file.name.endsWith(".epub")) {
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

    if (!formData.isbn.trim()) {
      newErrors.isbn = "ISBN is required";
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
      toast.error("You must be logged in to add a book. Please sign in first.");
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
        console.log(
          "formData.categoryIds selected by user:",
          formData.categoryIds,
        );
        console.log("Available categories:", categories);

        const updatePayload: UpdateBookPayload = {
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
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

        await bookService.updateBook(String(editBook.id), updatePayload);
        toast.success("Book updated successfully!");
      } else {
        // Create new book
        const bookPayload: CreateBookPayload = {
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
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
            errorMessage = "Bad Request (400): Invalid request data";
          }
        } else if (axiosError.response?.status === 401) {
          errorMessage = "Authentication failed. Please log in again and try.";
          // Clear auth token if it's invalid
          tokenStorage.clearAll();
        } else if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (typeof errorData === "object" && "message" in errorData) {
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
      isbn: "",
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

  const inputCls = (hasError?: string) =>
    `${adminInput} ${hasError ? "border-error focus:border-error" : ""}`;

  const fieldError = (id: string, message?: string) =>
    message ? (
      <p id={id} role="alert" className="mt-1 text-xs font-medium text-error">
        {message}
      </p>
    ) : null;

  const section = (title: string, hint: string) => (
    <div className="mb-4">
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      <p className="text-xs text-muted">{hint}</p>
    </div>
  );

  const label = "mb-1 block text-sm font-semibold text-ink";
  const required = (
    <span className="text-error" aria-hidden="true">
      {" "}
      *
    </span>
  );
  const dropzone =
    "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong px-4 py-6 text-sm font-semibold text-ink-soft transition-colors hover:border-brand hover:bg-cream focus-within:border-brand";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2
              id="book-modal-title"
              className="font-display text-xl font-bold text-ink"
            >
              {editBook ? "Edit book" : "Add a new book"}
            </h2>
            <p className="text-sm text-ink-soft">
              Fields marked <span className="text-error">*</span> are required.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={adminBtn.icon}
            aria-label="Close"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {isUploadingFiles && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg bg-info/10 px-4 py-3 text-sm font-semibold text-info"
            >
              <Loader2 className="animate-spin" size={18} />
              Uploading files...
            </div>
          )}

          {/* Details */}
          <section aria-label="Book details">
            {section("Details", "What readers and search will see.")}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="book-title" className={label}>
                  Title{required}
                </label>
                <input
                  id="book-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "book-title-err" : undefined}
                  className={inputCls(errors.title)}
                  placeholder="e.g. The Sleepy Little Fox"
                />
                {fieldError("book-title-err", errors.title)}
              </div>
              <div>
                <label htmlFor="book-author" className={label}>
                  Author{required}
                </label>
                <input
                  id="book-author"
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors.author)}
                  aria-describedby={
                    errors.author ? "book-author-err" : undefined
                  }
                  className={inputCls(errors.author)}
                  placeholder="Author name"
                />
                {fieldError("book-author-err", errors.author)}
              </div>
              <div>
                <label htmlFor="book-isbn" className={label}>
                  ISBN{required}
                </label>
                <input
                  id="book-isbn"
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors.isbn)}
                  aria-describedby={errors.isbn ? "book-isbn-err" : undefined}
                  className={inputCls(errors.isbn)}
                  placeholder="978-..."
                />
                {fieldError("book-isbn-err", errors.isbn)}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="book-description" className={label}>
                  Description{required}
                </label>
                <textarea
                  id="book-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={
                    errors.description ? "book-description-err" : undefined
                  }
                  className={inputCls(errors.description)}
                  placeholder="A short summary shown on the book page"
                />
                {fieldError("book-description-err", errors.description)}
              </div>
            </div>
          </section>

          {/* Pricing & availability */}
          <section aria-label="Pricing and availability">
            {section(
              "Pricing & availability",
              "How the book is sold and how many copies you hold.",
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="book-price" className={label}>
                  Price{required}
                </label>
                <input
                  id="book-price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby={errors.price ? "book-price-err" : undefined}
                  className={inputCls(errors.price)}
                  placeholder="0.00"
                />
                {fieldError("book-price-err", errors.price)}
              </div>
              <div>
                <label htmlFor="book-format" className={label}>
                  Format{required}
                </label>
                <select
                  id="book-format"
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  className={adminInput}
                >
                  <option value="DIGITAL">Digital</option>
                  <option value="PHYSICAL">Physical</option>
                </select>
              </div>
              {formData.format === "PHYSICAL" && (
                <div>
                  <label htmlFor="book-stock" className={label}>
                    Stock quantity{required}
                  </label>
                  <input
                    id="book-stock"
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    aria-invalid={Boolean(errors.stockQuantity)}
                    aria-describedby={
                      errors.stockQuantity ? "book-stock-err" : undefined
                    }
                    className={inputCls(errors.stockQuantity)}
                    placeholder="0"
                  />
                  {fieldError("book-stock-err", errors.stockQuantity)}
                </div>
              )}
            </div>
          </section>

          {/* Categories */}
          <section aria-label="Categories">
            {section("Categories", "Pick every shelf this book belongs on.")}
            <fieldset
              className={`rounded-lg border p-3 ${errors.categories ? "border-error" : "border-line-strong"}`}
            >
              <legend className="sr-only">Categories (required)</legend>
              {categories.length === 0 ? (
                <p className="text-sm text-muted">Loading categories...</p>
              ) : (
                <div className="grid max-h-40 gap-1 overflow-y-auto sm:grid-cols-2">
                  {categories.map((category) => {
                    const id = Number.parseInt(category.id);
                    return (
                      <label
                        key={category.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-cream"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categoryIds.includes(id)}
                          onChange={() => handleCategoryChange(id)}
                          className="h-4 w-4 cursor-pointer rounded border-line-strong accent-brand"
                        />
                        <span className="text-sm text-ink-soft">
                          {category.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
            {fieldError("book-cat-err", errors.categories)}
          </section>

          {/* Files */}
          <section aria-label="Files and cover">
            {section(
              "Cover & files",
              formData.format === "DIGITAL"
                ? "Upload cover art and the readable file (PDF or EPUB)."
                : "Upload the cover art shown in the catalogue.",
            )}
            <div className="space-y-5">
              <div>
                <p className={label}>Cover image{required}</p>
                <div className="flex items-stretch gap-4">
                  <label className={dropzone}>
                    <Upload size={18} aria-hidden="true" />
                    <span className="truncate">
                      {coverImage ? coverImage.name : "Choose an image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="sr-only"
                    />
                  </label>
                  {coverImagePreview && (
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="h-24 w-[4.5rem] shrink-0 rounded-md border border-line object-cover"
                    />
                  )}
                </div>
                {fieldError("book-cover-err", errors.coverImage)}
              </div>

              {formData.format === "DIGITAL" && (
                <div>
                  <p className={label}>Book file (PDF / EPUB){required}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                    <label className={dropzone}>
                      <Upload size={18} aria-hidden="true" />
                      <span className="truncate">
                        {bookFile ? bookFile.name : "Choose a file"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.epub,application/pdf,application/epub+zip"
                        onChange={handleBookFileChange}
                        className="sr-only"
                      />
                    </label>
                    {existingFileId && !bookFile && (
                      <div className="min-w-0 rounded-lg border border-line bg-cream px-4 py-3 text-sm sm:max-w-xs">
                        <p className="font-semibold text-ink-soft">
                          Existing file
                        </p>
                        <p className="truncate text-muted">{existingFileId}</p>
                      </div>
                    )}
                  </div>
                  {fieldError("book-file-err", errors.bookFile)}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="flex justify-end gap-2 border-t border-line bg-white px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={adminBtn.secondary}
          >
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className={adminBtn.primary}>
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {(() => {
              if (isLoading) return editBook ? "Saving..." : "Creating...";
              return editBook ? "Save changes" : "Create book";
            })()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookModal;
