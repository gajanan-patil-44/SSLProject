import express from "express";

import {
    getManagePageDropdown,
    getManagePages ,
    updateManagePageStatus,
    addPage
} from "../../Controllers/ManagePages/ManagePagesController.js";


const router = express.Router();

router.get("/dropdown", getManagePageDropdown);
router.get("/view",getManagePages );
router.patch("/status",updateManagePageStatus);
router.post("/add", addPage);

export default router;