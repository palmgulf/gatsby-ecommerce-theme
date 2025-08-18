import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/cartContext';
import { Link, navigate } from 'gatsby';
import Button from '../Button';
import CurrencyFormatter from '../CurrencyFormatter';
import MiniCartItem from '../MiniCartItem';
import * as styles from './MiniCart.module.css';

const MiniCart = () => {
  
  // const { cart = [], removeFromCart = () => {} } = useCart(); // Always call hook!
  const cartContext = useCart();
  const cart = cartContext?.cart || [];
  const removeFromCart = cartContext?.removeFromCart || (() => {});
  const [isClient, setIsClient] = useState(false);

  // This flag makes sure UI only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

   // 1. Ensure SSR output is IDENTICAL to initial client render:
  if (!isClient) {
    return (
      <div id="cart-items" style={{ visibility: 'hidden' }}>
        {/* Same structure: wrapping div only */}
      </div>
    );
  }

  console.log("Cart during SSR render:", cart);

  

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  return (
    <div id="cart-items" className={styles.root}>
      <div className={styles.titleContainer}>
        <h4>My Bag</h4>
      </div>
      <div className={styles.cartItemsContainer}>
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <MiniCartItem
              key={index}
              {...item}
              onRemove={() => removeFromCart(item.productId)}
            />
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryContent}>
          <div className={styles.totalContainer}>
            <span>Total (USD)</span>
            <span>
              <CurrencyFormatter amount={totalPrice} appendZero />
            </span>
          </div>
          <span className={styles.taxNotes}>
            Taxes and shipping will be calculated at checkout
          </span>
          <Button onClick={() => navigate('/cart')} level={'primary'} fullWidth>
            Checkout
          </Button>
          <div className={styles.linkContainer}>
            <Link to="/shop">continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
