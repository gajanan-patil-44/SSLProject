import express from "express";

import {
    getMaterialSubCategoryType,
    addMaterialSubCategory,
    getMaterialCategory,
    editMaterialSubCategory,
    updateMaterialSubCategoryStatus
} from "../../Controllers/MaterialSubCategoryType/MaterialSubCategoryTypeController.js";

const router = express.Router();

router.post("/view",getMaterialSubCategoryType);
router.post("/add",addMaterialSubCategory);
router.post("/dropdown",getMaterialCategory);
router.post("/edit",editMaterialSubCategory);
router.patch("/status",updateMaterialSubCategoryStatus);


export default router;