import express from "express";

import {
    getDepartments,
    addDepartment,
    updateDepartment,
    toggleDepartmentStatus
} from "../../Controllers/Department/DepartmentController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/getDepartment", authenticateToken, getDepartments);  // GET ALL DEPARTMENTS
router.post("/addDepartment", authenticateToken, addDepartment);  // ADD DEPARTMENT
router.patch("/updateDepartment", authenticateToken, updateDepartment);  // UPDATE DEPARTMENT
router.patch("/toggleDepartmentStatus", authenticateToken, toggleDepartmentStatus);  // TOGGLE DEPARTMENT STATUS

export default router;