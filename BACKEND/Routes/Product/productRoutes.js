import express from "express";
import { getProduct, addProducts, updateProduct, toggleProductStatus, deleteProduct } from "../../Controllers/Product/productController.js";

const router = express.Router();

router.post("/getProduct", getProduct);
router.post("/addProduct", addProducts);
router.post("/updateProduct", updateProduct);
router.post("/deleteProduct", deleteProduct);
router.post("/toggleProductStatus", toggleProductStatus);

export default router;