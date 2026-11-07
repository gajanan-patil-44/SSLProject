
import express from "express";

import {
    getVendors,
    getVendorDropdowns,
    createVendor,
    editVendor,
    updateVendorStatusController,
    viewVendorFile
} from "../../Controllers/Vendor/VendorController.js";

import upload from "../../MiddleWare/VendorUpload.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view",authenticateToken, getVendors);
router.post("/dropdown", authenticateToken, getVendorDropdowns);
router.post("/add",authenticateToken, upload.array("VendorFiles", 10), createVendor);
router.patch("/edit",authenticateToken, upload.array("VendorFiles", 10), editVendor);
router.patch("/status", authenticateToken, updateVendorStatusController);
router.post("/view-file", authenticateToken, viewVendorFile);

export default router;
