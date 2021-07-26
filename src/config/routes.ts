import { Router } from "express";

import StoreController from "../controllers/StoreController";

const router = Router();

const storeController = new StoreController();

router.post("/store/add", storeController.add.bind(storeController));
router.get("/store/find", storeController.findStores);
router.get("/store/find/:id", storeController.findOne);
router.delete(
  "/store/delete/:id",
  storeController.delete.bind(storeController)
);

export default router;
