
import express from "express";

import {
    getLocationTypes,
    createLocationType,
    getLocationParentDropdown,
    editLocationType
} from "../../Controllers/LocationTypeMaster/LocationTypeMasterController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view", authenticateToken, getLocationTypes);
router.post("/add", authenticateToken, createLocationType);
router.post("/dropdown", authenticateToken, getLocationParentDropdown);
router.patch("/edit", authenticateToken, editLocationType);

export default router;
