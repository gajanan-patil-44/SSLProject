import express from "express";
import {userDropdownController,createUserController,companyProductProjectDropdownController} from "../../Controllers/User/UserController.js";


import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
import { getAllUserDetailsController ,editUserdetailsController} from "../../Controllers/User/UserController.js";
import {uploadUserPhoto} from "../../MiddleWare/Uploads.js";

import {getGender, getMaritalStatus, getDesignation, getCompany, getReportingManager, getCompanyProduct, getProject, getRole} from "../../Controllers/User/UserController.js";

const router = express.Router();
// ==========================================
// USER DROPDOWNS
// FlagId 1 = Gender
// FlagId 2 = Marital Status
// FlagId 3 = Designation
// ==========================================
router.post("/userdropdowns",authenticateToken,userDropdownController);
router.post("/createuser",authenticateToken,uploadUserPhoto.any(),createUserController);
router.post("/companyproductprojectdropdown", authenticateToken,companyProductProjectDropdownController);  ///superadmindropdown

/////\|/
router.post("/getAllUserDetails",authenticateToken,getAllUserDetailsController)
router.patch("/editUserdetails",authenticateToken,editUserdetailsController)


// // ==========================================
router.post("/getGender", authenticateToken, getGender);
router.post("/getMaritalStatus", authenticateToken, getMaritalStatus);
router.post("/getDesignation", authenticateToken, getDesignation);
router.post("/getCompany", authenticateToken, getCompany);
router.post("/getReportingManager", authenticateToken, getReportingManager);
router.post("/getCompanyProduct", authenticateToken, getCompanyProduct);
router.post("/getProject", authenticateToken, getProject);
router.post("/getRole", authenticateToken, getRole);



export default router;

