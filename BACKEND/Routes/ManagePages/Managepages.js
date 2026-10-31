import express from "express";

import {
    getManagePageDropdown,
    getManagePages ,
    updateManagePageStatus,
    addPage,
    editPage
} from "../../Controllers/ManagePages/ManagePagesController.js";


const router = express.Router();

router.post("/dropdown", getManagePageDropdown);
router.post("/view",getManagePages );
router.patch("/status",updateManagePageStatus);
router.post("/add", addPage);
router.patch("/edit",editPage);
export default router;