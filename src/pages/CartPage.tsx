import { useCart } from "../context/CartContext";
import CartItemRow from "../components/CartItemRow";
import OrderSummary from "../components/OrderSummary";
import { Link, useNavigate } from "react-router-dom";

// eslint-disable-next-line max-lines-per-function
export default function CartPage() {
    const { state, update, remove, subtotalCents } = useCart();
    const nav = useNavigate();

    const subtotal = subtotalCents();
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + tax;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

            {state.items.length === 0 ? (
                <div className="p-6 bg-white rounded shadow">
                    <p>Your cart is empty.</p>
                    <Link to="/" className="text-indigo-600 underline">
                        Back to catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        {state.items.map((item) => (
                            <CartItemRow
                                key={item.book.id}
                                item={item}
                                update={update}
                                remove={remove}
                            />
                        ))}
                    </div>

                    <OrderSummary
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                        onProceed={() => nav("/checkout")}
                    />
                </div>
            )}
        </div>
    );
}
