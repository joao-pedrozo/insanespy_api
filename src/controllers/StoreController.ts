import { Request, Response } from "express";
import Store from "../models/store";

import fetch from "node-fetch";

class StoreControler {
  async add(request: Request, response: Response) {
    const name = request.body.name;
    const url = request.body.url;

    const fetchResponse = await fetch(
      "https://theoodie.myshopify.com/products.json?limit=250",
      {
        method: "GET",
      }
    );

    const { products } = await fetchResponse.json();

    console.log(products);

    response.status(200).json("");
  }
}

export default StoreControler;
