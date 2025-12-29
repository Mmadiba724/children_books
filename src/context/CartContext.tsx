import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import type { ReactNode } from "react";
import { Book } from "../data/books";

export type CartItem = {
    book: Book;
    quantity: number;
};

type State = {
    items: CartItem[];
};

type Action =
    | { type: "add"; book: Book; quantity?: number }
    | { type: "remove"; bookId: string }
    | { type: "update"; bookId: string; quantity: number }
    | { type: "clear" };

const initialState: State = { items: [] };

function cartReducer(state: State, action: Action): State {
    switch (action.type) {
        case "add": {
            const exists = state.items.find(
                (i) => i.book.id === action.book.id
            );
            if (exists) {
                return {
                    items: state.items.map((i) =>
                        i.book.id === action.book.id
                            ? {
                                  ...i,
                                  quantity: i.quantity + (action.quantity ?? 1),
                              }
                            : i
                    ),
                };
            }
            return {
                items: [
                    ...state.items,
                    { book: action.book, quantity: action.quantity ?? 1 },
                ],
            };
        }
        case "remove":
            return {
                items: state.items.filter((i) => i.book.id !== action.bookId),
            };
        case "update":
            return {
                items: state.items.map((i) =>
                    i.book.id === action.bookId
                        ? { ...i, quantity: action.quantity }
                        : i
                ),
            };
        case "clear":
            return { items: [] };
        default:
            return state;
    }
}

const CartContext = createContext<{
    state: State;
    add: (book: Book, qty?: number) => void;
    remove: (bookId: string) => void;
    update: (bookId: string, qty: number) => void;
    clear: () => void;
    subtotalCents: () => number;
} | null>(null);

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
        try {
            const raw = localStorage.getItem("cart");
            return raw ? JSON.parse(raw) : init;
        } catch (e) {
            // if parsing fails, ignore and return initial
            console.warn("Failed to read persisted cart", e);
            return init;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(state));
        } catch (e) {
            console.warn("Failed to persist cart", e);
        }
    }, [state]);

    const add = (book: Book, qty = 1) =>
        dispatch({ type: "add", book, quantity: qty });
    const remove = (bookId: string) => dispatch({ type: "remove", bookId });
    const update = (bookId: string, qty: number) =>
        dispatch({ type: "update", bookId, quantity: qty });
    const clear = () => dispatch({ type: "clear" });
    const subtotalCents = useCallback(
        () =>
            state.items.reduce((s, i) => s + i.book.priceCents * i.quantity, 0),
        [state.items]
    );

    const value = useMemo(
        () => ({ state, add, remove, update, clear, subtotalCents }),
        [state, subtotalCents]
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
