import express from "express";
import {
    getVendorTypes,
    addVendorTypeController,
    editVendorTypeController,
    toggleVendorTypeStatus
} from "../../Controllers/VendorType/VendorTypeController.js";

const router = express.Router();

router.post("/view", getVendorTypes);
router.post("/add", addVendorTypeController);
router.patch("/edit", editVendorTypeController);
router.patch("/status", toggleVendorTypeStatus);

export default router;
