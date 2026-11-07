import express from "express";

import {
    getMaterialSubCategoryType,
    addMaterialSubCategory,
    getMaterialCategory,
    editMaterialSubCategory,
    updateMaterialSubCategoryStatus
} from "../../Controllers/MaterialSubCategoryType/MaterialSubCategoryTypeController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view",authenticateToken,getMaterialSubCategoryType);
router.post("/add",authenticateToken,addMaterialSubCategory);
router.post("/dropdown",authenticateToken,getMaterialCategory);
router.post("/edit",authenticateToken,editMaterialSubCategory);
router.patch("/status",authenticateToken,updateMaterialSubCategoryStatus);


export default router;