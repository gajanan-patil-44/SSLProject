import express from "express";

import {
    getDesignation,
    designationController,
    editDesignationController,
    toggleDesignationStatus,
    deleteDesignationController

} from "../../Controllers/Designation/DesignationController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/view", authenticateToken, getDesignation); // VIEW DESIGNATIONS
router.post("/designation", authenticateToken, designationController);  // ADD DESIGNATION / COMPANY DROPDOWN
router.patch("/editdesignation", authenticateToken, editDesignationController);  // EDIT DESIGNATION / COMPANY DROPDOWN
router.patch("/toggleDesignationStatus", authenticateToken, toggleDesignationStatus);  // TOGGLE DESIGNATION STATUS
router.post("/deleteDesignation", authenticateToken, deleteDesignationController);  // DELETE DESIGNATION
 

export default router;