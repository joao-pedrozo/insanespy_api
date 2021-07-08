import { Request, Response } from "express";

import Store from "../models/store";
import Product from "../models/product";
import { hasPassedOneDay } from "../utils/date";
import {
  ShopifyProductInterface,
  StoredProductInterface,
} from "../interfaces/product";
import { StoredStore } from "../interfaces/store";

import fetch from "node-fetch";

class StoreControler {
  async add(request: Request, response: Response) {
    const name = request.body.name;
    const url = request.body.url;

    if (!name) {
      response.status(400).json("Store name not provided.");
      return;
    }

    if (!url) {
      response.status(400).json("Store URL not provided.");
      return;
    }

    const fetchResponse = await fetch(
      "https://theoodie.myshopify.com/products.json?limit=250",
      {
        method: "GET",
      }
    );

    const { products } = await fetchResponse.json();

    const store = new Store({
      name,
      url,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const productsWithRecentUpdates = products.filter(
      (product: ShopifyProductInterface) => {
        if (!hasPassedOneDay(product.updated_at)) return product;
      }
    );

    const savedStore = await store.save();

    const insertableProducts = productsWithRecentUpdates.map(
      (product: ShopifyProductInterface) => {
        return {
          shopifyId: product.id,
          storeId: savedStore._id,
          createdAt: new Date(),
          createdAtShopify: product.created_at,
          image: product.images[0].src,
          updatedAt: new Date(),
          firstRegisteredUpdateAtShopify: product.updated_at,
          registeredUpdates: [],
        };
      }
    );

    Product.collection.insert(insertableProducts, (err, docs) => {
      if (err) {
        console.log("ERRO " + err);
      } else {
        console.log("Sucess, length: " + docs.insertedCount);
      }
    });

    response.status(200).json("");
  }

  async addNewProducts(
    store: StoredStore,
    products: [ShopifyProductInterface],
    storedProducts: [StoredProductInterface]
  ) {
    const productsWithRecentUpdates = products.filter((product) => {
      if (!hasPassedOneDay(product.updated_at)) return product;
    });

    const newProducts = productsWithRecentUpdates.filter((product) => {
      storedProducts.forEach((storedProduct) => {
        if (product.id === storedProduct.shopifyId) {
          return;
        }
      });
      return product;
    });

    const insertableProducts = newProducts.map((product) => {
      return {
        shopifyId: product.id,
        storeId: store._id,
        createdAt: new Date(),
        createAtShopify: product.created_at,
        image: product.images[0].src,
        updatedAt: new Date(),
        firstRegisteredUpdateAtShopify: product.updated_at,
        registeredUpdates: [],
      };
    });

    // Product.collection.insert(insertableProducts, (err, docs) => {
    //   if (err) {
    //     console.log("ERRO " + err);
    //   } else {
    //     console.log("Sucess, length: " + docs.insertedCount);
    //   }
    // });
  }

  async verifyAndUpdateProducts(
    store: StoredStore,
    products: [ShopifyProductInterface],
    storedProducts: [StoredProductInterface]
  ) {}
}

export default StoreControler;
