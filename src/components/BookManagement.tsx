import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CloudOff,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import bookService from "../services/bookService";
import type { Book } from "../types/book";
import AddBookModal from "./AddBookModal";
import AdminPageHeader from "./admin/AdminPageHeader";
import BookThumb from "./admin/BookThumb";
import {
  AdminCard,
  ConfirmDialog,
  InlineState,
  Pagination,
  StatusBadge,
  TableSkeleton,
} from "./admin/ui";
import { adminBtn, adminInput } from "./admin/adminStyles";
import { formatLocalDate } from "../utils/dateUtils";

const PAGE_SIZE = 8;

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "author-asc", label: "Author (A-Z)" },
  { value: "author-desc", label: "Author (Z-A)" },
  { value: "price-asc", label: "Price (low-high)" },
  { value: "price-desc", label: "Price (high-low)" },
] as const;

const FORMAT_TABS = [
  { value: "", label: "All" },
  { value: "PHYSICAL", label: "Print" },
  { value: "DIGITAL", label: "Digital" },
] as const;

function time(value: string | undefined) {
  return new Date(value ?? 0).getTime();
}

function sortBooks(list: Book[], sortBy: string) {
  const out = [...list];
  switch (sortBy) {
    case "oldest":
      return out.sort((a, b) => time(a.createdAt) - time(b.createdAt));
    case "title-asc":
      return out.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return out.sort((a, b) => b.title.localeCompare(a.title));
    case "author-asc":
      return out.sort((a, b) => a.author.localeCompare(b.author));
    case "author-desc":
      return out.sort((a, b) => b.author.localeCompare(a.author));
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    default:
      return out.sort((a, b) => time(b.createdAt) - time(a.createdAt));
  }
}

function StockBadge({ book }: { readonly book: Book }) {
  if (book.format === "DIGITAL") return <StatusBadge tone="info">Digital</StatusBadge>;
  if (book.stockQuantity <= 0) return <StatusBadge tone="error">Out of stock</StatusBadge>;
  if (book.stockQuantity <= 5)
    return <StatusBadge tone="warning">{book.stockQuantity} left</StatusBadge>;
  return <StatusBadge tone="success">{book.stockQuantity} in stock</StatusBadge>;
}

function CategoryChips({ names }: { readonly names?: string[] }) {
  if (!names || names.length === 0)
    return <span className="text-xs text-muted">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {names.slice(0, 2).map((n) => (
        <span
          key={n}
          className="rounded-md bg-cream-deep px-2 py-0.5 text-xs font-medium text-ink-soft"
        >
          {n}
        </span>
      ))}
      {names.length > 2 && (
        <span className="px-1 text-xs text-muted">+{names.length - 2}</span>
      )}
    </div>
  );
}

