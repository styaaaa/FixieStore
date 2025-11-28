import { createContext, useContext, useState, ReactNode } from 'react';

interface CartContextType {
  cartCount: number;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = async (productId: string) => {
    // TODO: Implement add to cart logic with Supabase
    setCartCount(prev => prev + 1);
  };

  const removeFromCart = async (productId: string) => {
    // TODO: Implement remove from cart logic
    setCartCount(prev => Math.max(0, prev - 1));
  };

  const clearCart = () => {
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
