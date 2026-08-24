import express from "express";
import {getDesignation, designationController, editDesignationController, deleteDesignationController} from "../../Controllers/Designation/designationController.js";

const router = express.Router();


router.post("/view", getDesignation);  // View all designations
router.post("/designation", designationController);   // Company dropdown + Add Designation
router.post("/editdesignation", editDesignationController); //edit designation
router.post("/deleteDesignation", deleteDesignationController); // delete designation


export default router;