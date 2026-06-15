'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Cart } from '@/types/cart';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  addItem: (productVariantId: string, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) return;
    try {
      setCart(await api.get<Cart>('/api/cart'));
    } catch {
      setCart(null);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (productVariantId: string, quantity = 1) => {
    const updated = await api.post<Cart>('/api/cart/items', { productVariantId, quantity });
    setCart(updated);
  }, []);

  const updateItem = useCallback(async (cartItemId: string, quantity: number) => {
    const updated = await api.put<Cart>(`/api/cart/items/${cartItemId}`, { quantity });
    setCart(updated);
  }, []);

  const removeItem = useCallback(async (cartItemId: string) => {
    const updated = await api.delete<Cart>(`/api/cart/items/${cartItemId}`);
    setCart(updated);
  }, []);

  const clearCart = useCallback(async () => {
    await api.delete('/api/cart');
    setCart(prev => prev ? { ...prev, items: [], total: 0, itemCount: 0 } : null);
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
