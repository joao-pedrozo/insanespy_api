import { Request, Response } from "express";

import Store from "../models/store";
import Product from "../models/product";
import { hasPassedOneDay, formatDate } from "../utils/date";
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
      // storedProducts.forEach((storedProduct) => {
      //   if (product.id === storedProduct.shopifyId) {
      //     return;
      //   }
			// });
			const productWithSameId = storedProducts.find(storedProduct => storedProduct.shopifyId === product.id);

			if(!productWithSameId) return product;

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
    products: [ShopifyProductInterface],
    storedProducts: [StoredProductInterface]
  ) {
		const productsWithRecentUpdates = products.filter((product) => {
      if (!hasPassedOneDay(product.updated_at)) return product;
		});
		
		storedProducts.forEach(async (storedProduct, i) => { 
			const findProduct = productsWithRecentUpdates.find(async product => storedProduct.shopifyId === product.id);

			if(!storedProduct.registeredUpdates.length) {
				if(storedProduct.firstRegisteredUpdateAtShopify !== findProduct?.updated_at) {
					await Product.findByIdAndUpdate(
						storedProduct._id, 
						{ $push: { registeredUpdates: findProduct?.updated_at } }, 
						(error, success) => {
							if(error) {
								console.log('Error on updating product: ' + error.message);
							} else {
								console.log('Sucess on registering new update: '+ success);
							}
						}
					);
				}
			} else {
				const lastRegisteredUpdatedAt = storedProduct.registeredUpdates[storedProduct.registeredUpdates.length - 1];
				const updatedAtHasChanged = formatDate(findProduct.updated_at) !== formatDate(lastRegisteredUpdatedAt);

				console.log(updatedAtHasChanged);

				if(updatedAtHasChanged) {
					await Product.findByIdAndUpdate(
						storedProduct._id, 
						{ $push: { registeredUpdates: findProduct?.updated_at } }, 
						(error, success) => {
							if(error) {
								console.log('Error on updating product: ' + error.message);
							} else {
								console.log('Sucess on registering new update: '+ success);
							}
						}
					);
				}
			}
		})
	}
}

export default StoreControler;
