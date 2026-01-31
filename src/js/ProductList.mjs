import { renderListWithTemplate } from './utils.mjs';

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    try {
      // Fetch the product data for the given category
      const list = await this.dataSource.getData(this.category);
      console.log(`Data fetched for category ${this.category}:`, list);
      
      if (!list || list.length === 0) {
        this.listElement.innerHTML = '<p>No products found in this category.</p>';
        return;
      }
      
      // For home page, show only first 4 products
      const filteredList = this.filterList(list);
      console.log('Filtered list:', filteredList);
      
      // Render the product cards
      this.renderList(filteredList);
    } catch (error) {
      console.error('Error loading product data:', error);
      this.listElement.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
  }

  renderList(list) {
    this.listElement.innerHTML = ''; // Clear existing content
    list.forEach(product => {
      const productCard = this.productCardTemplate(product);
      this.listElement.insertAdjacentHTML('beforeend', productCard);
    });
  }

  productCardTemplate(product) {
    // Use PrimaryMedium for product listing images
    const imageSrc = product.Images?.PrimaryMedium || 
                    product.Images?.PrimarySmall || 
                    product.Image || 
                    '/images/placeholder.jpg';
    
    return `<li class="product-card">
      <a href="/product_pages/index.html?product=${product.Id}">
        <img src="${imageSrc}" alt="Image of ${product.Name}" class="product-image">
        <h3 class="card__brand">${product.Brand?.Name || product.Brand || ''}</h3>
        <h2 class="card__name">${product.Name}</h2>
        <p class="product-card__price">$${parseFloat(product.FinalPrice).toFixed(2)}</p>
      </a>
    </li>`;
  }

  filterList(list) {
    // Check if we're on the home page (no category parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    // If no category specified (home page), show only first 4 products
    if (!category && window.location.pathname.includes('index.html')) {
      return list.slice(0, 4);
    }
    // For category pages, show all products
    return list;
  }
}