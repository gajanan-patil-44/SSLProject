import express from "express";

import {
    getDepartments,
    addDepartment,
    updateDepartment,
    toggleDepartmentStatus
} from "../../Controllers/Department/DepartmentController.js";

// import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/getDepartment",  getDepartments);  // GET ALL DEPARTMENTS
router.post("/addDepartment",  addDepartment);  // ADD DEPARTMENT
router.patch("/updateDepartment",  updateDepartment);  // UPDATE DEPARTMENT
router.patch("/toggleDepartmentStatus",  toggleDepartmentStatus);  // TOGGLE DEPARTMENT STATUS

export default router;