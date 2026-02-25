import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import type { Book } from "../types/book";
import cartService from "../services/cartService";
import bookService from "../services/bookService";
import { useAuth } from "./AuthContext";

export type CartItem = {
    id?: string | number;
    book: Book;
    quantity: number;
};

type State = {
    items: CartItem[];
    isLoading: boolean;
};

type Action =
    | { type: "set"; items: CartItem[] }
    | { type: "add"; book: Book; quantity?: number }
    | { type: "remove"; bookId: string | number }
    | { type: "update"; bookId: string | number; quantity: number }
    | { type: "clear" }
    | { type: "setLoading"; isLoading: boolean };

const initialState: State = { items: [], isLoading: false };

function cartReducer(state: State, action: Action): State {
    switch (action.type) {
        case "set":
            return {
                ...state,
                items: action.items,
            };
        case "add": {
            const exists = state.items.find(
                (i) => i.book.id === action.book.id,
            );
            if (exists) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.book.id === action.book.id
                            ? {
                                  ...i,
                                  quantity: i.quantity + (action.quantity ?? 1),
                              }
                            : i,
                    ),
                };
            }
            return {
                ...state,
                items: [
                    ...state.items,
                    { book: action.book, quantity: action.quantity ?? 1 },
                ],
            };
        }
        case "remove":
            return {
                ...state,
                items: state.items.filter((i) => i.book.id !== action.bookId),
            };
        case "update":
            return {
                ...state,
                items: state.items.map((i) =>
                    i.book.id === action.bookId
                        ? { ...i, quantity: action.quantity }
                        : i,
                ),
            };
        case "clear":
            return { ...state, items: [] };
        case "setLoading":
            return { ...state, isLoading: action.isLoading };
        default:
            return state;
    }
}

