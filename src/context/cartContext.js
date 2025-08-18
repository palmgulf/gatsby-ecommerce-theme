import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // SSR-safe fallback
    return {
      cart: [],
      loading: false,
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
    };
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe client-side check
  const isClient = typeof window !== 'undefined';

  // Get or create cart ID and local cart (client-only)
  useEffect(() => {
    if (!isClient) return;

    let id = localStorage.getItem('cartId');
    if (!id) {
      id = (crypto?.randomUUID?.() || Math.random().toString(36).substring(2));
      localStorage.setItem('cartId', id);
    }
    setCartId(id);

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (err) {
        console.error('Error parsing stored cart', err);
      }
    }
  }, [isClient]);

  // Load from backend
  useEffect(() => {
    if (!cartId || !isClient) return;

    setLoading(true);
    fetch('https://cart-api.rough-haze-95d9.workers.dev', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Cart-Id': cartId,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cart');
        return res.json();
      })
      .then((data) => {
        const updatedCart = Array.isArray(data)
          ? data
          : Array.isArray(data.cart)
          ? data.cart
          : [];
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      })
      .catch((err) => {
        console.error('Error loading cart from backend:', err);
      })
      .finally(() => setLoading(false));
  }, [cartId, isClient]);

  // Sync cart to backend
  useEffect(() => {
    if (!cartId || !isClient) return;

    localStorage.setItem('cart', JSON.stringify(cart));
    fetch('https://cart-api.rough-haze-95d9.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cart-Id': cartId,
      },
      body: JSON.stringify(cart),
    }).catch((err) => {
      console.error('Failed to sync cart:', err);
    });
  }, [cart, cartId, isClient]);

  const addToCart = (product) => setCart((prev) => [...prev, product]);
  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
