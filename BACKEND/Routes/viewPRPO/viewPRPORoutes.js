
import express from "express";

import {getPRPOHeaders, getPRPODetails} from "../../Controllers/viewPRPO/viewPRPOController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/getPRPOHeader", authenticateToken, getPRPOHeaders);   // GET ALL PRPO HEADERS BASED ON LOGGED-IN USER
router.post("/getPRPODetails", authenticateToken, getPRPODetails);  // GET COMPLETE DETAILS OF A SELECTED PRPO


export default router;
