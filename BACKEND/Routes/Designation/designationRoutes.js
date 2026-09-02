import express from "express";
import {getDesignation, designationController, editDesignationController, toggleDesignationStatus, deleteDesignationController} from "../../Controllers/Designation/designationController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();


router.post("/view", authenticateToken, getDesignation);  // View all designations
router.post("/designation", authenticateToken, designationController);   // Company dropdown + Add Designation
router.post("/editdesignation", authenticateToken, editDesignationController); //edit designation
router.post("/toggleDesignationStatus", authenticateToken, toggleDesignationStatus);
router.post("/deleteDesignation", authenticateToken, deleteDesignationController); // delete designation


export default router;