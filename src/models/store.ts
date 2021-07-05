import product from "./product";

import mongoose, { Schema } from "mongoose";

const StoreSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  products: [product],
});

export default mongoose.model("Store", StoreSchema);
