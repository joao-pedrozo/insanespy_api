// @ts-nocheck

import { Request, Response } from "express";
import fetch from "node-fetch";

import Store from "../models/store";
import Product from "../models/product";
import { hasPassedOneDay, formatDate } from "../utils/date";
import { extractHostname } from "../utils/url";
import {
  ShopifyProductInterface,
  StoredProductInterface,
} from "../interfaces/product";
import { StoredStore } from "../interfaces/store";

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

    const sanitizedUrl = extractHostname(url);

    if (findStoreWithSameName) {
      response.status(400).json("A store with this name is already registered");
      return;
    }

    const findStoreWithSameUrl = await Store.findOne({ sanitizedUrl });

    if (findStoreWithSameUrl) {
      response.status(400).json("A store with this URL is already registered");
      return;
    }

    try {
      const { products, pagesNumber } = await this.fetchForTheFirstTime(
        sanitizedUrl
      );

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
        sanitizedUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        productPagesToFetch: pagesNumber,
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
    // Filter all products getting only the ones with a update in the last 24h
    const productsWithRecentUpdates = products.filter((product) => {
      if (!hasPassedOneDay(product.updated_at)) return product;
    });

    // Filter recent products to find the ones which are not registered in the database
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
        image: product.images[0]?.src,
        title: product.title,
        lastUpdatedAt: product.updated_at,
        shopifyHandle: product.handle,
        totalSales: 1,
        updatedAt: new Date(),
      };
    });

    if (insertableProducts.length) {
      // @ts-ignore
      await Product.insertMany(insertableProducts, (err, docs) => {
        if (err) {
          console.log("Error on insert many " + err);
        } else {
          console.log("Sucess on insert many " + docs);
        }
      });

      return;
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
        const hasRecentUpdates =
          new Date(
            findFetchedProductWithSameShopifyId?.updated_at
          ).getTime() !== new Date(storedProduct.lastUpdatedAt).getTime();
        if (hasRecentUpdates) {
          await Product.findByIdAndUpdate(
            storedProduct._id,
            {
              $inc: {
                totalSales: 1,
              },
              $set: {
                lastUpdatedAt: findFetchedProductWithSameShopifyId?.updated_at,
              },
            },
            (error, doc) => {
              if (error) {
                console.log("Error on updating product: " + error.message);
              } else {
                console.log("======");
                console.log(`Sucess on registering new updates:`);
                // @ts-ignore
                console.log(`Product title: ${doc.title}`);
              }
            }
          );
          return;
        }
      }
    });
  }

  async findStores(request: Request, response: Response) {
    const stores = await Store.find();

    const formatedStores = await Promise.all(
      stores.map(async (store) => {
        const storeProducts = await Product.find({ storeId: store._id });

        const lastSale = storeProducts.reduce((accumulator, product) => {
          if (new Date(product.lastUpdatedAt).getTime() > accumulator) {
            return product.lastUpdatedAt;
          } else {
            return accumulator;
          }
        }, 0);

        const totalSales = storeProducts.reduce((accumulator, product) => {
          return accumulator + product.totalSales;
        }, 0);

        return {
          // @ts-ignore
          ...store._doc,
          lastSale,
          totalSales: totalSales,
          // @ts-ignore
          formatedCreatedAt: formatDate(store._doc.createdAt),
        };
      })
    );

    response.status(200).json(formatedStores);
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

  async fetchAllStoresShopifyProducts() {
    let products = [];

    const stores = await Store.find();
    const promises = stores.reduce((accumulator, store) => {
      return [
        ...accumulator,
        ...Array.from(new Array(store.productPagesToFetch)).map(
          async (_, index) => {
            try {
              const response = await fetch(
                `${store.url}/products.json?limit=250&page=${index + 1}`
              );

              const { products: fetchedProducts } = await response.json();
              if (fetchedProducts.length) {
                const fetchedProductsWithStoreId = fetchedProducts.map(
                  (product) => Object.assign(product, { storeId: store._id })
                );
                products = [...products, ...fetchedProductsWithStoreId];
              }
            } catch (err) {
              console.log(`Error on fetching ${store.url}: ${err}`);
            }
          }
        ),
      ];
    }, []);

    await Promise.all(promises);
    return products;
  }

  async fetchForTheFirstTime(url) {
    let products = [];

    await Promise.all(
      Array.from(new Array(25)).map(async (_, index) => {
        try {
          const response = await fetch(
            `${url}/products.json?limit=250&page=${index + 1}`
          );

          const { products: fetchedProducts } = await response.json();
          products = [...products, ...fetchedProducts];
        } catch (err) {
          console.log(err);
        }
      })
    );

    return {
      products,
      pagesNumber: Number(String(products.length / 250).split(".")[0]) + 1,
    };
  }

  async delete(request: Request, response: Response) {
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
    // @ts-ignore
    Store.findOneAndRemove({ _id: id }, function (err, doc) {
      // @ts-ignore
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
