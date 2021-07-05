import { Router } from "express";

import StoreController from "../controllers/StoreController";

const router = Router();

const storeController = new StoreController();

router.post("/store/add", storeController.add);

export default router;
