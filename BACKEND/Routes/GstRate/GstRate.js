import express from "express";

import {
    getGSTTypeDropdownController,
    addGSTRateController,
    getAllGSTRatesController,
    updateGSTRateStatusController
} from "../../Controllers/GstRate/GstRate.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/dropdown",authenticateToken,getGSTTypeDropdownController);
router.post("/add",authenticateToken,addGSTRateController);
router.post("/view",authenticateToken,getAllGSTRatesController);
router.patch("/status",authenticateToken,updateGSTRateStatusController);

export default router;