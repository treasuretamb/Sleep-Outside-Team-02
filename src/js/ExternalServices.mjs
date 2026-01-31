const baseURL = import.meta.env.VITE_SERVER_URL || 'https://wdd330-backend.onrender.com/';

function convertToJson(res) {
  if (res.ok) return res.json();
  throw new Error('Bad Response');
}

export default class ExternalServices {
  // API endpoints constructed dynamically
  async getData(category) {
    try {
      console.log(`Fetching data for category: ${category}`);
      const response = await fetch(`${baseURL}products/search/${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await convertToJson(response);
      console.log(`Data received for ${category}:`, data);
      return data.Result || data;
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      // Fallback to local JSON files
      return this.getLocalData(category);
    }
  }

  // Fallback to local JSON files
  async getLocalData(category) {
    try {
      const response = await fetch(`/json/${category}.json`);
      const data = await convertToJson(response);
      console.log(`Using local data for ${category}`);
      return data.Result || data;
    } catch (error) {
      console.error(`Error loading local data for ${category}:`, error);
      return [];
    }
  }

  async findProductById(id) {
    try {
      // Try all categories
      const categories = ['tents', 'backpacks', 'sleeping-bags'];
      for (const category of categories) {
        const products = await this.getData(category);
        const product = products.find(p => String(p.Id) === String(id));
        if (product) {
          return product;
        }
      }
      throw new Error(`Product ${id} not found in any category`);
    } catch (error) {
      console.error('Error finding product:', error);
      return null;
    }
  }

  async checkoutOrder(orderData) {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    };
    try {
      const response = await fetch(`${baseURL}checkout`, options);
      return await convertToJson(response);
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }
}