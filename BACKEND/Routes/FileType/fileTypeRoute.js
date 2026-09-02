import express from "express";

import {
    getFileTypesController,
    addFileTypeController,
    updateFileTypeController,
    deleteFileTypeController,
    updateFileTypeStatusController
} from "../../Controllers/FileType/FileTypeController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

// ==========================================================
// FILE TYPE ROUTES
// ==========================================================
router.post("/getfiletypes", authenticateToken, getFileTypesController);
router.post("/addfiletype", authenticateToken, addFileTypeController);
router.post("/updatefiletype", authenticateToken, updateFileTypeController);
router.post("/deletefiletype", authenticateToken, deleteFileTypeController);
router.post("/updatefiletypestatus", authenticateToken, updateFileTypeStatusController);


export default router;