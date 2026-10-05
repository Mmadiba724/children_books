import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import authService from "../services/authService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { logTokenStatus } from "../utils/tokenDebugger";
import { modalVariants, backdropVariants } from "../utils/animations";

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
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
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
          phone: response.data.phone,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
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
        // Handle authentication errors - extract message from error response
        let errorMessage =
          "Login failed. Please check your credentials and try again.";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === "object" && "message" in error) {
          // ErrorResponse object from handleError utility
          errorMessage =
            (error as { message?: string }).message || errorMessage;
        }

        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!forgotEmail) {
      newErrors.forgotEmail = "Email address is required";
    } else if (!validateEmail(forgotEmail)) {
      newErrors.forgotEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsForgotSubmitting(true);
      try {
        const response = await authService.forgotPassword({
          email: forgotEmail,
        });
        setForgotSubmitted(true);
        setErrors({});
        toast.success(
          response.message ||
            "If the email exists, a reset link has been sent.",
        );
      } catch (error) {
        // Handle password reset errors - extract message from error response
        let errorMessage =
          "Failed to request password reset. Please try again.";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === "object" && "message" in error) {
          // ErrorResponse object from handleError utility
          errorMessage =
            (error as { message?: string }).message || errorMessage;
        }

        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsForgotSubmitting(false);
      }
    }
  };

  const handleOpenForgotPassword = () => {
    setIsForgotPasswordMode(true);
    setForgotSubmitted(false);
    setErrors({});
    setForgotEmail(email);
  };

  const handleBackToSignIn = () => {
    setIsForgotPasswordMode(false);
    setForgotSubmitted(false);
    setErrors({});
  };

  const handleClose = () => {
    setIsForgotPasswordMode(false);
    setForgotSubmitted(false);
    setErrors({});
    onClose();
  };

  const handleCreateAccount = () => {
    if (onCreateAccount) {
      onCreateAccount();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          className="fixed inset-0 bg-ink/45 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] overflow-y-auto bg-white rounded-3xl shadow-(--shadow-lift) w-full max-w-md mx-4 relative text-left"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-brand-light hover:text-ink-soft"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <h2 id="login-title" className="font-display text-2xl font-bold text-ink mb-2">
                {isForgotPasswordMode
                  ? "Forgot your password?"
                  : "Sign in or Create an Account"}
              </h2>
              {isForgotPasswordMode && (
                <p className="text-sm text-ink-soft mb-6">
                  Enter your email and we will send a password reset link.
                </p>
              )}

              <form
                onSubmit={
                  isForgotPasswordMode ? handleForgotPassword : handleSignIn
                }
                className="space-y-4"
              >
                {/* General Error Message */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors.general}
                  </div>
                )}

                {isForgotPasswordMode ? (
                  <>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (errors.forgotEmail) {
                            setErrors({
                              ...errors,
                              forgotEmail: "",
                            });
                          }
                        }}
                        className={`kb-input !border-2 !px-4 !py-3 ${
                          errors.forgotEmail
                            ? "border-error"
                            : "border-line-strong"
                        }`}
                      />
                      {errors.forgotEmail && (
                        <p className="text-error text-sm mt-1">
                          {errors.forgotEmail}
                        </p>
                      )}
                    </div>

                    {forgotSubmitted && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                        If this email exists in our system, we have sent a reset
                        link.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isForgotSubmitting}
                      className="kb-btn kb-btn-primary w-full py-3 mt-6"
                    >
                      {isForgotSubmitting
                        ? "Sending reset link..."
                        : "Send Reset Link"}
                    </button>

                    <button
                      type="button"
                      onClick={handleBackToSignIn}
                      className="kb-btn kb-btn-secondary w-full py-3"
                    >
                      Back to Sign In
                    </button>
                  </>
                ) : (
                  <>
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
                        className={`kb-input !border-2 !px-4 !py-3 ${
                          errors.email ? "border-error" : "border-line-strong"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-error text-sm mt-1">
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
                          className={`kb-input !border-2 !px-4 !py-3 ${
                            errors.password
                              ? "border-error"
                              : "border-line-strong"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-soft"
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
                        <p className="text-error text-sm mt-1">
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
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-5 h-5 rounded border-line-strong cursor-pointer accent-brand"
                        />
                        <span className="text-sm text-ink-soft">
                          Remember me
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenForgotPassword}
                        className="text-sm text-accent-dark hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="kb-btn kb-btn-primary w-full py-3 mt-6"
                    >
                      {isLoading ? "Signing in..." : "Sign In & Continue"}
                    </button>

                    {/* Create Account Button */}
                    <button
                      type="button"
                      onClick={handleCreateAccount}
                      className="kb-btn kb-btn-secondary w-full py-3"
                    >
                      Create an Account
                    </button>
                  </>
                )}
              </form>

              {/* Terms and Privacy */}
              {!isForgotPasswordMode && (
                <p className="text-center text-xs text-ink-soft mt-6">
                  By signing in you are agreeing to our{" "}
                  <span className="font-bold text-ink">
                    Terms of Use
                  </span>{" "}
                  and our{" "}
                  <span className="font-bold text-ink">
                    Privacy Policy
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
