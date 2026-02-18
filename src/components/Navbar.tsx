import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import categoryService from "../services/categoryService";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import {
    // MapPin,
    User,
    Heart,
    ShoppingCart,
    Search,
    ChevronDown,
    ShieldCheck,
    BookOpen,
    Package,
} from "lucide-react";
import LoginModal from "./LoginModal";
import AddBookModal from "./AddBookModal";
import CartSidebar from "./CartSidebar";

const AccountMenu = ({
    isOpen,
    onToggle,
    onSignInClick,
    isAuthenticated,
    onLogout,
    userName,
    onClose,
}: {
    isOpen: boolean;
    onToggle: () => void;
    onSignInClick?: () => void;
    isAuthenticated: boolean;
    onLogout?: () => void;
    userName?: string;
    onClose: () => void;
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={onToggle}
                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
            >
                
                <span>
                    {isAuthenticated && userName

                        ? 
                        <div className="flex items-center gap-1">
                        <User size={14} /> 
                        {userName.toUpperCase()}
                        </div>
                        : "CREATE ACCOUNT | LOGIN"}
                </span>
                <ChevronDown size={12} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-200 py-2 z-50">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/library"
                                className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={onToggle}
                            >
                                <BookOpen size={14} />
                                My Library
                            </Link>
                            <Link
                                to="/orders"
                                className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={onToggle}
                            >
                                <Package size={14} />
                                My Orders
                            </Link>
                            <Link
                                to="/admin"
                                className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={onToggle}
                            >
                                <ShieldCheck size={14} />
                                Admin Dashboard
                            </Link>
                            <hr className="my-2 border-gray-200" />
                            <button
                                onClick={() => {
                                    onLogout?.();
                                    onToggle();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col">
                            <button
                                onClick={() => {
                                    onSignInClick?.();
                                    onToggle();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Sign In
                            </button>
                            <Link
                                to="#"
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={onToggle}
                            >
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Navbar = () => {
    const navigate = useNavigate();
    const { state } = useCart();
    const { isAuthenticated, logout, user } = useAuth();
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchCategory, setSearchCategory] = useState("All");
    const [searchInput, setSearchInput] = useState("");
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

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
        const handleClickOutside = (event: MouseEvent) => {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target as Node)
            ) {
                setCategoryDropdownOpen(false);
            }
        };

        if (categoryDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [categoryDropdownOpen]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAllCategories();
                if (response && Array.isArray(response)) {
                    const categoryNames = response.map((cat) => cat.name);
                    setCategories(categoryNames);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
                // Fallback to empty array if fetch fails
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate to search results page with search params
        const params = new URLSearchParams();
        if (searchInput.trim()) {
            params.append("q", searchInput.trim());
        }
        if (searchCategory !== "All") {
            params.append("category", searchCategory);
        }
        navigate(`/search?${params.toString()}`);
    };

    return (
        <header className="w-full bg-rose-50 sticky mx-auto top-0 z-30 shadow-sm">
            {/* Top Bar */}
            <div className=" border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex justify-end items-center text-xs">
                        {/* <div className="flex items-center gap-4">
                            <Link
                                to="#"
                                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                            >
                                <MapPin size={14} />
                                STORES & EVENTS
                            </Link>
                            <span className="text-gray-300">|</span>
                            <Link
                                to="#"
                                className="text-gray-700 hover:text-gray-900"
                            >
                                MEMBERSHIP
                            </Link>
                            <span className="text-gray-300">|</span>
                            <Link
                                to="#"
                                className="text-gray-700 hover:text-gray-900"
                            >
                                KIDS READS BLOG
                            </Link>
                            <span className="text-gray-300">|</span>
                            <Link
                                to="#"
                                className="text-gray-700 hover:text-gray-900"
                            >
                                PODCAST
                            </Link>
                            <span className="text-gray-300">|</span>
                            <Link
                                to="#"
                                className="text-gray-700 hover:text-gray-900"
                            >
                                SWEEPSTAKES
                            </Link>
                            <span className="text-gray-300">|</span>
                            <Link
                                to="#"
                                className="text-gray-700 hover:text-gray-900"
                            >
                                GIFT CARDS
                            </Link>
                        </div> */}
                        <div className="flex items-center gap-4">
                            <AccountMenu
                                isOpen={accountMenuOpen}
                                onToggle={() =>
                                    setAccountMenuOpen(!accountMenuOpen)
                                }
                                onSignInClick={() => setIsLoginModalOpen(true)}
                                isAuthenticated={isAuthenticated}
                                onLogout={handleLogout}
                                userName={user?.name || user?.email}
                                onClose={() => setAccountMenuOpen(false)}
                            />
                            {isAuthenticated && (
                                <>
                                    {/* <span className="text-gray-300">|</span> */}
                                    {/* <button
                                        onClick={() =>
                                            setIsAddBookModalOpen(true)
                                        }
                                        className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                                    >
                                        <BookPlus size={14} />
                                        ADD BOOK
                                    </button> */}
                                    {/* <span className="text-gray-300">|</span> */}
                                    {/* <Link
                                        to="/admin"
                                        className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                                    >
                                        <ShieldCheck size={14} />
                                        ADMIN
                                    </Link> */}
                                </>
                            )}
                            <span className="text-gray-300">|</span>
                            <Link
                                to="#"
                                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                            >
                                <Heart size={14} />
                                WISHLIST
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="KidsBooks" className="h-12" />
                        <div className="text-2xl font-bold">
                            <span className="text-rose-600">KIDS</span>
                            <span className="text-gray-700">BOOKS</span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-250">
                        <form
                            onSubmit={handleSearch}
                            className="flex items-stretch border border-gray-300 rounded"
                        >
                            <div className="relative" ref={categoryDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCategoryDropdownOpen(
                                            !categoryDropdownOpen,
                                        )
                                    }
                                    className="flex items-center gap-2 px-4 h-full bg-gray-50 hover:bg-gray-100 border-r border-gray-300 text-sm font-medium"
                                >
                                    {searchCategory}
                                    <ChevronDown size={16} />
                                </button>
                                {categoryDropdownOpen && (
                                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
                                        {["All", ...categories].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    setSearchCategory(cat);
                                                    setCategoryDropdownOpen(
                                                        false,
                                                    );
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Search by Title, Author, Keyword or ISBN"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="flex-1 px-4 py-2 text-sm focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="px-6 bg-gray-800 hover:bg-gray-900 text-white"
                            >
                                <Search size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Cart */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative flex items-center justify-center"
                    >
                        <ShoppingCart size={28} className="text-gray-700" />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Category Navigation */}
            <div className="border-t border-gray-200">
                <div className="max-w-8xl mx-auto px-4">
                    <nav className="flex items-center justify-center gap-8 py-3 text-sm font-medium overflow-x-auto">
                        <Link
                            to="/catalog"
                            className="text-gray-700 hover:text-rose-600 whitespace-nowrap"
                        >
                            All
                        </Link>

                        {categories.length > 0 && (
                            <span className="text-gray-300">|</span>
                        )}

                        {categories.map((category, index) => (
                            <div key={category} className="flex items-center">
                                <Link
                                    to={`/catalog?category=${category}`}
                                    className="text-gray-700 hover:text-rose-600 whitespace-nowrap"
                                >
                                    {category}
                                </Link>
                                {index < categories.length - 1 && (
                                    <span className="text-gray-300 ml-8">
                                        |
                                    </span>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSignIn={(email, password) => {
                    // Handle sign in logic here
                    console.log("Sign in with:", email, password);
                    setIsLoginModalOpen(false);
                }}
                onCreateAccount={() => {
                    // Handle create account logic here
                    console.log("Create account clicked");
                }}
            />

            <AddBookModal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                onSuccess={() => {
                    // Optionally refresh the book list or show a success message
                    console.log("Book added successfully!");
                }}
            />

            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </header>
    );
};

export default Navbar;
