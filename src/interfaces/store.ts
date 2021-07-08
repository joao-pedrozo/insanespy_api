import { Schema } from "mongoose";

interface StoredStore {
  _id: Schema.Types.ObjectId;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export { StoredStore };
