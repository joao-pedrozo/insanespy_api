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

    const findStoreWithSameName = await Store.findOne({ name });

    if (findStoreWithSameName) {
      response.status(400).json("A store with this name is already registered");
      return;
    }

    const findStoreWithSameUrl = await Store.findOne({ url });

    if (findStoreWithSameUrl) {
      response.status(400).json("A store with this URL is already registered");
      return;
    }

    try {
      const fetchResponse = await fetch(url, {
        method: "GET",
      });

      const { products } = await fetchResponse.json();

      if (!products) {
        response
          .status(400)
          .json(
            "There is no products recently sold in this store or is a not valid URL"
          );
        return;
      }

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
            title: product.title,
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

      response.status(200).json("Store added!");
    } catch (err) {
      console.log(err);
      response.status(400).json("Something went wrong");
    }
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
      const productWithSameId = storedProducts.find(
        (storedProduct) => storedProduct.shopifyId === product.id
      );

      if (!productWithSameId) return product;
    });

    const insertableProducts = newProducts.map((product) => {
      return {
        shopifyId: product.id,
        storeId: store._id,
        createdAt: new Date(),
        createdAtShopify: product.created_at,
        image: product.images[0].src,
        title: product.title,
        updatedAt: new Date(),
        firstRegisteredUpdateAtShopify: product.updated_at,
        registeredUpdates: [],
      };
    });

    if (insertableProducts.length) {
      // @ts-ignore
      Product.insertMany(insertableProducts, (err, docs) => {
        if (err) {
          console.log("Error on insert many " + err);
        } else {
          console.log("Sucess on insert many " + docs);
        }
      });
    }
  }

  async verifyAndUpdateProducts(
    productsWithRecentUpdates: [ShopifyProductInterface],
    storedProducts: [StoredProductInterface]
  ) {
    storedProducts.forEach(async (storedProduct) => {
      const findFetchedProductWithSameShopifyId =
        productsWithRecentUpdates.find(
          (product) => product.id === storedProduct.shopifyId
        );

      if (findFetchedProductWithSameShopifyId) {
        if (!storedProduct.registeredUpdates.length) {
          if (
            new Date(
              findFetchedProductWithSameShopifyId?.updated_at
            ).getTime() !==
            new Date(storedProduct.firstRegisteredUpdateAtShopify).getTime()
          ) {
            await Product.findByIdAndUpdate(
              storedProduct._id,
              {
                $addToSet: {
                  registeredUpdates:
                    findFetchedProductWithSameShopifyId?.updated_at,
                },
              },
              (error, success) => {
                if (error) {
                  console.log("Error on updating product: " + error.message);
                } else {
                  console.log("Sucess on registering new update: " + success);
                }
              }
            );
          }
        } else {
          const hasRecentUpdates =
            new Date(
              findFetchedProductWithSameShopifyId?.updated_at
            ).getTime() !==
            new Date(
              storedProduct.registeredUpdates[
                storedProduct.registeredUpdates.length - 1
              ]
            ).getTime();
          if (hasRecentUpdates) {
            await Product.findByIdAndUpdate(
              storedProduct._id,
              {
                $addToSet: {
                  registeredUpdates:
                    findFetchedProductWithSameShopifyId?.updated_at,
                },
              },
              (error, doc) => {
                if (error) {
                  console.log("Error on updating product: " + error.message);
                } else {
                  console.log("======");
                  console.log(`Sucess on registering new updates:`);
                  console.log(`Product title: ${doc.title}`);
                  console.log(
                    `Last registered: ${
                      doc.registeredUpdates[doc.registeredUpdates.length - 1]
                    }`
                  );
                }
              }
            );
            return;
          }
        }
      }
    });
  }

  async findStores(request: Request, response: Response) {
    const stores = await Store.find();

    const asd = await Promise.all(
      stores.map(async (store) => {
        const storeProducts = await Product.find({ storeId: store._id });
        const amountOfRegisteredUpdates = storeProducts.reduce(
          (acc, product) => {
            return acc + product.registeredUpdates.length;
          },
          0
        );

        return {
          ...store._doc,
          amountOfRegisteredUpdates,
          formatedCreatedAt: formatDate(store._doc.createdAt),
        };
      })
    );

    response.status(200).json(asd);
  }

  async findOne(request: Request, response: Response) {
    const id = request.params.id;
    let store;

    try {
      store = await Store.findById({ _id: id });
    } catch (err) {
      console.log("Error on finding store " + err);
      return response.status(400).json("Erro ao procurar por essa loja " + err);
    }

    if (!store) {
      response.status(400).json("Nenhuma loja com esse ID foi encontrada");
      return;
    }

    const storeProducts = await Product.find({ storeId: id });

    return response.status(200).json({ store, products: storeProducts });
  }

  async delete(request: Request, response: Response) {
    const id = request.params.id;
    let store;

    try {
      store = await Store.findById({ _id: id });
    } catch (err) {
      console.log("Error on finding store " + err);
      return response.status(400).json("Insira um ID válido. " + err);
    }

    if (!store) {
      return response.status(400).json("Loja não encontrada");
    }

    Store.findOneAndRemove({ _id: id }, function (err, doc) {
      Product.deleteMany({ storeId: id }, (err, result) => {
        if (err) {
          return response.status(400).json(err);
        }

        return response.status(200).json(result);
      });
    });
  }
}

export default StoreControler;
