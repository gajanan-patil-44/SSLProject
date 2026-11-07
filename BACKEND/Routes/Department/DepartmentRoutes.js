import express from "express";

import {
    getDepartments,
    addDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    companyDepartmentDpdwn,
    insertCompanyDepartment,
    fetchCompanyDepartmentViewController,
    editCompanyDepartment,
    toggleCompanyDepartmentController
} from "../../Controllers/Department/DepartmentController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/getDepartment", authenticateToken, getDepartments);  // GET ALL DEPARTMENTS
router.post("/addDepartment", authenticateToken, addDepartment);  // ADD DEPARTMENT
router.patch("/updateDepartment", authenticateToken, updateDepartment);  // UPDATE DEPARTMENT
router.patch("/toggleDepartmentStatus", authenticateToken, toggleDepartmentStatus);  // TOGGLE DEPARTMENT STATUS




router.post("/dropdown", companyDepartmentDpdwn);
router.post("/add", insertCompanyDepartment);
router.post("/view", fetchCompanyDepartmentViewController);


router.patch("/edit", editCompanyDepartment);
router.patch("/status", toggleCompanyDepartmentController);

export default router;