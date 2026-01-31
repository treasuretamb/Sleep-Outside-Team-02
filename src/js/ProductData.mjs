export default class ProductData {
  constructor(category) {
    this.category = category;
  }

  async getData() {
    const response = await fetch(`/json/${this.category}.json`);
    if (!response.ok) {
      throw new Error('Data fetch failed');
    }
    return response.json();
  }
}
