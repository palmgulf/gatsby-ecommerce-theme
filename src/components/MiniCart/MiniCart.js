import { Link, navigate } from 'gatsby';
import React from 'react';
import { useCart } from '../../context/cartContext';
import { useEffect } from 'react';
import Button from '../Button';
import CurrencyFormatter from '../CurrencyFormatter';
import MiniCartItem from '../MiniCartItem';

import * as styles from './MiniCart.module.css';

const MiniCart = (props) => {
  // useEffect(() => {
  //   renderCart();
  // }, []);
  const { cart, removeFromCart } = useCart();

  useEffect(() => {
  console.log("MiniCart updated:", cart);
}, [cart]);
  // calculate total price
  const totalPrice = cart.reduce(
  (acc, item) => acc + item.price * (item.quantity || 1),
  0
);
  // const sampleCartItem = {
  //   image: '/products/pdp1.jpeg',
  //   alt: '',
  //   name: 'Lambswool Crew Neck Jumper',
  //   price: 220,
  //   color: 'Anthracite Melange',
  //   size: 'xs',
  // };

  return (
    <div id="cart-items" className={styles.root}>
      <div className={styles.titleContainer}>
        <h4>My Bag</h4>
      </div>
      <div className={styles.cartItemsContainer}>
        {cart.length > 0 ? (
          cart.map((item, index) => (
  <MiniCartItem key={index} {...item} onRemove={() => removeFromCart(item.productId)} />
))

              //productId={item.productId}
              //image={item.image}
              //alt={item.alt}
              //name={item.name}
              //price={item.price}
              //color={item.color}
              //size={item.size}
              //quantity={item.quantity || 1}
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
            <Link to={'/shop'}>continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
