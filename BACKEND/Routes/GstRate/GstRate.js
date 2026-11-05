import express from "express";

import {
    getGSTTypeDropdownController,
    addGSTRateController,
    getAllGSTRatesController,
    updateGSTRateStatusController
} from "../../Controllers/GstRate/GstRate.js";

const router = express.Router();

router.post("/dropdown",getGSTTypeDropdownController);
router.post("/add",addGSTRateController);
router.post("/view",getAllGSTRatesController);
router.patch("/status",updateGSTRateStatusController);

export default router;