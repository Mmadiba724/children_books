import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import authService from "../services/authService";
import toast from "react-hot-toast";
import { formatPhoneNumber, isValidPhoneNumber } from "../utils/phoneFormatter";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    // Validate phone number if provided
    if (phone && !isValidPhoneNumber(formatPhoneNumber(phone))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Format phone number: replace leading 0 with country code
        const formattedPhone = phone ? formatPhoneNumber(phone, "UG") : "";

        await authService.register({
          email,
          password,
          firstName,
          lastName,
          phone: formattedPhone,
        });
        console.log("Registration successful");

        // Show success message
        toast.success(
          "Account created successfully! Please sign in to continue.",
        );

        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        // setName("");
        setAgreeToTerms(false);
        setErrors({});

        // Close register modal and open login modal
        onClose();
        if (onSignInClick) {
          onSignInClick();
        }
      } catch (error) {
        // Handle registration errors - extract message from error response
        let errorMessage = "Registration failed. Please try again.";

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

  const handleSignInClick = () => {
    if (onSignInClick) {
      onSignInClick();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/45 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-h-[92dvh] overflow-y-auto bg-white rounded-3xl shadow-(--shadow-lift) w-full max-w-md mx-4 relative text-left" role="dialog" aria-modal="true" aria-labelledby="register-title">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-brand-light hover:text-ink-soft z-10"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 id="register-title" className="font-display text-2xl font-bold text-ink mb-6">
            Create an Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* First Name Input  */}
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="kb-input !border-2 !px-4 !py-3"
              />
            </div>

            {/* Last Name Input  */}
            <div>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="kb-input !border-2 !px-4 !py-3"
              />
            </div>

            {/* Phone Input */}
            <div>
              <input
                type="text"
                placeholder="Phone Number (e.g., 0789123456)"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) {
                    setErrors({
                      ...errors,
                      phone: "",
                    });
                  }
                }}
                className={`kb-input !border-2 !px-4 !py-3 ${
                  errors.phone ? "border-error" : "border-line-strong"
                }`}
              />
              {errors.phone && (
                <p className="text-error text-sm mt-1">{errors.phone}</p>
              )}
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
                className={`kb-input !border-2 !px-4 !py-3 ${
                  errors.email ? "border-error" : "border-line-strong"
                }`}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email}</p>
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
                  className={`kb-input !border-2 !px-4 !py-3 ${
                    errors.password ? "border-error" : "border-line-strong"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-soft"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
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
                  className={`kb-input !border-2 !px-4 !py-3 ${
                    errors.confirmPassword
                      ? "border-error"
                      : "border-line-strong"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-soft"
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
                <p className="text-error text-sm mt-1">
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
                  className={`w-5 h-5 mt-0.5 rounded border-line-strong cursor-pointer accent-brand ${
                    errors.terms ? "border-error" : ""
                  }`}
                />
                <span className="text-sm text-ink-soft">
                  I agree to the{" "}
                  <span className="font-bold text-ink">
                    Terms of Use
                  </span>{" "}
                  and{" "}
                  <span className="font-bold text-ink">
                    Privacy Policy
                  </span>
                </span>
              </label>
              {errors.terms && (
                <p className="text-error text-sm mt-1">{errors.terms}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="kb-btn kb-btn-primary w-full py-3 mt-6"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleSignInClick}
              className="kb-btn kb-btn-secondary w-full py-3"
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
