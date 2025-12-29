import React from "react";
import type { CartItem } from "../context/CartContext";

export default function CartItemRow({
    item,
    update,
    remove,
}: Readonly<{
    item: CartItem;
    update: (bookId: string, qty: number) => void;
    remove: (bookId: string) => void;
}>) {
    return (
        <div className="flex items-center bg-white p-4 rounded shadow">
            <img
                src={item.book.coverUrl}
                alt={item.book.title}
                className="w-20 h-28 object-cover rounded mr-4"
            />
            <div className="flex-1">
                <div className="font-bold">{item.book.title}</div>
                <div className="text-sm text-gray-600">{item.book.author}</div>
                <div className="mt-2">
                    ${(item.book.priceCents / 100).toFixed(2)}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <div className="inline-flex items-center bg-white rounded-full shadow px-2">
                    <button
                        aria-label={`Decrease ${item.book.title}`}
                        onClick={() =>
                            update(item.book.id, Math.max(1, item.quantity - 1))
                        }
                        className="px-3 py-1 text-lg"
                    >
                        −
                    </button>
                    <div className="px-3 font-bold">{item.quantity}</div>
                    <button
                        aria-label={`Increase ${item.book.title}`}
                        onClick={() => update(item.book.id, item.quantity + 1)}
                        className="px-3 py-1 text-lg"
                    >
                        +
                    </button>
                </div>
                <button
                    onClick={() => remove(item.book.id)}
                    className="text-red-500 underline"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}
