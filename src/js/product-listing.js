import { loadHeaderFooter, getParam } from './utils.mjs';
import ExternalServices from './ExternalServices.mjs';
import ProductList from './ProductList.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  // Load dynamic header and footer
  await loadHeaderFooter();

  // Get the category from the URL if provided or default to tents
  const category = getParam('category') || 'tents';
  console.log('Active category:', category);

  const dataSource = new ExternalServices();

  // Get the product list container element
  const listElement = document.querySelector('.product-list');
  if (!listElement) {
    console.error('Element with class `product-list` not found');
    return;
  }

  // Create and initialize the product listing
  const productList = new ProductList(category, dataSource, listElement);
  await productList.init();
});