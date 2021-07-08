import { Schema } from "mongoose";

interface ShopifyProductInterface {
  body_html: string;
  handle: string;
  id: number;
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
  registeredUpdates: [Date];
  _id: Schema.Types.ObjectId;
  shopifyId: number;
	createdAt: Date;
	updatedAt: Date;
	firstRegisteredUpdateAtShopify: Date;
}

export { ShopifyProductInterface, StoredProductInterface };
