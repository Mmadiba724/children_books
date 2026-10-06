import { useCallback, useEffect, useMemo, useState } from "react";
import { CloudOff, Pencil, Plus, SearchX, Tags, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import categoryService, { type Category } from "../services/categoryService";
import CategoryModal from "./CategoryModal";
import AdminPageHeader from "./admin/AdminPageHeader";
import AdminToolbar from "./admin/AdminToolbar";
import {
  AdminCard,
  ConfirmDialog,
  InlineState,
  Pagination,
  TableSkeleton,
} from "./admin/ui";
import { adminBtn, adminInput } from "./admin/adminStyles";
import { formatLocalDate } from "../utils/dateUtils";

const PAGE_SIZE = 8;

const SORTS = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
] as const;

const time = (v?: string) => new Date(v ?? 0).getTime();

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [descFilter, setDescFilter] = useState("");
  const [page, setPage] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      setCategories(await categoryService.getAllCategories());
    } catch (error) {
      setLoadFailed(true);
      toast.error("Failed to load categories");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await categoryService.deleteCategory(pendingDelete.id);
      toast.success("Category deleted successfully");
      setPendingDelete(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
      console.error("Error deleting category:", error);
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = categories.filter((c) => {
      if (descFilter === "WITH" && !c.description) return false;
      if (descFilter === "WITHOUT" && c.description) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
      );
    });
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "newest":
          return time(b.createdAt) - time(a.createdAt);
        case "oldest":
          return time(a.createdAt) - time(b.createdAt);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [categories, search, sortBy, descFilter]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  const hasFilters = Boolean(search || descFilter);
  const clearFilters = () => {
    setSearch("");
    setDescFilter("");
    setPage(0);
  };

  const addButton = (
    <button
      type="button"
      className={adminBtn.primary}
      onClick={() => setIsModalOpen(true)}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add category
    </button>
  );

  let body;
  if (isLoading) {
    body = <TableSkeleton rows={5} cols={3} />;
  } else if (loadFailed) {
    body = (
      <InlineState
        tone="error"
        icon={<CloudOff className="h-6 w-6" />}
        title="We couldn't load the categories"
        message="Check your connection and try again."
        action={
          <button
            type="button"
            className={adminBtn.primary}
            onClick={fetchCategories}
          >
            Try again
          </button>
        }
      />
    );
  } else if (categories.length === 0) {
    body = (
      <InlineState
        icon={<Tags className="h-6 w-6" />}
        title="No categories yet"
        message="Categories group books into shelves on the storefront."
        action={addButton}
      />
    );
  } else if (visible.length === 0) {
    body = (
      <InlineState
        icon={<SearchX className="h-6 w-6" />}
        title="No categories match"
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
      <ul className="divide-y divide-line-soft">
        {pageItems.map((category) => (
          <li
            key={category.id}
            className="flex items-start gap-4 px-5 py-4 hover:bg-cream/50"
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand"
              aria-hidden="true"
            >
              <Tags className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink capitalize">
                {category.name}
              </p>
              {category.description ? (
                <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">
                  {category.description}
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-muted">No description</p>
              )}
              {category.createdAt && (
                <p className="mt-1 text-xs text-muted">
                  Created {formatLocalDate(category.createdAt)}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                className={adminBtn.icon}
                onClick={() => handleEdit(category)}
                aria-label={`Edit ${category.name}`}
                title="Edit"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${adminBtn.icon} hover:bg-error-light hover:text-error`}
                onClick={() => setPendingDelete(category)}
                aria-label={`Delete ${category.name}`}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description={
          categories.length > 0
            ? `${categories.length} ${categories.length === 1 ? "category" : "categories"}`
            : "Organise books into shelves."
        }
        actions={categories.length > 0 ? addButton : undefined}
      />

      <AdminCard>
        {!isLoading && !loadFailed && categories.length > 0 && (
          <AdminToolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(0);
            }}
            placeholder="Search categories"
            label="Search categories"
            hasFilters={hasFilters}
            onClear={clearFilters}
          >
            <select
              value={descFilter}
              onChange={(e) => {
                setDescFilter(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by description"
              className={`${adminInput} lg:w-48`}
            >
              <option value="">Any description</option>
              <option value="WITH">Has description</option>
              <option value="WITHOUT">No description</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort categories"
              className={`${adminInput} lg:w-44`}
            >
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </AdminToolbar>
        )}
        {body}
        {!isLoading && !loadFailed && visible.length > 0 && (
          <Pagination
            page={safePage}
            pageCount={pageCount}
            total={visible.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}
      </AdminCard>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchCategories}
        editCategory={editingCategory}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        tone="danger"
        title="Delete this category?"
        message={
          <>
            <span className="font-semibold">{pendingDelete?.name}</span> will
            be removed. This can't be undone.
          </>
        }
        confirmLabel="Delete category"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
