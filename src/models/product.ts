import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  shopifyId: { type: String, required: true },
  createdAt: { type: Date, required: true },
  createAtShopify: { type: Date, required: true },
  image: { type: String, required: false },
  updatedAt: { type: Date, required: true },
  firstUpdateAtShopify: { type: Date, required: true },
  registeredUpdates: [Date],
});

export default mongoose.model("Product", ProductSchema);
