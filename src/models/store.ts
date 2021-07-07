import product from "./product";

import mongoose, { Schema } from "mongoose";

const StoreSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

export default mongoose.model("Store", StoreSchema);
