export default class ProductData {
  constructor(category) {
    this.category = category;
  }

<<<<<<< HEAD
  async getData() {
    const response = await fetch(`/json/${this.category}.json`);
    if (!response.ok) {
      throw new Error('Data fetch failed');
    }
    return response.json();
=======
  getData() {
    return fetch(this.path)
      .then(convertToJson)
      .then((data) => data);
  }

  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
>>>>>>> 4fb1d0260872a80a9ba99108a0776899d89798ae
  }
}