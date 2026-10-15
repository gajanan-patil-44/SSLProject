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


router.post("/view", authenticateToken, getProject);  // VIEW PROJECTS
router.post("/project", projectController);  // ADD PROJECT / COMPANY PRODUCT DROPDOWN
router.patch("/editproject", authenticateToken, editProjectController);  // EDIT PROJECT / COMPANY PRODUCT DROPDOWN
router.patch("/toggleProjectStatus", authenticateToken, toggleProjectStatus);  // TOGGLE PROJECT STATUS
router.post("/deleteProject", authenticateToken, deleteProjectController);  // DELETE PROJECT


export default router;