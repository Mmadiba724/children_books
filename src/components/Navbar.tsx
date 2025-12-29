import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Navbar = () => {
    const { state } = useCart();
    const count = state.items.reduce((s, i) => s + i.quantity, 0);

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

                    <ul className="flex space-x-6 ml-4 text-sm">
                        <li>
                            <Link to="/" className="hover:underline">
                                Catalog
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="hover:underline">
                                About
                            </Link>
                        </li>
                    </ul>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/cart"
                            className="relative inline-flex items-center"
                        >
                            <span className="inline-block bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-3 py-2 rounded-full shadow">
                                Cart
                            </span>
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                    {count}
                                </span>
                            )}
                        </Link>

                        <div className="text-sm text-gray-600">
                            Parent Login
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
