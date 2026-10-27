import express from "express";

import {
    getDesignation,
    add_designationController,
    editDesignationController,
    toggleDesignationStatus,
    deleteDesignationController

} from "../../Controllers/Designation/DesignationController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


<<<<<<< HEAD
router.post("/view", authenticateToken, getDesignation); // VIEW DESIGNATIONS
router.post("/designation", authenticateToken, designationController);  // ADD DESIGNATION / COMPANY DROPDOWN
router.patch("/editdesignation", authenticateToken, editDesignationController);  // EDIT DESIGNATION / COMPANY DROPDOWN
router.patch("/toggleDesignationStatus", authenticateToken, toggleDesignationStatus);  // TOGGLE DESIGNATION STATUS
router.post("/deleteDesignation", authenticateToken, deleteDesignationController);  // DELETE DESIGNATION
=======
router.post("/view",authenticateToken, getDesignation); // VIEW DESIGNATIONS
router.post("/add_designation",authenticateToken, add_designationController);  // ADD DESIGNATION / COMPANY DROPDOWN
router.post("/editdesignation",authenticateToken, editDesignationController);  // EDIT DESIGNATION / COMPANY DROPDOWN
router.post("/toggleDesignationStatus",authenticateToken, toggleDesignationStatus);  // TOGGLE DESIGNATION STATUS
router.post("/deleteDesignation",authenticateToken, deleteDesignationController);  // DELETE DESIGNATION
>>>>>>> 69bc7674324df59fbe679b50795e3d53124861bb
 

export default router;