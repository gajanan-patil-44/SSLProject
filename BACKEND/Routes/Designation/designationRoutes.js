import express from "express";

import {
    getDesignation,
    add_designationController,
    editDesignationController,
    toggleDesignationStatus,
    deleteDesignationController,
    companyDesignationDpdwn,
    insertCompanyDesignation,
    fetchCompanyDesignationView,
    editCompanyDesignation,
    toggleCompanyDesignationController

} from "../../Controllers/Designation/DesignationController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view",authenticateToken, getDesignation); // VIEW DESIGNATIONS
router.post("/designation",authenticateToken, add_designationController);  // ADD DESIGNATION / COMPANY DROPDOWN
router.patch("/editdesignation",authenticateToken, editDesignationController);  // EDIT DESIGNATION / COMPANY DROPDOWN
router.patch("/toggleDesignationStatus",authenticateToken, toggleDesignationStatus);  // TOGGLE DESIGNATION STATUS
router.post("/deleteDesignation",authenticateToken, deleteDesignationController);  // DELETE DESIGNATION


//companyDesignation screen
router.post("/companyDesignationDpdwn",authenticateToken, companyDesignationDpdwn);
router.post("/insertCompanyDesignation",authenticateToken, insertCompanyDesignation);
router.post("/fetchCompanyDesignationView",authenticateToken, fetchCompanyDesignationView);

router.patch("/editCompanyDesignation",editCompanyDesignation);


router.patch( "/toggleCompanyDesignationStatus",toggleCompanyDesignationController);






 
export default router;