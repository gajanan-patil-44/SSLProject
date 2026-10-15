import express from "express";

import {
    getMaterialCategoryTypes,
    addMaterialCategoryType,
    updateMaterialCategoryType,
    toggleMaterialCategoryTypeStatus
} from "../../Controllers/ItemCategory/ItemCategoryController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/getMaterialCategoryType", authenticateToken, getMaterialCategoryTypes);  // GET ALL ITEM CATEGORIES
router.post("/addMaterialCategoryType",authenticateToken, addMaterialCategoryType);  // ADD ITEM CATEGORY
router.post("/updateMaterialCategoryType", authenticateToken, updateMaterialCategoryType);  // UPDATE ITEM CATEGORY
router.post("/toggleMaterialCategoryTypeStatus", authenticateToken, toggleMaterialCategoryTypeStatus);   // TOGGLE ITEM CATEGORY STATUS


export default router;
