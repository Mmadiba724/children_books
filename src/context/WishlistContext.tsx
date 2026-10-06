import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import wishlistService, { type WishlistItem } from "../services/wishlistService";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

export const OPEN_LOGIN_EVENT = "kb:open-login";

type WishlistContextType = {
  items: WishlistItem[];
  loading: boolean;
  error: boolean;
  count: number;
  isWishlisted: (bookId: number | string) => boolean;
  toggle: (book: { id: number | string; title: string }) => Promise<void>;
  remove: (item: WishlistItem) => Promise<void>;
  moveToCart: (item: WishlistItem) => Promise<void>;
  reload: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  // Books the user just hearted whose server response hasn't arrived yet
  const [pendingAdds, setPendingAdds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const wishlist = await wishlistService.getWishlist();
      setItems(wishlist.items);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setItems([]);
      setPendingAdds(new Set());
      setError(false);
      return;
    }
    reload();
  }, [isAuthenticated, authLoading, reload]);

  const savedIds = useMemo(
    () => new Set(items.map((i) => Number(i.bookId))),
    [items],
  );

  const isWishlisted = useCallback(
    (bookId: number | string) =>
      savedIds.has(Number(bookId)) || pendingAdds.has(Number(bookId)),
    [savedIds, pendingAdds],
  );

  const toggle = useCallback(
    async (book: { id: number | string; title: string }) => {
      if (!isAuthenticated) {
        toast("Sign in to save books to your wishlist");
        window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT));
        return;
      }

      const bookId = Number(book.id);

      if (isWishlisted(bookId)) {
        // Optimistic remove, restored if the request fails
        const previous = items;
        setItems((cur) => cur.filter((i) => Number(i.bookId) !== bookId));
        setPendingAdds((cur) => {
          const next = new Set(cur);
          next.delete(bookId);
          return next;
        });
        try {
          const wishlist = await wishlistService.removeByBook(bookId);
          setItems(wishlist.items);
          toast.success("Removed from wishlist");
        } catch (err) {
          console.error("Failed to remove from wishlist:", err);
          setItems(previous);
          toast.error("Couldn't remove it from your wishlist");
        }
        return;
      }

      setPendingAdds((cur) => new Set(cur).add(bookId));
      try {
        const wishlist = await wishlistService.addToWishlist(bookId);
        setItems(wishlist.items);
        toast.success("Saved to your wishlist");
      } catch (err) {
        console.error("Failed to add to wishlist:", err);
        toast.error("Couldn't save it to your wishlist");
      } finally {
        setPendingAdds((cur) => {
          const next = new Set(cur);
          next.delete(bookId);
          return next;
        });
      }
    },
    [isAuthenticated, isWishlisted, items],
  );

  const remove = useCallback(
    async (item: WishlistItem) => {
      const previous = items;
      setItems((cur) => cur.filter((i) => i.id !== item.id));
      try {
        const wishlist = await wishlistService.removeItem(item.id);
        setItems(wishlist.items);
        toast.success("Removed from wishlist");
      } catch (err) {
        console.error("Failed to remove wishlist item:", err);
        setItems(previous);
        toast.error("Couldn't remove it from your wishlist");
      }
    },
    [items],
  );

  const moveToCart = useCallback(
    async (item: WishlistItem) => {
      try {
        await wishlistService.moveToCart(item.id, 1);
        setItems((cur) => cur.filter((i) => i.id !== item.id));
        await refreshCart();
        toast.success(`"${item.title}" moved to your cart`);
      } catch (err) {
        console.error("Failed to move wishlist item to cart:", err);
        toast.error("Couldn't move it to your cart");
      }
    },
    [refreshCart],
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      count: items.length,
      isWishlisted,
      toggle,
      remove,
      moveToCart,
      reload,
    }),
    [items, loading, error, isWishlisted, toggle, remove, moveToCart, reload],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
