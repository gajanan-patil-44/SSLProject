import express from "express";
import { getRole, addRoles, updateRole,deleteRole,updateRoleStatusController,getCompanyForRole,getCompanyDropdown} from "../../Controllers/RoleCreation/RoleCreation.js"
import {authenticateToken} from "../../MiddleWare/authMiddleware.js"
const router = express.Router();

router.post("/getRole", getRole);
router.post("/addRole", addRoles);
router.post("/companyexists",authenticateToken, getCompanyForRole);  //drodown
router.post("/updateRole",authenticateToken, updateRole);
router.post("/deleteRole",authenticateToken, deleteRole);
router.post("/updateRoleStatus",authenticateToken, updateRoleStatusController);
router.post("/dropdown",getCompanyDropdown)

export default router;
