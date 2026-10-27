import express from "express";
import { getProduct, addProducts, updateProduct, toggleProductStatus, deleteProduct } from "../../Controllers/Product/productController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

<<<<<<< HEAD
router.post("/getProduct", authenticateToken, getProduct);
router.post("/addProduct", addProducts);
router.patch("/updateProduct", authenticateToken, updateProduct);
router.post("/deleteProduct", authenticateToken, deleteProduct);
router.patch("/toggleProductStatus", authenticateToken, toggleProductStatus);
=======
router.post("/getProduct",authenticateToken, getProduct);
router.post("/addProduct",authenticateToken, addProducts);
router.post("/updateProduct",authenticateToken, updateProduct);
router.post("/toggleProductStatus",authenticateToken, toggleProductStatus);
router.post("/deleteProduct",authenticateToken, deleteProduct);

>>>>>>> 69bc7674324df59fbe679b50795e3d53124861bb

export default router;