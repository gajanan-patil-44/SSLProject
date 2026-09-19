import express from "express";
import {userDropdownController,createUserController,companyProductProjectDropdownController} from "../../Controllers/User/UserController.js";


import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

import {uploadUserPhoto} from "../../MiddleWare/Uploads.js";

//import {getGender, getMaritalStatus, getDesignation, getCompany, getReportingManager, getCompanyProduct, getProject, getRole} from "../../Controllers/User/UserController.js";

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









export default router;

