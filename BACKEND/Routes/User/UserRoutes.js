import express from "express";

import {
    userDropdownController,
    createUserController
} from "../../Controllers/User/UserController.js";

const router = express.Router();


// ==========================================
// USER DROPDOWNS
// FlagId 1 = Gender
// FlagId 2 = Marital Status
// FlagId 3 = Designation
// ==========================================

router.post("/userdropdowns",userDropdownController);
router.post("/createuser",createUserController);


export default router;