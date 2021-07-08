import fetch from "node-fetch";

import Store from "./models/store";
import Product from "./models/product";
import StoreController from "./controllers/StoreController";
import { StoredStore } from "./interfaces/store";

const mainThread = () => {
  const storeController = new StoreController();

  async function execute() {
    const stores: [StoredStore] = await Store.find();

    stores.forEach(async (store) => {
      const fetchResponse = await fetch(store.url, {
        method: "GET",
      });

      const { products } = await fetchResponse.json();
      const storedProducts = await Product.find({ storeId: store._id });

      storeController.addNewProducts(store, products, storedProducts);
    });
  }

  execute();
};

export default mainThread;
