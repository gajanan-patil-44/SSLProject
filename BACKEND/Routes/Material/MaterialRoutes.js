import express from "express";

import {
    getMaterial,
    getMaterialDropdown,
    createMaterial,
    editMaterial,
    updateMaterialStatusController,
    viewMaterialFile
} from "../../Controllers/Material/MaterialController.js";

import upload from "../../MiddleWare/materialUpload.js";

const router = express.Router();

router.post("/view", getMaterial);
router.post("/dropdown", getMaterialDropdown);
router.post("/add", upload.array("files", 10), createMaterial);
router.patch("/edit", upload.array("files", 10), editMaterial);
router.patch("/status", updateMaterialStatusController);
router.post("/view-file",viewMaterialFile);

export default router;