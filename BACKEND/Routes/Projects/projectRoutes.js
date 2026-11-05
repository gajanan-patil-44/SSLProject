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
router.post("/project",authenticateToken, addprojectController);  // ADD PROJECT / COMPANY PRODUCT DROPDOWN
<<<<<<< HEAD
router.post("/editproject",authenticateToken, editProjectController);  // EDIT PROJECT / COMPANY PRODUCT DROPDOWN
=======
router.patch("/editproject",authenticateToken, editProjectController);  // EDIT PROJECT / COMPANY PRODUCT DROPDOWN
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
router.patch("/toggleProjectStatus",authenticateToken, toggleProjectStatus);  // TOGGLE PROJECT STATUS
router.post("/deleteProject",authenticateToken, deleteProjectController);  // DELETE PROJECT

export default router;

