import express from "express";
import {getDesignation, designationController, editDesignationController, toggleDesignationStatus, deleteDesignationController} from "../../Controllers/Designation/designationController.js";

const router = express.Router();


router.post("/view", getDesignation);  // View all designations
router.post("/designation", designationController);   // Company dropdown + Add Designation
router.post("/editdesignation", editDesignationController); //edit designation
router.post("/toggleDesignationStatus", toggleDesignationStatus);
router.post("/deleteDesignation", deleteDesignationController); // delete designation


export default router;