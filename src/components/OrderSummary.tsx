// import React from "react";

export default function OrderSummary({
    subtotal,
    tax,
    total,
    onProceed,
}: Readonly<{
    subtotal: number;
    tax: number;
    total: number;
    onProceed: () => void;
}>) {
    return (
        <aside className="bg-white p-4 rounded shadow">
            <div className="mb-3">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-xl font-semibold">
                    ${(subtotal / 100).toFixed(2)}
                </div>
            </div>
            <div className="mb-3">
                <div className="text-sm text-gray-600">Tax (7%)</div>
                <div className="text-xl font-semibold">
                    ${(tax / 100).toFixed(2)}
                </div>
            </div>
            <div className="mb-4">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold">
                    ${(total / 100).toFixed(2)}
                </div>
            </div>
            <button
                onClick={onProceed}
                className="w-full bg-indigo-600 text-white py-2 rounded"
            >
                Proceed to Checkout
            </button>
        </aside>
    );
}
