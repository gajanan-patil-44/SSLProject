import express from "express";

import {
    getManagePageDropdown,
    addPage
} from "../../Controllers/ManagePages/ManagePagesController.js";


const router = express.Router();

router.get("/dropdown", getManagePageDropdown);
router.post("/add", addPage);

export default router;