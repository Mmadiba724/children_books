import { useState, useEffect } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import categoryService, { type Category } from "../services/categoryService";
import CategoryModal from "./CategoryModal";
import { getCategoryColor } from "../utils/categoryColors";
import { formatLocalDate } from "../utils/dateUtils";

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle edit button click
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Handle delete
  const handleDelete = async (category: Category) => {
    if (
      !globalThis.confirm(`Are you sure you want to delete "${category.name}"?`)
    ) {
      return;
    }

    try {
      await categoryService.deleteCategory(category.id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            No categories found. Create your first category!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-100 hover:border-rose-200 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category.name}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${getCategoryColor(category.name)}`}
                    >
                      {category.name}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit category"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {category.description}
                </p>
              )}

              {category.createdAt && (
                <p className="text-xs text-gray-400">
                  Created: {formatLocalDate(category.createdAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchCategories}
        editCategory={editingCategory}
      />
    </div>
  );
}
