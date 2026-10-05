import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import BookCover from "./ui/BookCover";
import { formatPrice } from "../utils/formatPrice";
import { backdropVariants, sidebarVariants } from "../utils/animations";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { state, update, remove, subtotalCents } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const total = subtotalCents();
  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    onClose();
    navigate("/checkout");
  };

  // Escape closes the drawer, focus moves in when it opens, page scroll is locked
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoginModalOpen) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, isLoginModalOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.button
            type="button"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-ink/45 backdrop-blur-[2px]"
            aria-label="Close cart"
            tabIndex={-1}
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-cream text-left shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <h2
                id="cart-title"
                className="flex items-center gap-2 font-display text-xl font-bold"
              >
                <ShoppingBag
                  className="h-5 w-5 text-brand"
                  aria-hidden="true"
                />
                Your cart
                {itemCount > 0 && (
                  <span className="kb-badge bg-brand-light text-brand-dark">
                    {itemCount}
                  </span>
                )}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="kb-btn kb-btn-quiet !min-h-11 !min-w-11 !p-0"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {state.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sun-light text-warning">
                  <ShoppingBag className="h-9 w-9" aria-hidden="true" />
                </span>
                <p className="font-display text-2xl font-bold">
                  Your cart is empty
                </p>
                <p className="mt-2 text-ink-soft">
                  Find a story to add and it will wait for you here.
                </p>
                <Link
                  to="/books"
                  onClick={onClose}
                  className="kb-btn kb-btn-primary mt-6"
                >
                  Browse books
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto p-5">
                  {state.items.map((item) => (
                    <li key={item.book.id} className="kb-card flex gap-4 p-3">
                      <Link
                        to={`/book/${item.book.id}`}
                        onClick={onClose}
                        className="w-20 shrink-0 self-start"
                        aria-label={`View ${item.book.title}`}
                      >
                        <BookCover
                          title={item.book.title}
                          coverImageUrl={item.book.coverImageUrl}
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="line-clamp-2 font-display text-base leading-snug font-bold capitalize">
                          {item.book.title}
                        </h3>
                        <p className="truncate text-sm text-ink-soft">
                          {item.book.author}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-muted">
                          {item.book.format === "DIGITAL" ? "Digital" : "Print"}
                        </p>
                        <p className="mt-1 font-extrabold">
                          {formatPrice(item.book.price)}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div
                            role="group"
                            aria-label={`Quantity of ${item.book.title}`}
                            className="flex items-center rounded-full border-2 border-line"
                          >
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                update(
                                  item.book.id,
                                  Math.max(1, item.quantity - 1),
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-brand-light disabled:opacity-40"
                            >
                              <Minus
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            </button>
                            <output className="min-w-6 text-center text-sm font-extrabold">
                              {item.quantity}
                            </output>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() =>
                                update(item.book.id, item.quantity + 1)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-brand-light"
                            >
                              <Plus
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.book.id)}
                            aria-label={`Remove ${item.book.title} from cart`}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-error-light hover:text-error"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line bg-white p-5">
                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="font-bold text-ink-soft">Total</span>
                    <span className="text-2xl font-extrabold">
                      {formatPrice(total / 100)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="kb-btn kb-btn-primary w-full py-3 text-base"
                  >
                    Continue to checkout
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="kb-btn kb-btn-quiet mt-2 w-full"
                  >
                    Keep browsing
                  </button>
                </div>
              </>
            )}
          </motion.div>

          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSignIn={() => {
              // Login successful, modal will close itself
              // Navigate to checkout after a brief delay to ensure auth state updates
              setTimeout(() => {
                onClose();
                navigate("/checkout");
              }, 100);
            }}
            onCreateAccount={() => {
              setIsLoginModalOpen(false);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
