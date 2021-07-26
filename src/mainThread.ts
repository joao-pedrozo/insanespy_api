// @ts-nocheck

import fetch from "node-fetch";

import Store from "./models/store";
import Product from "./models/product";
import StoreController from "./controllers/StoreController";

import { hasPassedOneDay } from "./utils/date";

const mainThread = async () => {
  const execute = async () => {
    console.log("Start verifying...");

    const startDate = new Date();
    const storeController = new StoreController();
    // @ts-ignore
    const products = await storeController.fetchAllStoresShopifyProducts();
    const storedProducts = await Product.find();
    const stores = await Store.find();
    const productsWithRecentUpdates = products.filter((product) => {
      if (!hasPassedOneDay(product.updated_at)) return product;
    });

    await Promise.all(
      stores.map(async (store) => {
        const remoteShopifyStoreProducts = products.filter((product) => {
          if (product.storeId.toString() === store._id.toString()) {
            return product;
          }
        });

        return storeController.addNewProducts(
          store,
          remoteShopifyStoreProducts,
          storedProducts
        );
      })
    );

    await storeController.verifyAndUpdateProducts(
      productsWithRecentUpdates,
      storedProducts
    );

    console.log(
      `Took ${(new Date().getTime() - startDate.getTime()) / 1000} seconds`
    );
  };

  setInterval(execute, 20000);
};

export default mainThread;
