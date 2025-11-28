import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";

interface CartContextType {
  cartCount: number;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = useCallback(async (productId: string) => {
    console.debug("addToCart", productId);
    setCartCount((prev) => prev + 1);
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    console.debug("removeFromCart", productId);
    setCartCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearCart = useCallback(() => {
    setCartCount(0);
  }, []);

  const value = useMemo(
    () => ({ cartCount, addToCart, removeFromCart, clearCart }),
    [cartCount, addToCart, removeFromCart, clearCart]
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
