import { Schema } from "mongoose";

interface ShopifyProductInterface {
  body_html: string;
  handle: string;
  id: number;
  title: string;
  images: [
    {
      id: number;
      created_at: string;
      height: number;
      position: number;
      product_id: number;
      src: string;
      updated_at: string;
      variant_ids: [];
      width: number;
    }
  ];
  created_at: Date;
  updated_at: Date;
}

interface StoredProductInterface {
  _id: Schema.Types.ObjectId;
  title: string;
  shopifyId: number;
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedAt: Date;
  totalSales: number;
  firstRegisteredUpdateAtShopify: Date;
}

export { ShopifyProductInterface, StoredProductInterface };
