import ProductList from './ProductList.mjs';
import { loadHeaderFooter, updateCartCount } from './utils.mjs';
import ExternalServices from './ExternalServices.mjs';

// Load header and footer
loadHeaderFooter();

// Initialize product list for home page
async function initHomePage() {
  try {
    const dataSource = new ExternalServices();
    const listElement = document.querySelector('.product-list');
    
    if (listElement) {
      const productList = new ProductList('tents', dataSource, listElement);
      await productList.init();
    }
    
    updateCartCount();
  } catch (error) {
    console.error('Error initializing home page:', error);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}