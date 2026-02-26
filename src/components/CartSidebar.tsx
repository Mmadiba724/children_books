import { X, ShoppingCart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import LoginModal from "./LoginModal";
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

    const subtotal = subtotalCents();
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + tax;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }
        onClose();
        navigate("/checkout");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.button
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        onClick={onClose}
                        className="fixed inset-0 bg-transparent bg-opacity-50 z-40 cursor-default"
                        aria-label="Close cart"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={sidebarVariants}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <ShoppingCart
                                    size={20}
                                    className="text-gray-700"
                                />
                                <h2 className="text-lg font-bold">
                                    Shopping Cart
                                </h2>
                                {state.items.length > 0 && (
                                    <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {state.items.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        {state.items.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-6">
                                <div className="text-center">
                                    <ShoppingCart
                                        size={64}
                                        className="mx-auto text-gray-300 mb-4"
                                    />
                                    <p className="text-gray-600 mb-4">
                                        Your cart is empty
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Free Shipping Notice */}
                                {/* <div className="bg-green-50 border-b border-green-200 p-3">
                            <p className="text-sm text-green-800">
                                ADD ${((31 * 100 - subtotal) / 100).toFixed(2)}{" "}
                                OF ELIGIBLE ITEMS TO QUALIFY FOR FREE SHIPPING
                            </p>
                        </div> */}

                                {/* Cart Items */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {state.items.map((item) => (
                                        <div
                                            key={item.book.id}
                                            className="flex gap-3 pb-4 border-b border-gray-200"
                                        >
                                            {/* Book Image */}
                                            <img
                                                src={getImageUrl(
                                                    item.book.coverImageUrl,
                                                )}
                                                alt={item.book.title}
                                                className="w-20 h-28 object-cover rounded"
                                            />

                                            {/* Book Details */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-1">
                                                    {item.book.title}
                                                </h3>
                                                <p className="text-xs text-gray-600 mb-1">
                                                    {item.book.author}
                                                </p>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {item.book.format}
                                                </p>
                                                <p className="font-bold text-sm mb-2">
                                                    UGX{" "}
                                                    {(
                                                        (item.book.price *
                                                            100) /
                                                        100
                                                    ).toFixed(2)}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center border border-gray-300 rounded">
                                                        <button
                                                            onClick={() =>
                                                                update(
                                                                    item.book
                                                                        .id,
                                                                    Math.max(
                                                                        1,
                                                                        item.quantity -
                                                                            1,
                                                                    ),
                                                                )
                                                            }
                                                            className="p-1 hover:bg-gray-100"
                                                            disabled={
                                                                item.quantity <=
                                                                1
                                                            }
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={
                                                                item.quantity
                                                            }
                                                            readOnly
                                                            className="w-10 text-center text-sm border-x border-gray-300"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                update(
                                                                    item.book
                                                                        .id,
                                                                    item.quantity +
                                                                        1,
                                                                )
                                                            }
                                                            className="p-1 hover:bg-gray-100"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3 mt-2">
                                                    <button className="text-xs text-blue-600 hover:underline">
                                                        Save for Later
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            remove(item.book.id)
                                                        }
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-lg">
                                            ORDER TOTAL
                                        </span>
                                        <span className="font-bold text-lg">
                                            UGX {(total / 100).toFixed(2)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded transition-colors mb-3"
                                    >
                                        CONTINUE TO CHECKOUT
                                    </button>

                                    {/* <div className="text-center">
                                <p className="text-xs text-gray-600 mb-2">
                                    Or Checkout With
                                </p>
                                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 rounded transition-colors">
                                    PayPal
                                </button>
                            </div> */}
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
