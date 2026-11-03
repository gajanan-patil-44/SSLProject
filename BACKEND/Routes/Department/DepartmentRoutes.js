import express from "express";

import{getDepartment, addDepartment, updateDepartment, toggleStatus} from "../../Controller/Department/DepartmentController.js"

const router=express.Router();

router.post("/getDepartment", getDepartment)
router.post("/addDepartment", addDepartment),
router.post("/updateDepartment", updateDepartment)
router.post("/toggleStatus", toggleStatus)
