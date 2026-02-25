import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import authService from "../services/authService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { logTokenStatus } from "../utils/tokenDebugger";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignIn?: (email: string, password: string) => void;
    onCreateAccount?: () => void;
}

const LoginModal = ({
    isOpen,
    onClose,
    onSignIn,
    onCreateAccount,
}: LoginModalProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { refreshCart } = useCart();
    const { login } = useAuth();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!email) {
            newErrors.email = "Email address is required";
        } else if (!validateEmail(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const response = await authService.login({ email, password });
                console.log("Login successful, response:", response);

                // Log complete token status for debugging
                logTokenStatus();

                // Extract user data from response
                // Response structure: { success, message, data: { userId, email, role, ... }, timestamp }
                const userData = {
                    id: response.data.userId?.toString() || "unknown",
                    email: response.data.email || email,
                    role: response.data.role,
                    name: response.data.name,
                };

                // Update AuthContext with user data
                login(userData);

                // Refresh cart from backend after login
                console.log("[Login] Refreshing cart after authentication...");
                console.log(
                    "[Login] Guest cart session will be merged with user account",
                );
                await refreshCart();
                console.log(
                    "[Login] ✅ Cart refreshed - guest cart merged successfully",
                );

                // Call the callback if provided
                if (onSignIn) {
                    onSignIn(email, password);
                }

                // Reset form and close modal on success
                setEmail("");
                setPassword("");
                setRememberMe(false);
                setErrors({});
                onClose();
            } catch (error) {
                // Handle authentication errors
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Login failed. Please check your credentials and try again.";
                setErrors({ general: errorMessage });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCreateAccount = () => {
        if (onCreateAccount) {
            onCreateAccount();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Sign in or Create an Account
                    </h2>

                    <form onSubmit={handleSignIn} className="space-y-4">
                        {/* General Error Message */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {errors.general}
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) {
                                        setErrors({
                                            ...errors,
                                            email: "",
                                        });
                                    }
                                }}
                                className={`w-full px-4 py-3 border-2 rounded focus:outline-none focus:border-green-700 ${
                                    errors.email
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) {
                                            setErrors({
                                                ...errors,
                                                password: "",
                                            });
                                        }
                                    }}
                                    className={`w-full px-4 py-3 border-2 rounded focus:outline-none focus:border-green-700 ${
                                        errors.password
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                    className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-green-700"
                                />
                                <span className="text-sm text-gray-700">
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded transition duration-200 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing in..." : "Sign In & Continue"}
                        </button>

                        {/* Create Account Button */}
                        <button
                            type="button"
                            onClick={handleCreateAccount}
                            className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded transition duration-200"
                        >
                            Create an Account
                        </button>
                    </form>

                    {/* Terms and Privacy */}
                    <p className="text-center text-xs text-gray-600 mt-6">
                        By signing in you are agreeing to our{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                            Terms of Use
                        </a>{" "}
                        and our{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
