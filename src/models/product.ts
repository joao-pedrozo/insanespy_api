import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  shopifyId: { type: Number, required: true },
  storeId: { type: Schema.Types.ObjectId, ref: "Store" },
  createdAt: { type: Date },
  createdAtShopify: { type: Date, required: true },
  image: { type: String, required: false },
  title: { type: String, required: false },
  updatedAt: { type: Date },
  lastUpdatedAt: { type: Date, required: true },
  shopifyHandle: { type: String, required: true },
  totalSales: { type: Number },
});

export default mongoose.model("Product", ProductSchema);
