import ExternalServices from './ExternalServices.mjs';
import {
  getLocalStorage,
  setLocalStorage,
  updateCartCount,
  loadHeaderFooter,
} from './utils.mjs';

// Load header and footer
loadHeaderFooter();

function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, duration);
}

const dataSource = new ExternalServices();

// Get product ID from URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product');
  console.log('Product ID from URL:', productId);
  return productId;
}

// Load product details
async function loadProductDetails() {
  const productId = getProductIdFromUrl();
  const container = document.querySelector('.product-detail');
  
  if (!productId || !container) {
    if (container) {
      container.innerHTML = '<p>Product not found. Please go back and select a product.</p>';
    }
    return;
  }
  
  try {
    container.innerHTML = '<p>Loading product details...</p>';
    
    const product = await dataSource.findProductById(productId);
    
    if (!product) {
      container.innerHTML = '<p>Product not found. It may have been removed or the link is incorrect.</p>';
      return;
    }
    
    renderProductDetails(product, container);
  } catch (error) {
    console.error('Error loading product:', error);
    container.innerHTML = '<p>Error loading product details. Please try again later.</p>';
  }
}

function renderProductDetails(product, container) {
  // Compute discount where applicable
  let discountHtml = '';
  const suggestedPrice = product.SuggestedRetailPrice || product.ListPrice;
  
  if (suggestedPrice && product.FinalPrice < suggestedPrice) {
    const discountAmount = (suggestedPrice - product.FinalPrice).toFixed(2);
    discountHtml = `<p class="discount-indicator">Save $${discountAmount} (${Math.round((discountAmount / suggestedPrice) * 100)}% off)</p>`;
  }
  
  // Get main image
  const imageSrc = product.Images?.PrimaryLarge || 
                  product.Images?.PrimaryMedium || 
                  product.Image || 
                  '/images/placeholder.jpg';
  
  container.innerHTML = `
    <h2>${product.Name}</h2>
    <img src="${imageSrc}" alt="Image of ${product.Name}" />
    <div class="product-description">${product.DescriptionHtmlSimple || product.Description || ''}</div>
    <p class="product-price">Price: <strong>$${product.FinalPrice.toFixed(2)}</strong></p>
    ${discountHtml}
    <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
  `;

  document.querySelector('#addToCart').addEventListener('click', () => addToCart(product));
}

function addToCart(product) {
  let cart = getLocalStorage('so-cart') || [];
  let existingItem = cart.find(item => String(item.Id) === String(product.Id));
  
  if (existingItem) {
    // Increment quantity if item already exists
    existingItem.quantity = (existingItem.quantity || 1) + 1;
    showToast(`Added another ${product.Name} to cart (${existingItem.quantity} total)`);
  } else {
    // Add new item with quantity
    product.quantity = 1;
    cart.push(product);
    showToast(`${product.Name} added to cart!`);
  }
  
  setLocalStorage('so-cart', cart);
  updateCartCount();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProductDetails);
} else {
  loadProductDetails();
}