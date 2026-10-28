import express from "express";
import { getProduct, addProducts, updateProduct, toggleProductStatus, deleteProduct } from "../../Controllers/Product/productController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

router.post("/getProduct",authenticateToken, getProduct);
router.post("/addProduct",authenticateToken, addProducts);
router.patch("/updateProduct",authenticateToken, updateProduct);
router.patch("/toggleProductStatus",authenticateToken, toggleProductStatus);
router.post("/deleteProduct",authenticateToken, deleteProduct);


export default router;