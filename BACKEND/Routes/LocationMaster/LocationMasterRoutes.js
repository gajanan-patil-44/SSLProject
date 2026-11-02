
import express from "express";

import {
    getLocationTypes,
    getParentLocationTypes,
    getParentLocations,
    addLocationMaster
} from "../../Controllers/LocationMaster/LocationMasterController.js";

// import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/getLocationTypes", getLocationTypes);   // DROPDOWN 1 - LOCATION TYPE
router.post("/getParentLocationTypes", getParentLocationTypes);    // DROPDOWN 2 - PARENT LOCATION TYPE
router.post("/getParentLocations", getParentLocations);    // DROPDOWN 3 - PARENT LOCATION NAME
router.post("/addLocationMaster", addLocationMaster);    // INSERT LOCATION MASTER


export default router;