function RowActions({
  book,
  onEdit,
  onDelete,
}: {
  readonly book: Book;
  readonly onEdit: (b: Book) => void;
  readonly onDelete: (b: Book) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        className={adminBtn.icon}
        onClick={() => onEdit(book)}
        aria-label={`Edit ${book.title}`}
        title="Edit"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${adminBtn.icon} hover:bg-error-light hover:text-error`}
        onClick={() => onDelete(book)}
        aria-label={`Delete ${book.title}`}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFormat, setFilterFormat] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(0);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      setBooks(await bookService.getAllBooks());
    } catch (error) {
      setLoadFailed(true);
      toast.error("Failed to load books");
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const formatCount = (f: string) =>
    f ? books.filter((b) => b.format === f).length : books.length;

  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.categoryNames?.forEach((c) => set.add(c)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = books.filter((b) => {
      if (filterFormat && b.format !== filterFormat) return false;
      if (filterCategory && !b.categoryNames?.includes(filterCategory))
        return false;
      if (
        q &&
        !b.title.toLowerCase().includes(q) &&
        !b.author.toLowerCase().includes(q) &&
        !b.isbn?.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    return sortBooks(filtered, sortBy);
  }, [books, search, filterCategory, filterFormat, sortBy]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  const hasFilters = Boolean(search || filterCategory || filterFormat);
  const clearFilters = () => {
    setSearch("");
    setFilterCategory("");
    setFilterFormat("");
    setPage(0);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingBook(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await bookService.deleteBook(String(pendingDelete.id));
      toast.success("Book deleted successfully");
      setPendingDelete(null);
      fetchBooks();
    } catch (error) {
      toast.error("Failed to delete book");
      console.error("Error deleting book:", error);
    }
  };

  let body;
  if (isLoading) {
    body = <TableSkeleton rows={6} cols={4} />;
  } else if (loadFailed) {
    body = (
      <InlineState
        tone="error"
        icon={<CloudOff className="h-6 w-6" />}
        title="We couldn't load the books"
        message="Check your connection and try again."
        action={
          <button type="button" className={adminBtn.primary} onClick={fetchBooks}>
            Try again
          </button>
        }
      />
    );
  } else if (books.length === 0) {
    body = (
      <InlineState
        icon={<BookOpen className="h-6 w-6" />}
        title="No books yet"
        message="Add your first book to start building the catalogue."
        action={
          <button
            type="button"
            className={adminBtn.primary}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add book
          </button>
        }
      />
    );
  } else if (visible.length === 0) {
    body = (
      <InlineState
        icon={<SearchX className="h-6 w-6" />}
        title="No books match"
        message="Try a different search or clear the filters."
        action={
          <button type="button" className={adminBtn.secondary} onClick={clearFilters}>
            Clear filters
          </button>
        }
      />
    );
  } else {
    body = (
      <>
        {/* Table on md+ */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs font-semibold tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-3">Book</th>
                <th scope="col" className="px-3 py-3">Categories</th>
                <th scope="col" className="px-3 py-3">Price</th>
                <th scope="col" className="px-3 py-3">Availability</th>
                <th scope="col" className="px-3 py-3">Added</th>
                <th scope="col" className="px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {pageItems.map((book) => (
                <tr key={book.id} className="hover:bg-cream/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <BookThumb
                        title={book.title}
                        coverImageUrl={book.coverImageUrl}
                      />
                      <div className="min-w-0">
                        <p className="max-w-xs truncate font-semibold text-ink">
                          {book.title}
                        </p>
                        <p className="max-w-xs truncate text-xs text-muted">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <CategoryChips names={book.categoryNames} />
                  </td>
                  <td className="px-3 py-3 font-semibold whitespace-nowrap text-ink">
                    UGX {Number(book.price).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <StockBadge book={book} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted">
                    {formatLocalDate(book.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <RowActions
                      book={book}
                      onEdit={handleEdit}
                      onDelete={setPendingDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards below md */}
        <ul className="divide-y divide-line-soft md:hidden">
          {pageItems.map((book) => (
            <li key={book.id} className="flex gap-3 p-4">
              <BookThumb
                title={book.title}
                coverImageUrl={book.coverImageUrl}
                className="h-20 w-14"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{book.title}</p>
                <p className="truncate text-xs text-muted">{book.author}</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  UGX {Number(book.price).toLocaleString()}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StockBadge book={book} />
                  <CategoryChips names={book.categoryNames} />
                </div>
              </div>
              <RowActions
                book={book}
                onEdit={handleEdit}
                onDelete={setPendingDelete}
              />
            </li>
          ))}
        </ul>

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={visible.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Books"
        description={
          books.length > 0
            ? `${books.length} ${books.length === 1 ? "title" : "titles"} in the catalogue`
            : "Manage the catalogue, stock and cover art."
        }
        actions={
          <button
            type="button"
            className={adminBtn.primary}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add book
          </button>
        }
      />

      <AdminCard>
        {/* Toolbar */}
        <div className="space-y-3 border-b border-line p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search title, author or ISBN"
                aria-label="Search books"
                className={`${adminInput} pl-9`}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by category"
              className={`${adminInput} lg:w-48`}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort books"
              className={`${adminInput} lg:w-48`}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              role="group"
              aria-label="Format"
              className="inline-flex rounded-lg bg-cream-deep p-1"
            >
              {FORMAT_TABS.map((tab) => {
                const on = filterFormat === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setFilterFormat(tab.value);
                      setPage(0);
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                      on
                        ? "bg-white text-ink shadow-sm"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {tab.label}{" "}
                    <span className="text-xs text-muted">
                      {formatCount(tab.value)}
                    </span>
                  </button>
                );
              })}
            </div>
            {hasFilters && (
              <button type="button" className={adminBtn.ghost} onClick={clearFilters}>
                <X className="h-4 w-4" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {body}
      </AdminCard>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchBooks}
        editBook={editingBook}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        tone="danger"
        title="Delete this book?"
        message={
          <>
            <span className="font-semibold">{pendingDelete?.title}</span> will
            be removed from the catalogue. This can't be undone.
          </>
        }
        confirmLabel="Delete book"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
