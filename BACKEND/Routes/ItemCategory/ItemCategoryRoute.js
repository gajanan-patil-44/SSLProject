import express from "express";

import {
    getMaterialCategoryTypes,
    addMaterialCategoryType,
    updateMaterialCategoryType,
    toggleMaterialCategoryTypeStatus
} from "../../Controllers/ItemCategory/ItemCategoryController.js";

// import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/getMaterialCategoryType", getMaterialCategoryTypes);  // GET ALL ITEM CATEGORIES
router.post("/addMaterialCategoryType", addMaterialCategoryType);  // ADD ITEM CATEGORY
router.post("/updateMaterialCategoryType", updateMaterialCategoryType);  // UPDATE ITEM CATEGORY
router.post("/toggleMaterialCategoryTypeStatus", toggleMaterialCategoryTypeStatus);   // TOGGLE ITEM CATEGORY STATUS


export default router;