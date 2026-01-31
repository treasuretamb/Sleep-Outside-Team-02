import { loadHeaderFooter } from './utils.mjs';
import ShoppingCart from './ShoppingCart.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  // Load header and footer
  await loadHeaderFooter();

  const cartListElement = document.querySelector('.product-list');
  const cartFooterElement = document.querySelector('.cart-footer');
  if (!cartListElement) {
    console.error('Cart list element not found');
    return;
  }
  const shoppingCart = new ShoppingCart('so-cart', cartListElement, cartFooterElement);
  shoppingCart.init();
});