const CartContext = createContext<{
    state: State;
    add: (book: Book, qty?: number) => Promise<void>;
    remove: (bookId: string | number) => Promise<void>;
    update: (bookId: string | number, qty: number) => Promise<void>;
    clear: () => Promise<void>;
    refreshCart: () => Promise<void>;
    subtotalCents: () => number;
} | null>(null);

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    // Load cart from backend or localStorage on mount
    useEffect(() => {
        // Wait for auth to finish loading before loading cart
        if (authLoading) {
            return;
        }

        const loadCart = async () => {
            console.log("[Cart] Loading cart from backend...");
            // Try to load from backend for all users (authenticated and guest)
            try {
                dispatch({ type: "setLoading", isLoading: true });
                const cart = await cartService.getCart();
                console.log("[Cart] ✅ Cart loaded from backend:", {
                    itemCount: cart.items.length,
                });

                // Fetch full book details for each cart item
                const itemsWithBooks = await Promise.all(
                    cart.items.map(async (item) => {
                        try {
                            const book = await bookService.getBookById(
                                String(item.bookId),
                            );
                            return {
                                id: item.id,
                                book: book,
                                quantity: item.quantity,
                            } as CartItem;
                        } catch (error) {
                            console.error(
                                `Failed to fetch book ${item.bookId}:`,
                                error,
                            );
                            return null;
                        }
                    }),
                );

                // Filter out failed book fetches
                const items = itemsWithBooks.filter((item) => item !== null);

                dispatch({ type: "set", items });
            } catch (error) {
                console.error("Failed to load cart from backend:", error);
                // Fall back to localStorage if backend fails
                loadLocalCart();
            } finally {
                dispatch({ type: "setLoading", isLoading: false });
            }
        };

        const loadLocalCart = () => {
            try {
                const raw = localStorage.getItem("cart");
                if (raw) {
                    const data = JSON.parse(raw);
                    dispatch({ type: "set", items: data.items || [] });
                }
            } catch (e) {
                console.warn("Failed to read persisted cart", e);
            }
        };

        loadCart();
    }, [isAuthenticated, authLoading]);

    // Persist to localStorage for unauthenticated users
    useEffect(() => {
        if (!isAuthenticated) {
            try {
                localStorage.setItem("cart", JSON.stringify(state));
            } catch (e) {
                console.warn("Failed to persist cart", e);
            }
        }
    }, [state, isAuthenticated]);

    // Refresh cart from backend for all users
    const refreshCart = useCallback(async () => {
        try {
            dispatch({ type: "setLoading", isLoading: true });
            const cart = await cartService.getCart();

            // Fetch full book details for each cart item
            const itemsWithBooks = await Promise.all(
                cart.items.map(async (item) => {
                    try {
                        const book = await bookService.getBookById(
                            String(item.bookId),
                        );
                        return {
                            id: item.id,
                            book: book,
                            quantity: item.quantity,
                        } as CartItem;
                    } catch (error) {
                        console.error(
                            `Failed to fetch book ${item.bookId}:`,
                            error,
                        );
                        return null;
                    }
                }),
            );

            // Filter out failed book fetches
            const items = itemsWithBooks.filter((item) => item !== null);

            dispatch({ type: "set", items });
        } catch (error) {
            console.error("Failed to refresh cart:", error);
            toast.error("Failed to refresh cart");
        } finally {
            dispatch({ type: "setLoading", isLoading: false });
        }
    }, []);

    const add = useCallback(async (book: Book, qty = 1) => {
        console.log("[Cart] Adding item:", {
            bookId: book.id,
            title: book.title,
            quantity: qty,
        });

        // Optimistic update - immediately update local state for all users
        dispatch({ type: "add", book, quantity: qty });
        toast.success(`Added ${book.title} to cart`);

        // Sync to backend for all users (guest and authenticated)
        try {
            await cartService.addToCart(book.id, qty);
            console.log("[Cart] ✅ Item synced to backend successfully");
            // No need to refresh - optimistic update already has correct data
        } catch (error) {
            console.error("[Cart] ❌ Failed to sync cart to backend:", error);
            // Keep the local state - user can continue shopping
        }
    }, []);

    const remove = useCallback(
        async (bookId: string | number) => {
            // Optimistic update - immediately update local state for all users
            dispatch({ type: "remove", bookId });
            toast.success("Item removed from cart");

            // Sync to backend for all users (guest and authenticated)
            try {
                // Find the cart item ID
                const item = state.items.find((i) => i.book.id === bookId);
                if (item?.id) {
                    await cartService.removeFromCart(item.id);
                    // No need to refresh - optimistic update already has correct data
                }
            } catch (error) {
                console.error("Failed to sync cart to backend:", error);
                // Keep the local state - user can continue shopping
            }
        },
        [state.items],
    );

    const update = useCallback(
        async (bookId: string | number, qty: number) => {
            // Optimistic update - immediately update local state for all users
            dispatch({ type: "update", bookId, quantity: qty });

            // Sync to backend for all users (guest and authenticated)
            try {
                // Find the cart item ID
                const item = state.items.find((i) => i.book.id === bookId);
                if (item?.id) {
                    await cartService.updateCartItem(item.id, qty);
                    // No need to refresh - optimistic update already has correct data
                }
            } catch (error) {
                console.error("Failed to sync cart to backend:", error);
                // Keep the local state - user can continue shopping
            }
        },
        [state.items],
    );

    const clear = useCallback(async () => {
        // Optimistic update - immediately clear local state for all users
        dispatch({ type: "clear" });
        toast.success("Cart cleared");

        // Sync to backend for all users (guest and authenticated)
        try {
            const cart = await cartService.getCart();
            await cartService.clearCart(cart);
        } catch (error) {
            console.error("Failed to sync cart to backend:", error);
            // Local state already cleared - user can continue shopping
        }
    }, []);

    const subtotalCents = useCallback(
        () =>
            state.items
                .filter((i) => i.book) // Filter out items without valid book
                .reduce(
                    (s, i) =>
                        s + Math.round((i.book.price ?? 0) * 100) * i.quantity,
                    0,
                ),
        [state.items],
    );

    const value = useMemo(
        () => ({
            state,
            add,
            remove,
            update,
            clear,
            refreshCart,
            subtotalCents,
        }),
        [state, add, remove, update, clear, refreshCart, subtotalCents],
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
