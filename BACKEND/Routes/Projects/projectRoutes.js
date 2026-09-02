import express from "express";

import {
    getProject,
    projectController,
    editProjectController,
    toggleProjectStatus,
    deleteProjectController
} from "../../Controllers/Projects/projectController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/view", authenticateToken, getProject);   // VIEW PROJECTS
router.post("/project", authenticateToken, projectController);  // ADD PROJECT, Company Product Dropdown + Add Project
router.post("/editproject", authenticateToken, editProjectController);  // EDIT PROJECT, Company Product Dropdown + Edit Project
router.post("/toggleProjectStatus", authenticateToken, toggleProjectStatus);  // TOGGLE PROJECT STATUS
router.post("/deleteProject", authenticateToken, deleteProjectController); // DELETE PROJECT


export default router;