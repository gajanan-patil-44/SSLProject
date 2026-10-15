import express from "express";
import { getProduct, addProducts, updateProduct, toggleProductStatus, deleteProduct } from "../../Controllers/Product/productController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

router.post("/getProduct", authenticateToken, getProduct);
router.post("/addProduct", addProducts);
router.patch("/updateProduct", authenticateToken, updateProduct);
router.post("/deleteProduct", authenticateToken, deleteProduct);
router.patch("/toggleProductStatus", authenticateToken, toggleProductStatus);

export default router;