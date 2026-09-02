import express from "express";

import {
    processBirthdayMailController,
    getBirthdayMailLogsController,
    getBirthdayMailLogController
} from "../../Controllers/Birthday/birthdayController.js";


const router = express.Router();


// ==========================================================
// PROCESS BIRTHDAY EMAILS
// ==========================================================

router.post("/processbirthdaymail", processBirthdayMailController);

// ==========================================================
// GET ALL BIRTHDAY MAIL LOGS
// ==========================================================

router.get("/birthdaymaillogs", getBirthdayMailLogsController);

// ==========================================================
// GET BIRTHDAY MAIL LOG BY ID
// ==========================================================

router.get("/birthdaymaillogs/:id", getBirthdayMailLogController);


export default router;