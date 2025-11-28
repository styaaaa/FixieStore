import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  addCartItem,
  clearCartItems,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/repositories/cartRepository";
import type { CartItem } from "@/types/cart";
import { useAuth } from "./auth-context";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setCartLoading(true);
    try {
      const items = await getCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error("Failed to refresh cart", error);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refreshCart();
  }, [authLoading, refreshCart]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) {
        throw new Error("Silakan masuk untuk menambahkan ke keranjang");
      }

      await addCartItem(user.id, productId, quantity);
      await refreshCart();
    },
    [refreshCart, user]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      await removeCartItem(cartItemId);
      await refreshCart();
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity < 1) return;
      await updateCartItemQuantity(cartItemId, quantity);
      await refreshCart();
    },
    [refreshCart]
  );

  const clearCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    await clearCartItems(user.id);
    await refreshCart();
  }, [refreshCart, user]);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart,
    }),
    [addToCart, cartCount, cartItems, cartLoading, clearCart, refreshCart, removeFromCart, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
