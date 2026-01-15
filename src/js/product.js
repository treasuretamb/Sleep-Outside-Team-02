import { setLocalStorage, getLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  // 1. Get the current cart array from storage
  let cart = getLocalStorage("so-cart");

  // 2. If it's the first item, cart will be null. Initialize as empty array.
  if (!Array.isArray(cart)) {
    cart = [];
  }

  // 3. Add the new product to the array
  cart.push(product);

  // 4. Save the updated array back to local storage
  setLocalStorage("so-cart", cart);
}

// Handler for the click event
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// Add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
