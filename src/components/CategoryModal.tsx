import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import categoryService, { type Category } from "../services/categoryService";
import authService from "../services/authService";
import tokenStorage from "../utils/tokenStorage";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editCategory?: Category | null;
}

interface CategoryFormData {
    name: string;
    description: string;
}

const CategoryModal = ({
    isOpen,
    onClose,
    onSuccess,
    editCategory,
}: CategoryModalProps) => {
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Populate form when editing
    useEffect(() => {
        if (isOpen) {
            // Populate form if editing
            if (editCategory) {
                setFormData({
                    name: editCategory.name,
                    description: editCategory.description || "",
                });
            } else {
                // Reset form for adding new category
                resetForm();
            }

            // Clear any previous errors and check authentication status
            const isAuth = authService.isAuthenticated();
            const token = authService.getAuthToken();
            console.log("CategoryModal opened - Auth check:", {
                isAuthenticated: isAuth,
                hasToken: !!token,
                tokenLength: token?.length,
            });

            if (isAuth) {
                setErrors({});
            } else {
                toast.error(
                    "You must be logged in to manage categories. Please sign in first.",
                );
            }
        }
    }, [isOpen, editCategory]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = "Category name is required";
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
                "You must be logged in to manage categories. Please sign in first.",
            );
            return;
        }

        setIsLoading(true);

        try {
            if (editCategory) {
                // Update existing category
                const updatePayload = {
                    name: formData.name,
                    description: formData.description || undefined,
                };

                await categoryService.updateCategory(
                    editCategory.id,
                    updatePayload,
                );
                toast.success("Category updated successfully!");
            } else {
                // Create new category
                const createPayload = {
                    name: formData.name,
                    description: formData.description || undefined,
                };

                await categoryService.createCategory(createPayload);
                toast.success("Category created successfully!");
            }

            // Reset form and close modal
            resetForm();
            onClose();

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: unknown) {
            console.error(
                editCategory
                    ? "Error updating category:"
                    : "Error creating category:",
                error,
            );
            let errorMessage = editCategory
                ? "Failed to update category. Please try again."
                : "Failed to create category. Please try again.";

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
                            const errorsObj = errorData.errors;
                            if (
                                typeof errorsObj === "object" &&
                                errorsObj !== null
                            ) {
                                errorMessage =
                                    Object.values(errorsObj).join(", ");
                            }
                        } else {
                            errorMessage = JSON.stringify(errorData);
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
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 my-8 relative">
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
                        {editCategory ? "Edit Category" : "Add New Category"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category Name */}
                        <div>
                            <label
                                htmlFor="category-name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Category Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="category-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border-2 rounded focus:outline-none focus:border-green-700 ${
                                    errors.name
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter category name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Category Description */}
                        <div>
                            <label
                                htmlFor="category-description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Description
                            </label>
                            <textarea
                                id="category-description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-4 py-2 border-2 rounded focus:outline-none focus:border-green-700 ${
                                    errors.description
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="Enter category description (optional)"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {isLoading
                                    ? "Saving..."
                                    : editCategory
                                      ? "Update Category"
                                      : "Create Category"}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
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

export default CategoryModal;
