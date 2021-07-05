import express from "express";
import cors from "cors";

import initDb from "./config/database";
import mainThread from "./mainThread";
import formatDate from "./utils/formatDate";
import router from "./config/routes";
var bodyParser = require("body-parser");

const app = express();

initDb();

// parse application/json
app.use(bodyParser.json());

app.use(cors());
app.use(router);

app.listen(8000);
