import { Link, navigate } from 'gatsby';
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/cartContext';
import Button from '../Button';
import CurrencyFormatter from '../CurrencyFormatter';
import MiniCartItem from '../MiniCartItem';

import * as styles from './MiniCart.module.css';

const MiniCart = () => {
  // ✅ Always call hooks at top level
  const { cart, removeFromCart } = useCart();
  const [isClient, setIsClient] = useState(false);

  // ✅ Set client flag once mounted
  useEffect(() => {
    setIsClient(true);
    console.log('MiniCart updated:', cart);
  }, [cart]);

  // ✅ Prevent rendering on the server
  if (!isClient) return null;

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
