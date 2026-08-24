import express from "express";

import {
    getProject,
    projectController,
    editProjectController,
    toggleProjectStatus,
    deleteProjectController
} from "../../Controllers/Projects/projectController.js";


const router = express.Router();


router.post("/view", getProject);   // VIEW PROJECTS
router.post("/project", projectController);  // ADD PROJECT, Company Product Dropdown + Add Project
router.post("/editproject", editProjectController);  // EDIT PROJECT, Company Product Dropdown + Edit Project
router.post("/toggleProjectStatus", toggleProjectStatus);  // TOGGLE PROJECT STATUS
router.post("/deleteProject", deleteProjectController); // DELETE PROJECT


export default router;