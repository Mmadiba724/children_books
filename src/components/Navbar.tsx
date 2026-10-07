import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { OPEN_LOGIN_EVENT, useWishlist } from "../context/WishlistContext";
import categoryService from "../services/categoryService";
import toast from "react-hot-toast";
import logo from "/logo-main.png";
import logoText from "/logo-text.png";
import {
  User,
  ShoppingBag,
  Search,
  ChevronDown,
  ShieldCheck,
  BookOpen,
  Package,
  Heart,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import AddBookModal from "./AddBookModal";
import CategorySelect from "./CategorySelect";
import CartSidebar from "./CartSidebar";
import { navbarVariants } from "../utils/animations";

const menuItem =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-ink-soft transition-colors hover:bg-brand-light hover:text-brand-dark";

// const navLinkClass = ({ isActive }: { isActive: boolean }) =>
//   `rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${
//     isActive
//       ? "bg-ink text-white"
//       : "text-ink-soft hover:bg-brand-light hover:text-brand-dark"
//   }`;

const AccountMenu = ({
  isOpen,
  onToggle,
  onSignInClick,
  onCreateAccountClick,
  isAuthenticated,
  onLogout,
  userName,
  userRole,
  onClose,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onSignInClick?: () => void;
  onCreateAccountClick?: () => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
  onClose: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
//   const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="kb-btn kb-btn-secondary kb-btn-sm max-w-52 !px-3 sm:!px-4"
      >
        <User className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden truncate lg:inline">
          {isAuthenticated && userName ? userName : "Sign in"}
        </span>
        <span className="sr-only lg:hidden">Account menu</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-(--shadow-lift)"
        >
          {isAuthenticated ? (
            <>
              <p className="truncate px-3 pt-1 pb-2 text-xs font-extrabold tracking-wide text-muted uppercase">
                {userName}
              </p>
              <Link
                to="/library"
                role="menuitem"
                className={menuItem}
                onClick={onToggle}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                My library
              </Link>
              <Link
                to="/orders"
                role="menuitem"
                className={menuItem}
                onClick={onToggle}
              >
                <Package className="h-4 w-4" aria-hidden="true" />
                My orders
              </Link>
              
              {userRole === "ADMIN" && (
                <Link
                  to="/admin"
                  role="menuitem"
                  className={menuItem}
                  onClick={onToggle}
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Admin dashboard
                </Link>
              )}
              <hr className="my-2 border-line" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onLogout?.();
                  onToggle();
                }}
                className={`${menuItem} text-error hover:bg-error-light hover:text-error`}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onSignInClick?.();
                  onToggle();
                }}
                className={menuItem}
              >
                Sign in
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onCreateAccountClick?.();
                  onToggle();
                }}
                className={menuItem}
              >
                Create account
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, logout, user } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const fullName = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || user?.email;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  const activeCategory = new URLSearchParams(location.search).get("category");

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response && Array.isArray(response)) {
          setCategories(response.map((cat) => cat.name));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Lets any page ask for the sign-in modal (e.g. hearting a book while signed out)
  useEffect(() => {
    const open = () => setIsLoginModalOpen(true);
    window.addEventListener(OPEN_LOGIN_EVENT, open);
    return () => window.removeEventListener(OPEN_LOGIN_EVENT, open);
  }, []);

  // Close the mobile drawer whenever the route changes, and on Escape
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.append("q", searchInput.trim());
    }
    if (searchCategory !== "All") {
      params.append("category", searchCategory);
    }
    navigate(`/books?${params.toString()}`);
  };

  const wishlistBadge = wishlistCount > 0 && (
    <span
      aria-hidden="true"
      className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-cream bg-brand px-1 text-xs font-extrabold text-white"
    >
      {wishlistCount}
    </span>
  );
  const wishlistLabel = `Wishlist, ${wishlistCount} ${wishlistCount === 1 ? "book" : "books"}`;
  const wishlistClass = "kb-btn kb-btn-secondary relative !min-h-11 !px-3.5";
  const wishlistButton = isAuthenticated ? (
    <Link to="/wishlist" aria-label={wishlistLabel} className={wishlistClass}>
      <Heart className="h-5 w-5" aria-hidden="true" />
      {wishlistBadge}
    </Link>
  ) : (
    <button
      type="button"
      aria-label="Wishlist, sign in to use it"
      className={wishlistClass}
      onClick={() => {
        toast("Sign in to save books to your wishlist");
        setIsLoginModalOpen(true);
      }}
    >
      <Heart className="h-5 w-5" aria-hidden="true" />
    </button>
  );

  const cartButton = (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="kb-btn kb-btn-primary relative !min-h-11 !px-3.5"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-cream bg-sun px-1 text-xs font-extrabold text-ink"
        >
          {count}
        </span>
      )}
    </button>
  );

  const searchForm = (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex min-h-11 w-full items-stretch rounded-full border-2 border-accent/60 bg-white transition-colors focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20"
    >
      <CategorySelect
        value={searchCategory}
        options={["All", ...categories]}
        onChange={setSearchCategory}
      />
      <label htmlFor="nav-search" className="sr-only">
        Search books, authors or categories
      </label>
      <input
        id="nav-search"
        type="search"
        placeholder="Search books, authors…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink placeholder:text-muted focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="m-1 flex w-10 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-brand"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={navbarVariants}
        className="sticky top-0 z-40 w-full border-b border-line bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85"
      >
        <div className="kb-container flex h-16 items-center gap-3 md:h-[4.5rem] md:gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="kb-btn kb-btn-quiet !min-h-11 !min-w-11 !p-0 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          <Link
            to="/"
            aria-label="Book Jungle home"
            className="flex shrink-0 items-center gap-1 max-md:mr-auto"
          >
            <img src={logo} alt="" className="h-9 w-auto md:h-11" />
            <img
              src={logoText}
              alt="Book Jungle"
              className="h-9 w-auto md:h-11"
            />
          </Link>

          {/* Search form */}

          <div className="hidden min-w-0 flex-1 md:block">{searchForm}</div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block">
              <AccountMenu
                isOpen={accountMenuOpen}
                onToggle={() => setAccountMenuOpen(!accountMenuOpen)}
                onSignInClick={() => setIsLoginModalOpen(true)}
                onCreateAccountClick={() => setIsRegisterModalOpen(true)}
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
                userName={displayName}
                userRole={user?.role}
                onClose={() => setAccountMenuOpen(false)}
              />
            </div>
            {wishlistButton}
            {cartButton}
          </div>
        </div>

        {/* Mobile search */}
        <div className="kb-container pb-3 md:hidden">{searchForm}</div>

        {/* Category shelf: desktop */}
        {categories.length > 0 && (
          <nav
            aria-label="Browse by category"
            className="hidden border-t border-line-soft md:block"
          >
            <ul className="kb-container hide-scrollbar flex items-center justify-center-safe gap-2 overflow-x-auto py-2">
              <li>
                <Link
                  to="/books"
                  aria-current={
                    location.pathname === "/books" && !activeCategory
                      ? "page"
                      : undefined
                  }
                  className="kb-chip !min-h-9 !text-[0.8125rem]"
                >
                  All books
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/books?category=${encodeURIComponent(category)}`}
                    aria-current={
                      activeCategory === category ? "page" : undefined
                    }
                    className="kb-chip !min-h-9 !text-[0.8125rem]"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-8.5rem)] overflow-y-auto border-t border-line bg-white shadow-(--shadow-lift) md:hidden"
          >
            <div className="kb-container space-y-5 py-5 text-left">
              <nav aria-label="Main" className="grid gap-1">
                <Link to="/books" className={menuItem}>
                  All books
                </Link>
                <Link to="/about" className={menuItem}>
                  About us
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/library" className={menuItem}>
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      My library
                    </Link>
                    <Link to="/orders" className={menuItem}>
                      <Package className="h-4 w-4" aria-hidden="true" />
                      My orders
                    </Link>
                    <Link to="/wishlist" className={menuItem}>
                      <Heart className="h-4 w-4" aria-hidden="true" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto rounded-full bg-brand-light px-2 py-0.5 text-xs font-extrabold text-brand-dark">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link to="/admin" className={menuItem}>
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Admin dashboard
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {categories.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-xs font-extrabold tracking-wide text-muted uppercase">
                    Browse by category
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <li key={category}>
                        <Link
                          to={`/books?category=${encodeURIComponent(category)}`}
                          className="kb-chip"
                        >
                          {category}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-line pt-4">
                {isAuthenticated ? (
                  <>
                    <p className="mb-2 flex items-center gap-2 px-1 text-sm font-bold text-ink">
                      <User className="h-4 w-4" aria-hidden="true" />
                      {displayName}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className={`${menuItem} text-error hover:bg-error-light hover:text-error`}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="kb-btn kb-btn-secondary"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="kb-btn kb-btn-primary"
                    >
                      Create account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignIn={() => {
          setIsLoginModalOpen(false);
        }}
        onCreateAccount={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSignInClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onSuccess={() => {
          console.log("Book added successfully!");
        }}
      />

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
