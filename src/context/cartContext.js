import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // Safe fallback to prevent SSR crash
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

  // Generate or get existing cart ID (from localStorage)
  useEffect(() => {
    let id = localStorage.getItem('cartId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('cartId', id);
    }
    setCartId(id);

    // Restore cart from localStorage (temporary fix until backend loads)
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
      setCart(JSON.parse(storedCart));
    } catch (err) {
      console.error('Error parsing stored cart', err);
    }
    }
  }, []);

  // Load cart from backend on cartId ready
  useEffect(() => {
    if (!cartId) return;
    setLoading(true);
    fetch('https://cart-api.rough-haze-95d9.workers.dev', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-Cart-Id': cartId },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load cart');
        return res.json();
      })
      .then(data => {
      const updatedCart = Array.isArray(data)
        ? data
        : Array.isArray(data.cart)
        ? data.cart
        : [];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    })
    .catch(err => {
      console.error('Error loading cart from backend:', err);
      // Fallback: use localStorage or leave cart as-is
    })
    .finally(() => {
      setLoading(false);
    });
}, [cartId]);

  // Sync cart to backend whenever cart changes
  useEffect(() => {
    if (!cartId) return;
    localStorage.setItem('cart', JSON.stringify(cart)); // ✅ keep local copy
    fetch('https://cart-api.rough-haze-95d9.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Cart-Id': cartId },
      body: JSON.stringify(cart),
    }).catch(err => {
      console.error('Failed to sync cart:', err);
    });
  }, [cart, cartId]);

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
