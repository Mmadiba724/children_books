import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
    const { state, subtotalCents, clear } = useCart();
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);

    const subtotal = subtotalCents();
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + tax;

    async function handlePay(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Simulate payment delay
        await new Promise((r) => setTimeout(r, 900));

        // For demo: clear cart and navigate to success
        clear();
        nav("/?paid=true");
    }

    if (state.items.length === 0)
        return (
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold">Checkout</h1>
                <p>Your cart is empty.</p>
            </div>
        );

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-rose-50">
                <div className="mb-4">
                    <div className="text-sm text-gray-600">Order total</div>
                    <div className="text-2xl font-bold text-indigo-600">
                        ${(total / 100).toFixed(2)}
                    </div>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-rose-200"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-rose-200"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-semibold"
                        >
                            Address
                        </label>
                        <input
                            id="address"
                            name="address"
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-rose-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 rounded-full shadow-lg"
                    >
                        {loading
                            ? "Processing…"
                            : `Pay $${(total / 100).toFixed(2)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
