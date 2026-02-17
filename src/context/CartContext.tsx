import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useMemo,
    useCallback,
    useState,
} from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import type { Book } from "../types/book";
import cartService from "../services/cartService";
import authService from "../services/authService";
import bookService from "../services/bookService";

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
    const [isAuthenticated, setIsAuthenticated] = useState(
        authService.isAuthenticated(),
    );

    // Load cart from backend or localStorage on mount
    useEffect(() => {
        const loadCart = async () => {
            const authenticated = authService.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
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
                    const items = itemsWithBooks.filter(
                        (item) => item !== null,
                    );

                    dispatch({ type: "set", items });
                } catch (error) {
                    console.error("Failed to load cart from backend:", error);
                    // Fall back to localStorage for unauthenticated state
                    loadLocalCart();
                } finally {
                    dispatch({ type: "setLoading", isLoading: false });
                }
            } else {
                loadLocalCart();
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
    }, []);

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

    // Refresh cart from backend
    const refreshCart = useCallback(async () => {
        if (!authService.isAuthenticated()) {
            return;
        }

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

    const add = useCallback(
        async (book: Book, qty = 1) => {
            if (!authService.isAuthenticated()) {
                toast.error("Please sign in to add items to cart");
                return;
            }

            try {
                await cartService.addToCart(book.id, qty);
                await refreshCart();
                toast.success(`Added ${book.title} to cart`);
            } catch (error) {
                console.error("Failed to add to cart:", error);
                toast.error("Failed to add item to cart");
            }
        },
        [refreshCart],
    );

    const remove = useCallback(
        async (bookId: string | number) => {
            if (!authService.isAuthenticated()) {
                toast.error("Please sign in to manage cart");
                return;
            }

            try {
                // Find the cart item ID
                const item = state.items.find((i) => i.book.id === bookId);
                if (!item?.id) {
                    throw new Error("Cart item not found");
                }

                await cartService.removeFromCart(item.id);
                await refreshCart();
                toast.success("Item removed from cart");
            } catch (error) {
                console.error("Failed to remove from cart:", error);
                toast.error("Failed to remove item from cart");
            }
        },
        [state.items, refreshCart],
    );

    const update = useCallback(
        async (bookId: string | number, qty: number) => {
            if (!authService.isAuthenticated()) {
                toast.error("Please sign in to manage cart");
                return;
            }

            try {
                // Find the cart item ID
                const item = state.items.find((i) => i.book.id === bookId);
                if (!item?.id) {
                    throw new Error("Cart item not found");
                }

                await cartService.updateCartItem(item.id, qty);
                await refreshCart();
            } catch (error) {
                console.error("Failed to update cart:", error);
                toast.error("Failed to update cart item");
            }
        },
        [state.items, refreshCart],
    );

    const clear = useCallback(async () => {
        if (!authService.isAuthenticated()) {
            toast.error("Please sign in to manage cart");
            return;
        }

        try {
            const cart = await cartService.getCart();
            await cartService.clearCart(cart);
            dispatch({ type: "clear" });
            toast.success("Cart cleared");
        } catch (error) {
            console.error("Failed to clear cart:", error);
            toast.error("Failed to clear cart");
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
