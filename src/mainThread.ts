import fetch from "node-fetch";

import Store from "./models/store";
import Product from "./models/product";
import StoreController from "./controllers/StoreController";
import { StoredStore } from "./interfaces/store";

import { hasPassedOneDay, formatDate } from "./utils/date";

// temp4.products.filter(product => {
// 	const findProduct = temp5.products.find(product2 => product.id === product2.id);

// 	const hasUpdatedAtChanged = findProduct.updated_at !== product.updated_at;

// 	if (hasUpdatedAtChanged) {
// 		console.log(product);
// 		return product;
// 	};
//  })

const mainThread = async () => {
  const execute = async () => {
    const storeController = new StoreController();

    const stores: [StoredStore] = await Store.find();

    stores.forEach(async (store) => {
      const fetchResponse = await fetch(store.url, {
        method: "GET",
      });

      const { products } = await fetchResponse.json();
      const storedProducts = await Product.find({ storeId: store._id });

      const productsWithRecentUpdates = products.filter((product) => {
        if (!hasPassedOneDay(product.updated_at)) return product;
      });

      await storeController.addNewProducts(store, products, storedProducts);

      await storeController.verifyAndUpdateProducts(
        productsWithRecentUpdates,
        storedProducts
      );
    });
  };

  setInterval(execute, 10000);
};

export default mainThread;
