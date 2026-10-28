
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

const router = express.Router();

router.post("/view", getVendors);
router.post("/dropdown", getVendorDropdowns);
router.post("/add",upload.array("VendorFiles", 10),createVendor);
router.patch("/edit",upload.array("VendorFiles", 10),editVendor);
router.patch("/status", updateVendorStatusController);
router.post("/view-file",viewVendorFile);

export default router;
