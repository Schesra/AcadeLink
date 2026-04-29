import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { cartService } from '@/services/cartService';
import { useAuth } from './AuthContext';

interface CartContextValue {
  count: number;
  cartCourseIds: Set<number>;
  refresh: () => void;
}

const CartContext = createContext<CartContextValue>({ count: 0, cartCourseIds: new Set(), refresh: () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [cartCourseIds, setCartCourseIds] = useState<Set<number>>(new Set());

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setCount(0); setCartCourseIds(new Set()); return; }
    try {
      const data = await cartService.getCart();
      setCount(data.count);
      setCartCourseIds(new Set(data.items.map(i => i.course_id)));
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <CartContext.Provider value={{ count, cartCourseIds, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
