import React from 'react';

import Icon from '../Icons/Icon';
import { useCart } from '../../context/cartContext';

import * as styles from './RemoveItem.module.css';

const RemoveItem = ({ productId }) => {
  const { removeFromCart } = useCart();

  const handleClick = () => {
    removeFromCart(productId);
  };

  return (
    <div className={styles.root} onClick={handleClick} role="button" tabIndex={0}>
      <Icon symbol={'cross'} />
    </div>
  );
};

export default RemoveItem;