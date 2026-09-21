import express from "express";
const router=express.Router();
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

import { getAllUserDetailsController,editUserdetailsController } from "../../Controllers/User/useEditController.js";

import {getGender, getMaritalStatus, getDesignation, getCompany, getReportingManager, getCompanyProduct, getProject, getRole} from "../../Controllers/User/useEditController.js";


router.post("/getAllUserDetails",authenticateToken,getAllUserDetailsController)
router.patch("/editUserdetails",authenticateToken,editUserdetailsController);


// ==========================================
// router.post("/getGender", authenticateToken, getGender);
// router.post("/getMaritalStatus", authenticateToken, getMaritalStatus);
// router.post("/getDesignation", authenticateToken, getDesignation);
// router.post("/getCompany", authenticateToken, getCompany);
// router.post("/getReportingManager", authenticateToken, getReportingManager);
// router.post("/getCompanyProduct", authenticateToken, getCompanyProduct);
// router.post("/getProject", authenticateToken, getProject);
// router.post("/getRole", authenticateToken, getRole);

export default router;