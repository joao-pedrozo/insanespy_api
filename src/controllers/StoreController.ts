import { Request, Response } from "express";

import Store from "../models/store";
import Product from "../models/product";
import { hasPassedOneDay, formatDate, parseDate } from "../utils/date";

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

    const productsWithRecentUpdates = products.filter((product, i) => {
      if (!hasPassedOneDay(product.updated_at)) return product;
    });

    const savedStore = await store.save();

    const insertableProducts = productsWithRecentUpdates.map((product) => {
      return {
        shopifyId: product.id,
        storeId: savedStore._id,
        createdAt: new Date(),
        createAtShopify: product.created_at,
        image: product.images[0].src,
        updatedAt: new Date(),
        firstRegisteredUpdateAtShopify: product.updated_at,
        registeredUpdates: [],
      };
    });

    Product.collection.insert(insertableProducts, (err, docs) => {
      if (err) {
        console.log("ERRO " + err);
      } else {
        console.log("Sucess, length: " + docs.insertedCount);
      }
    });

    response.status(200).json("");
  }
}

export default StoreControler;
