
import express from "express";

import {
    getLocationTypeController,
    getParentLocationTypeController,
    getParentLocationMasterController,
    addLocationMaster
} from "../../Controllers/LocationMaster/LocationMasterController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/locationType", authenticateToken, getLocationTypeController);   // LOCATION TYPE DROPDOWN
router.post("/parentLocationType", authenticateToken, getParentLocationTypeController);  // PARENT LOCATION TYPE DROPDOWN
router.post("/parentLocationMaster", authenticateToken, getParentLocationMasterController);  // PARENT LOCATION MASTER DROPDOWN
router.post("/addLocationMaster", authenticateToken, addLocationMaster);  // ADD LOCATION

export default router;
