import express from "express";

import {userDropdownController,createUserController,companyProductProjectDropdownController} from "../../Controllers/User/UserController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
import { getAllUserDetailsController ,editUserdetailsController} from "../../Controllers/User/UserController.js";
import {uploadUserPhoto} from "../../MiddleWare/Uploads.js";

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

///////\|/
router.post("/getAllUserDetails",authenticateToken,getAllUserDetailsController)
router.patch("/editUserdetails",authenticateToken,editUserdetailsController)


export default router;

