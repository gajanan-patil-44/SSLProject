import express from "express";

import {userDropdownController,createUserController,companyProductProjectDropdownController} from "../../Controllers/User/UserController.js";

import {uploadUserPhoto} from "../../MiddleWare/Uploads.js";

const router = express.Router();


// ==========================================
// USER DROPDOWNS
// FlagId 1 = Gender
// FlagId 2 = Marital Status
// FlagId 3 = Designation
// ==========================================
router.post("/userdropdowns",userDropdownController);
router.post("/createuser",uploadUserPhoto.any(),createUserController);
router.post("/companyproductprojectdropdown", companyProductProjectDropdownController);  ///superadmindropdown

export default router;