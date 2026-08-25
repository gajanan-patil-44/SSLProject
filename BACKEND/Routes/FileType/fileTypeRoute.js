import express from "express";

import {
    getFileTypesController,
    addFileTypeController,
    updateFileTypeController,
    deleteFileTypeController,
    updateFileTypeStatusController
} from "../../Controllers/FileType/FileTypeController.js";

const router = express.Router();

// ==========================================================
// FILE TYPE ROUTES
// ==========================================================

// FlagId = 1 -> Get File Types
router.post("/getfiletypes", getFileTypesController);

// FlagId = 2 -> Add File Type
router.post("/addfiletype", addFileTypeController);

// FlagId = 3 -> Update File Type
router.post("/updatefiletype", updateFileTypeController);

// FlagId = 4 -> Delete File Type
router.post("/deletefiletype", deleteFileTypeController);

// FlagId = 5 -> Update File Type Status
router.post("/updatefiletypestatus", updateFileTypeStatusController);


export default router;