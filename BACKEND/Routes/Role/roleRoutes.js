import express from "express";
import { getRole, addRoles, updateRole,updateRoleStatusController,} from "../../Controllers/RoleCreation/RoleCreation.js"
import {authenticateToken} from "../../MiddleWare/authMiddleware.js"
const router = express.Router();

router.post("/getRole",authenticateToken, getRole);
router.post("/addRole", authenticateToken,addRoles);
router.patch("/updateRole",authenticateToken, updateRole);
router.patch("/updateRoleStatus",authenticateToken, updateRoleStatusController);

export default router;
