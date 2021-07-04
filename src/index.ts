import express from "express";
import cors from "cors";

import initDb from "./config/database";

const app = express();

initDb();

app.use(cors());

app.get("/api", (req, res) => {
  console.log("aqasdasdasdsa");
  res.status(200);
  res.json("Sucesso");
});
