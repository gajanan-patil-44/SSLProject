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
<<<<<<< HEAD
router.post("/addMaterialCategoryType", authenticateToken, addMaterialCategoryType);  // ADD ITEM CATEGORY
router.patch("/updateMaterialCategoryType", authenticateToken, updateMaterialCategoryType);  // UPDATE ITEM CATEGORY
router.patch("/toggleMaterialCategoryTypeStatus", authenticateToken, toggleMaterialCategoryTypeStatus);   // TOGGLE ITEM CATEGORY STATUS
=======
router.post("/addMaterialCategoryType",authenticateToken, addMaterialCategoryType);  // ADD ITEM CATEGORY
router.post("/updateMaterialCategoryType", authenticateToken, updateMaterialCategoryType);  // UPDATE ITEM CATEGORY
router.post("/toggleMaterialCategoryTypeStatus", authenticateToken, toggleMaterialCategoryTypeStatus);   // TOGGLE ITEM CATEGORY STATUS
>>>>>>> 69bc7674324df59fbe679b50795e3d53124861bb


export default router;
