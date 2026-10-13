
import express from "express";

import {
    getVendors,
    getVendorDropdowns,
    createVendor,
    editVendor,
    updateVendorStatusController
} from "../../Controllers/Vendor/VendorController.js";

import upload from "../../MiddleWare/VendorUpload.js";

const router = express.Router();

router.post("/view", getVendors);
router.post("/dropdown", getVendorDropdowns);
router.post("/add",upload.array("vendorFiles", 10),createVendor);
router.patch("/edit",upload.array("vendorFiles", 10),editVendor);
router.patch("/status", updateVendorStatusController);

export default router;
