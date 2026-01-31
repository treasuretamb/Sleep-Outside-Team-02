import { getLocalStorage } from './utils.mjs';
import ExternalServices from './ExternalServices.mjs';

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key; 
    this.outputSelector = outputSelector; 
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.externalServices = new ExternalServices();
  }

  init() {
    // Retrieve cart items from localStorage and calculate the subtotal
    this.list = getLocalStorage(this.key);
    if (this.list.length === 0) {
      this.showError('Your cart is empty. Please add items before checkout.');
      return false;
    }
    this.calculateItemSubTotal();
    this.calculateOrderTotal();
    return true;
  }

  calculateItemSubTotal() {
    // Calculate subtotal from cart items
    this.itemTotal = this.list.reduce((acc, item) => {
      const quantity = item.quantity || 1;
      return acc + (parseFloat(item.FinalPrice) || 0) * quantity;
    }, 0);
    
    const subtotalEl = document.querySelector(`${this.outputSelector} #subtotal`);
    if (subtotalEl) {
      subtotalEl.innerText = `$${this.itemTotal.toFixed(2)}`;
    }
  }

  calculateOrderTotal() {
    // Calculate tax (assuming 6%)
    this.tax = this.itemTotal * 0.06;
    
    // Calculate shipping: $10 for the first item plus $2 for each additional item
    const totalItems = this.list.reduce((acc, item) => acc + (item.quantity || 1), 0);
    this.shipping = totalItems > 0 ? 10 + (totalItems - 1) * 2 : 0;
    
    // Calculate final order total
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxEl = document.querySelector(`${this.outputSelector} #tax`);
    const shippingEl = document.querySelector(`${this.outputSelector} #shipping`);
    const totalEl = document.querySelector(`${this.outputSelector} #orderTotal`);
    
    if (taxEl) taxEl.innerText = `$${this.tax.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = `$${this.shipping.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  packageItems(items) {
    // Convert cart items from localStorage into an array
    return items.map(item => ({
      id: item.Id,
      name: item.Name,
      price: item.FinalPrice,
      quantity: item.quantity || 1
    }));
  }

  formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const convertedJSON = {};
    formData.forEach((value, key) => {
      convertedJSON[key] = value;
    });
    return convertedJSON;
  }

  validateForm(formElement) {
    const requiredFields = ['fname', 'lname', 'street', 'city', 'state', 'zip', 'cardNumber', 'expiration', 'code'];
    const errors = [];

    requiredFields.forEach(field => {
      const input = formElement.querySelector(`[name="${field}"]`);
      if (!input || !input.value.trim()) {
        errors.push(`${field} is required`);
        input?.classList.add('error');
      } else {
        input?.classList.remove('error');
      }
    });

    // Validate credit card format (basic)
    const cardNumber = formElement.querySelector('[name="cardNumber"]');
    if (cardNumber && cardNumber.value) {
      const cardRegex = /^\d{16}$/;
      if (!cardRegex.test(cardNumber.value.replace(/\s/g, ''))) {
        errors.push('Credit card number must be 16 digits');
        cardNumber.classList.add('error');
      }
    }

    // Validate expiration date
    const expiration = formElement.querySelector('[name="expiration"]');
    if (expiration && expiration.value) {
      const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expRegex.test(expiration.value)) {
        errors.push('Expiration date must be in MM/YY format');
        expiration.classList.add('error');
      }
    }

    // Validate security code
    const securityCode = formElement.querySelector('[name="code"]');
    if (securityCode && securityCode.value) {
      const codeRegex = /^\d{3,4}$/;
      if (!codeRegex.test(securityCode.value)) {
        errors.push('Security code must be 3 or 4 digits');
        securityCode.classList.add('error');
      }
    }

    return errors;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      background-color: #ff6b6b;
      color: white;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    `;
    errorDiv.textContent = message;
    
    const form = document.querySelector(this.outputSelector)?.parentElement || document.body;
    form.insertAdjacentElement('afterbegin', errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
      background-color: #51cf66;
      color: white;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    `;
    successDiv.textContent = message;
    
    const form = document.querySelector(this.outputSelector)?.parentElement || document.body;
    form.insertAdjacentElement('afterbegin', successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }

  async checkout(formElement) {
    // Validate form
    const errors = this.validateForm(formElement);
    if (errors.length > 0) {
      this.showError(errors.join(', '));
      return null;
    }

    // Convert form data to JSON object
    const orderData = this.formDataToJSON(formElement);
    
    // Populate additional order details
    orderData.orderDate = new Date().toISOString();
    orderData.items = this.packageItems(this.list);
    orderData.orderTotal = this.orderTotal.toFixed(2);
    orderData.shipping = this.shipping;
    orderData.tax = this.tax.toFixed(2);
    orderData.subtotal = this.itemTotal.toFixed(2);
    
    console.log('Submitting order:', orderData);
    
    try {
      const result = await this.externalServices.checkoutOrder(orderData);
      console.log('Checkout result:', result);
      
      // Clear cart on success
      localStorage.removeItem(this.key);
      
      this.showSuccess('Order submitted successfully! Redirecting...');
      
      // Redirect to confirmation page or home after 3 seconds
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 3000);
      
      return result;
    } catch (error) {
      console.error('Checkout error:', error);
      this.showError(`Checkout failed: ${error.message}. Please try again.`);
      throw error;
    }
  }
}