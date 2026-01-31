import { getLocalStorage, setLocalStorage, renderListWithTemplate } from './utils.mjs';

function cartItemTemplate(item) {
  const quantity = item.quantity || 1;
  const imageSrc = item.Image || item.Images?.[0] || '/images/placeholder.jpg';
  const colorName = item.Colors?.[0]?.ColorName || 'No color specified';
  const totalPrice = (item.FinalPrice * quantity).toFixed(2);
  
  return `<li class="cart-card divider">
    <button class="cart-card__remove" data-id="${item.Id}">&times;</button>
    <a href="#" class="cart-card__image">
      <img src="${imageSrc}" alt="${item.Name}">
    </a>
    <h2 class="card__name">${item.Name}</h2>
    <p class="cart-card__color">${colorName}</p>
    <div class="cart-card__quantity-container">
      <label>
        Quantity: 
        <input 
          type="number" 
          class="cart-card__quantity-input" 
          data-id="${item.Id}" 
          value="${quantity}" 
          min="1">
      </label>
    </div>
    <p class="cart-card__price">$${totalPrice}</p>
  </li>`;
}

export default class ShoppingCart {
  constructor(cartKey, cartListElement, cartFooterElement) {
    this.cartKey = cartKey || 'so-cart';
    this.cartListElement = cartListElement;
    this.cartFooterElement = cartFooterElement;
  }

  // Retrieve cart items from localStorage
  getCartItems() {
    return getLocalStorage(this.cartKey) || [];
  }

  // Save cart items to localStorage
  saveCartItems(items) {
    setLocalStorage(this.cartKey, items);
  }

  // Render the shopping cart contents
  renderCart() {
    const cartItems = this.getCartItems();
    if (!cartItems.length) {
      this.cartListElement.innerHTML = '<p>Your cart is empty.</p>';
      if (this.cartFooterElement) this.cartFooterElement.classList.add('hide');
      return;
    }
    renderListWithTemplate(cartItemTemplate, this.cartListElement, cartItems, 'afterbegin', true);
    this.updateCartTotal(cartItems);
    this.attachEventListeners();
  }

  // Update the total price in the cart footer
  updateCartTotal(cartItems) {
    const total = cartItems.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + (item.FinalPrice * quantity);
    }, 0).toFixed(2);
    if (this.cartFooterElement) {
      const totalEl = this.cartFooterElement.querySelector('.cart-total');
      if (totalEl) {
        totalEl.textContent = `Total: $${total}`;
      }
      this.cartFooterElement.classList.remove('hide');
    }
  }

  // Attach event listeners for removal and quantity updates
  attachEventListeners() {
    const removeButtons = this.cartListElement.querySelectorAll('.cart-card__remove');
    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.dataset.id;
        this.removeItem(productId);
      });
    });

    const quantityInputs = this.cartListElement.querySelectorAll('.cart-card__quantity-input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', () => {
        const newQuantity = parseInt(input.value, 10);
        const productId = input.dataset.id;
        if (newQuantity < 1) {
          input.value = 1;
          return;
        }
        this.updateQuantity(productId, newQuantity);
      });
    });
  }

  // Remove an item from the cart
  removeItem(productId) {
    const cartItems = this.getCartItems();
    const updatedCart = cartItems.filter(item => String(item.Id) !== String(productId));
    this.saveCartItems(updatedCart);
    this.renderCart();
  }

  // Update the quantity for a given cart item
  updateQuantity(productId, newQuantity) {
    let cartItems = this.getCartItems();
    cartItems = cartItems.map(item => {
      if (String(item.Id) === String(productId)) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    this.saveCartItems(cartItems);
    this.renderCart();
  }

  // Initialize the cart
  init() {
    this.renderCart();
  }
}
