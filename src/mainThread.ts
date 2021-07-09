import fetch from "node-fetch";

import Store from "./models/store";
import Product from "./models/product";
import StoreController from "./controllers/StoreController";

import { hasPassedOneDay } from "./utils/date";

const mainThread = async () => {
  const execute = async () => {
    const storeController = new StoreController();

    const stores = await Store.find();

    stores.forEach(async (store) => {
      // @ts-ignore
      const fetchResponse = await fetch(store.url, {
        method: "GET",
      });

      const { products } = await fetchResponse.json();
      const storedProducts = await Product.find({ storeId: store._id });

      const productsWithRecentUpdates = products.filter((product) => {
        if (!hasPassedOneDay(product.updated_at)) return product;
      });

      // @ts-ignore
      await storeController.addNewProducts(store, products, storedProducts);

      // @ts-ignore
      await storeController.verifyAndUpdateProducts(
        productsWithRecentUpdates,
        // @ts-ignore
        storedProducts
      );
    });
  };

  setInterval(execute, 10000);
};

export default mainThread;
