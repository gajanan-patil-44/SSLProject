import express from "express";

import {
    getProject,
    projectController,
    editProjectController,
    toggleProjectStatus,
    deleteProjectController
} from "../../Controllers/Projects/projectController.js";


// import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/view", getProject);  // VIEW PROJECTS
router.post("/project", projectController);  // ADD PROJECT / COMPANY PRODUCT DROPDOWN
router.post("/editproject", editProjectController);  // EDIT PROJECT / COMPANY PRODUCT DROPDOWN
router.post("/toggleProjectStatus", toggleProjectStatus);  // TOGGLE PROJECT STATUS
router.post("/deleteProject", deleteProjectController);  // DELETE PROJECT


export default router;