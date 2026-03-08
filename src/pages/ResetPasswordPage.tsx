import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../services/authService";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const tokenFromQuery = useMemo(() => searchParams.get("token") || "", [searchParams]);

    const [token, setToken] = useState(tokenFromQuery);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!token.trim()) {
            newErrors.token = "Reset token is required";
        }

        if (!newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "New password must be at least 8 characters long";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (confirmPassword !== newPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await authService.resetPassword({
                token: token.trim(),
                newPassword,
            });

            toast.success(response.message || "Password reset successful. Please sign in.");
            navigate("/", { replace: true });
        } catch (error) {
            const errorMessage =
                error &&
                    typeof error === "object" &&
                    "message" in error &&
                    typeof (error as { message: unknown }).message === "string"
                    ? (error as { message: string }).message
                    : "Reset password failed. The token may be invalid or expired.";
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-100 p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Enter your new password to complete the password reset process.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {errors.general}
                        </div>
                    )}

                    <div>
                        <input
                            type="text"
                            placeholder="Reset token"
                            value={token}
                            onChange={(e) => {
                                setToken(e.target.value);
                                if (errors.token) {
                                    setErrors({ ...errors, token: "" });
                                }
                            }}
                            className={`w-full px-4 py-3 border-2 rounded focus:outline-none focus:border-green-700 ${errors.token ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.token && <p className="text-red-500 text-sm mt-1">{errors.token}</p>}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (errors.newPassword) {
                                        setErrors({ ...errors, newPassword: "" });
                                    }
                                }}
                                className={`w-full px-4 py-3 border-2 rounded focus:outline-none focus:border-green-700 ${errors.newPassword ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label="Toggle new password visibility"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errors.confirmPassword) {
                                        setErrors({ ...errors, confirmPassword: "" });
                                    }
                                }}
                                className={`w-full px-4 py-3 border-2 rounded focus:outline-none focus:border-green-700 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Resetting password..." : "Reset Password"}
                    </button>
                </form>

                <p className="text-sm text-gray-600 mt-6 text-center">
                    Back to
                    <Link to="/" className="text-blue-600 hover:underline ml-1">
                        catalog
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default ResetPasswordPage;
