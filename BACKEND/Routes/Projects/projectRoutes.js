import express from "express";

import {
    getProject,
    addprojectController,
    editProjectController,
    toggleProjectStatus,
    deleteProjectController
} from "../../Controllers/Projects/projectController.js";


import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view",authenticateToken, getProject);  // VIEW PROJECTS
router.post("/addproject",authenticateToken, addprojectController);  // ADD PROJECT / COMPANY PRODUCT DROPDOWN
router.post("/editproject",authenticateToken, editProjectController);  // EDIT PROJECT / COMPANY PRODUCT DROPDOWN
router.post("/toggleProjectStatus",authenticateToken, toggleProjectStatus);  // TOGGLE PROJECT STATUS
router.post("/deleteProject",authenticateToken, deleteProjectController);  // DELETE PROJECT

export default router;