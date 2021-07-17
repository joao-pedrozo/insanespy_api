import express from "express";
import cors from "cors";

import initDb from "./config/database";
import mainThread from "./mainThread";
import { formatDate } from "./utils/date";
import router from "./config/routes";

var bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

initDb();

// parse application/json
app.use(bodyParser.json());

app.use(cors());
app.use(router);

app.listen(8000);

mainThread();
