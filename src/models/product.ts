import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  shopifyId: { type: Number, required: true },
  storeId: { type: Schema.Types.ObjectId, ref: "Store" },
  createdAt: { type: Date },
  createAtShopify: { type: Date, required: true },
  image: { type: String, required: false },
  updatedAt: { type: Date },
  firstRegisteredUpdateAtShopify: { type: Date, required: true },
  registeredUpdates: [Date],
});

export default mongoose.model("Product", ProductSchema);
