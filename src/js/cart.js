import { getLocalStorage, setLocalStorage } from './utils.mjs';

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

function updateCartQuantity(productId, newQuantity) {
  let cartItems = getLocalStorage('so-cart') || [];
  const updatedCart = cartItems.map(item => {
    if (String(item.Id) === String(productId)) {
      return { ...item, quantity: newQuantity };
    }
    return item;
  }).filter(item => item.quantity > 0);
  
  setLocalStorage('so-cart', updatedCart);
}

function removeCartItem(productId) {
  let cartItems = getLocalStorage('so-cart') || [];
  const updatedCart = cartItems.filter(item => String(item.Id) !== String(productId));
  setLocalStorage('so-cart', updatedCart);
  renderCartContents();
}

function renderCartContents() {
  const cartItems = getLocalStorage('so-cart') || [];
  const cartList = document.querySelector('.product-list');
  const cartFooter = document.querySelector('.cart-footer');

  if (!cartItems.length) {
    cartList.innerHTML = '<p>Your cart is empty.</p>';
    if (cartFooter) cartFooter.classList.add('hide');
    return;
  }

  cartList.innerHTML = cartItems.map(cartItemTemplate).join('');

  const removeButtons = document.querySelectorAll('.cart-card__remove');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.id;
      removeCartItem(productId);
    });
  });

  const total = cartItems.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    return sum + (item.FinalPrice * quantity);
  }, 0).toFixed(2);

  if (cartFooter) {
    cartFooter.querySelector('.cart-total').textContent = `Total: $${total}`;
    cartFooter.classList.remove('hide');
  }

  const quantityInputs = document.querySelectorAll('.cart-card__quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', function () {
      const newQuantity = parseInt(this.value, 10);
      const productId = this.dataset.id;
      
      if (newQuantity < 1) {
        this.value = 1;
        return;
      }
      
      updateCartQuantity(productId, newQuantity);
      renderCartContents();
    });
  });
}

renderCartContents();
