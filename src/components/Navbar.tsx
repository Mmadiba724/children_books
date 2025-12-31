import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Navbar = () => {
    const { state } = useCart();
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="bg-linear-to-r from-rose-50 via-white to-cyan-50 shadow-sm sticky top-0 z-20">
            <div className="max-w-8xl mx-auto p-4 px-8">
                <nav className="flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="text-3xl">📚</div>
                        <div className="font-extrabold text-rose-600 text-lg">
                            KidsBooks
                        </div>
                    </Link>

                    {/* Hamburger for mobile */}
                    <button
                        className="md:hidden flex flex-col justify-center items-center w-10 h-10"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label="Toggle menu"
                    >
                        <span
                            className={`block h-0.5 w-6 bg-gray-800 mb-1 transition-all ${
                                menuOpen ? "rotate-45 translate-y-1.5" : ""
                            }`}
                        ></span>
                        <span
                            className={`block h-0.5 w-6 bg-gray-800 mb-1 transition-all ${
                                menuOpen ? "opacity-0" : ""
                            }`}
                        ></span>
                        <span
                            className={`block h-0.5 w-6 bg-gray-800 transition-all ${
                                menuOpen ? "-rotate-45 -translate-y-1.5" : ""
                            }`}
                        ></span>
                    </button>

                    {/* Desktop menu */}
                    <ul className="hidden md:flex space-x-6 ml-4 text-sm">
                        <li>
                            <Link to="/" className="hover:underline">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="hover:underline">
                                About
                            </Link>
                        </li>
                    </ul>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/cart"
                            className="relative inline-flex items-center"
                        >
                            <span className="inline-block bg-linear-to-r from-indigo-500 to-cyan-500 text-white px-3 py-2 rounded-full shadow">
                                Cart
                            </span>
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                    {count}
                                </span>
                            )}
                        </Link>
                        <div className="text-sm text-gray-600">
                            Login
                        </div>
                    </div>
                </nav>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden mt-2">
                        <ul className="flex flex-col space-y-2 text-sm bg-white rounded shadow p-4">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:underline"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="hover:underline"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/cart"
                                    className="relative inline-flex items-center mt-2"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span className="inline-block bg-linear-to-r from-indigo-500 to-cyan-500 text-white px-3 py-2 rounded-full shadow">
                                        Cart
                                    </span>
                                    {count > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                            {count}
                                        </span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <div className="text-sm text-gray-600 mt-2">
                                    Login
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
