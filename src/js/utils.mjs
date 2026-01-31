// QuerySelector wrapper
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// QuerySelectorAll wrapper
export function qsa(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

// Retrieve data from localStorage
export function getLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error parsing localStorage data:', e);
    return [];
  }
}

// Save data to localStorage
export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// Remove item from localStorage
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing from localStorage:', e);
  }
}

// Get a query parameter from the URL
export function getParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Get all query parameters as an object
export function getParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  return params;
}

// Set a listener for both touchend and click
export function setClick(selector, callback) {
  const element = qs(selector);
  if (!element) return;
  
  element.addEventListener('touchend', (event) => {
    event.preventDefault();
    callback();
  });
  element.addEventListener('click', callback);
}

// Render a list of items using a template function
export function renderListWithTemplate(templateFn, parentElement, list, position = 'beforeend', clear = true) {
  if (clear) {
    parentElement.innerHTML = '';
  }
  
  if (!Array.isArray(list) || list.length === 0) {
    parentElement.innerHTML = '<p>No items to display.</p>';
    return;
  }
  
  const htmlStrings = list.map(item => templateFn(item)).join('');
  parentElement.insertAdjacentHTML(position, htmlStrings);
}

export function renderWithTemplate(template, parentElement, data, callback) {
  if (!parentElement) return;
  
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load template from ${path}: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading template:', error);
    return `<p>Error loading content</p>`;
  }
}

// Load the header and footer
export async function loadHeaderFooter() {
  try {
    const [headerTemplate, footerTemplate] = await Promise.all([
      loadTemplate('/partials/header.html'),
      loadTemplate('/partials/footer.html')
    ]);

    const headerEl = document.getElementById('main-header');
    const footerEl = document.getElementById('main-footer');

    if (headerEl) {
      renderWithTemplate(headerTemplate, headerEl);
      updateCartCount(); // Update cart count after header loads
    }
    if (footerEl) {
      renderWithTemplate(footerTemplate, footerEl);
    }
  } catch (error) {
    console.error('Error loading header/footer:', error);
  }
}

export function updateCartCount() {
  const cart = getLocalStorage('so-cart') || [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartCountElements = document.querySelectorAll('.cart-count');
  
  cartCountElements.forEach(element => {
    element.textContent = totalItems;
    element.style.display = totalItems > 0 ? 'block' : 'none';
  });
}

// Debounce function for performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show notification
export function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#f0a868'};
    color: white;
    border-radius: 4px;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, duration);
}