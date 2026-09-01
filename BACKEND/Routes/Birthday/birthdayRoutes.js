import express from "express";

import {
    processBirthdayMailController,
    getBirthdayMailLogsController,
    getBirthdayMailLogController
} from "../../Controllers/Birthday/birthdayController.js";


const router = express.Router();

router.post("/processbirthdaymail", processBirthdayMailController);  // PROCESS BIRTHDAY EMAILS
router.get("/birthdaymaillogs", getBirthdayMailLogsController);  // GET ALL BIRTHDAY MAIL LOGS
router.get("/birthdaymaillogs/:id", getBirthdayMailLogController);  // GET BIRTHDAY MAIL LOG BY ID


export default router;