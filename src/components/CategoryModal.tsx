import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import categoryService, { type Category } from "../services/categoryService";
import authService from "../services/authService";
import tokenStorage from "../utils/tokenStorage";
import { adminBtn, adminInput } from "./admin/adminStyles";

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

    const inputCls = (hasError?: string) =>
        `${adminInput} ${hasError ? "border-error focus:border-error" : ""}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
        >
            <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
                    <div>
                        <h2
                            id="category-modal-title"
                            className="font-display text-xl font-bold text-ink"
                        >
                            {editCategory ? "Edit category" : "Add a category"}
                        </h2>
                        <p className="text-sm text-ink-soft">
                            Fields marked{" "}
                            <span className="text-error">*</span> are required.
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

                <div className="space-y-4 px-6 py-6">
                    <div>
                        <label
                            htmlFor="category-name"
                            className="mb-1 block text-sm font-semibold text-ink"
                        >
                            Name{" "}
                            <span className="text-error" aria-hidden="true">
                                *
                            </span>
                        </label>
                        <input
                            id="category-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={
                                errors.name ? "category-name-err" : undefined
                            }
                            className={inputCls(errors.name)}
                            placeholder="e.g. Bedtime stories"
                        />
                        {errors.name && (
                            <p
                                id="category-name-err"
                                role="alert"
                                className="mt-1 text-xs font-medium text-error"
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="category-description"
                            className="mb-1 block text-sm font-semibold text-ink"
                        >
                            Description
                        </label>
                        <textarea
                            id="category-description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            aria-invalid={Boolean(errors.description)}
                            aria-describedby={
                                errors.description
                                    ? "category-description-err"
                                    : "category-description-help"
                            }
                            className={inputCls(errors.description)}
                            placeholder="Optional"
                        />
                        {errors.description ? (
                            <p
                                id="category-description-err"
                                role="alert"
                                className="mt-1 text-xs font-medium text-error"
                            >
                                {errors.description}
                            </p>
                        ) : (
                            <p
                                id="category-description-help"
                                className="mt-1 text-xs text-muted"
                            >
                                A short note about what belongs on this shelf.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className={adminBtn.secondary}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={adminBtn.primary}
                    >
                        {isLoading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {isLoading
                            ? "Saving..."
                            : editCategory
                              ? "Save changes"
                              : "Create category"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryModal;
