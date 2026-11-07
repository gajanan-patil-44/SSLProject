
import express from "express";

import {
    getCompanyRoles,
    addCompanyRoleController,
    editCompanyRoleController,
    updateCompanyRoleStatusController,
    getCompanyRoleDropdown
} from "../../Controllers/CompanyRole/CompanyRole.js";


import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view", authenticateToken, getCompanyRoles);
router.post("/add", authenticateToken, addCompanyRoleController);
router.patch("/edit", authenticateToken, editCompanyRoleController);
router.patch("/status", authenticateToken, updateCompanyRoleStatusController);
router.post("/dropdown", authenticateToken, getCompanyRoleDropdown);

export default router;
