import { loadHeaderFooter } from './utils.mjs';
import CheckoutProcess from './CheckoutProcess.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  // Load header and footer
  await loadHeaderFooter();

  // pass the localStorage key and the output selector for the order summary
  const checkoutProcess = new CheckoutProcess('so-cart', '.order-summary');
  checkoutProcess.init();

  // Attach event listener to the checkout form
  const form = document.getElementById('checkout-form');
  if (form) {
    // recalculate totals when zip code is provided
    form.zip.addEventListener('change', () => {
      checkoutProcess.calculateOrderTotal();
    });
    
    // Listen for form submission
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      // Ensure order totals are calculated before checkout
      checkoutProcess.calculateOrderTotal();
      try {
        const result = await checkoutProcess.checkout(form);
        console.log('Checkout result:', result);
        // Handle success
        alert('Order submitted successfully!');
      } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your order.');
      }
    });
  }
});
