import express from "express";
import { getRole, addRoles, updateRole,deleteRole,updateRoleStatusController,getCompanyForRole} from "../../Controllers/RoleCreation/RoleCreation.js"
// import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/getRole", getRole);
router.post("/addRole", addRoles);
router.post("/companyexists", getCompanyForRole);  //drodown
router.post("/updateRole", updateRole);
router.post("/deleteRole", deleteRole);
router.post("/updateRoleStatus", updateRoleStatusController);

export default router;
