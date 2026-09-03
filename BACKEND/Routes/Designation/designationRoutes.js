import express from "express";

import {
    getDesignation,
    designationController,
    editDesignationController,
    toggleDesignationStatus,
    deleteDesignationController

} from "../../Controllers/Designation/DesignationController.js";

// import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/view", getDesignation);  // VIEW DESIGNATIONS
router.post("/designation", designationController);  // ADD DESIGNATION / COMPANY DROPDOWN
router.post("/editdesignation", editDesignationController);  // EDIT DESIGNATION / COMPANY DROPDOWN
router.post("/toggleDesignationStatus", toggleDesignationStatus);  // TOGGLE DESIGNATION STATUS
router.post("/deleteDesignation", deleteDesignationController);  // DELETE DESIGNATION
 

export default router;