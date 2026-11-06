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
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view",authenticateToken, getMaterial);
router.post("/dropdown", authenticateToken, getMaterialDropdown);
router.post("/add", authenticateToken, upload.array("files", 10), createMaterial);
router.patch("/edit", authenticateToken, upload.array("files", 10), editMaterial);
router.patch("/status", authenticateToken, updateMaterialStatusController);
router.post("/view-file", authenticateToken, viewMaterialFile);


export default router;