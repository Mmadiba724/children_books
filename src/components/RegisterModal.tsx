import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { logTokenStatus } from "../utils/tokenDebugger";

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignInClick?: () => void;
}

const RegisterModal = ({
    isOpen,
    onClose,
    onSignInClick,
}: RegisterModalProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { login } = useAuth();
    const { refreshCart } = useCart();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        // At least 6 characters
        return password.length >= 6;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        // Validate email
        if (!email) {
            newErrors.email = "Email address is required";
        } else if (!validateEmail(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate password
        if (!password) {
            newErrors.password = "Password is required";
        } else if (!validatePassword(password)) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        // Validate confirm password
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Validate terms agreement
        if (!agreeToTerms) {
            newErrors.terms = "You must agree to the Terms of Use and Privacy Policy";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);
            try {
                const response = await authService.register({
                    email,
                    password,
                    name: name || undefined,
                });
                console.log("Registration successful, response:", response);

                // Log complete token status for debugging
                logTokenStatus();

                // Extract user data from response
                let userData = response.user;

                // If no user data in response, create a minimal user object
                if (!userData) {
                    userData = {
                        id: "unknown",
                        email: email,
                        name: name || undefined,
                    };
                }

                // Update AuthContext with user data
                login(userData);

                // Refresh cart from backend after registration
                await refreshCart();

                // Show success message
                toast.success("Account created successfully! Welcome!");

                // Reset form and close modal on success
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setName("");
                setAgreeToTerms(false);
                setErrors({});
                onClose();
            } catch (error) {
                // Handle registration errors
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Registration failed. Please try again.";
                setErrors({ general: errorMessage });
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSignInClick = () => {
        if (onSignInClick) {
            onSignInClick();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Create an Account
                    </h2>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* General Error Message */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {errors.general}
                            </div>
                        )}

                        {/* Name Input (Optional) */}
                        <div>
                            <input
                                type="text"
                                placeholder="Full Name (Optional)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-green-700"
                            />
                        </div>

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
                                    placeholder="Password (min. 6 characters)"
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

                        {/* Confirm Password Input */}
                        <div>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword ? "text" : "password"
                                    }
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) {
                                            setErrors({
                                                ...errors,
                                                confirmPassword: "",
                                            });
                                        }
                                    }}
                                    className={`w-full px-4 py-3 border-2 rounded focus:outline-none focus:border-green-700 ${
                                        errors.confirmPassword
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => {
                                        setAgreeToTerms(e.target.checked);
                                        if (errors.terms) {
                                            setErrors({
                                                ...errors,
                                                terms: "",
                                            });
                                        }
                                    }}
                                    className={`w-5 h-5 mt-0.5 rounded border-gray-300 cursor-pointer accent-green-700 ${
                                        errors.terms ? "border-red-500" : ""
                                    }`}
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the{" "}
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Terms of Use
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Privacy Policy
                                    </a>
                                </span>
                            </label>
                            {errors.terms && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.terms}
                                </p>
                            )}
                        </div>

                        {/* Create Account Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded transition duration-200 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                        {/* Sign In Button */}
                        <button
                            type="button"
                            onClick={handleSignInClick}
                            className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded transition duration-200"
                        >
                            Already have an account? Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;

