import express from "express";
import { getRole, addRoles, updateRole,deleteRole,updateRoleStatusController,getCompanyForRole,getCompanyDropdown} from "../../Controllers/RoleCreation/RoleCreation.js"
import {authenticateToken} from "../../MiddleWare/authMiddleware.js"
const router = express.Router();

router.post("/getRole", getRole);
router.post("/addRole", addRoles);
router.post("/companyexists",authenticateToken, getCompanyForRole);  //drodown
router.patch("/updateRole",authenticateToken, updateRole);
router.post("/deleteRole",authenticateToken, deleteRole);
router.patch("/updateRoleStatus",authenticateToken, updateRoleStatusController);
router.post("/dropdown",getCompanyDropdown)

export default router;
