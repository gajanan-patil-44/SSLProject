import express from "express";

import { createPRPOController } from "../../Controllers/PRPOController/PrController.js";

import { uploadPRPOFiles } from "../../MiddleWare/PRPO/prpoMiddleware.js";
const router = express.Router();

router.post("/createPRPO",uploadPRPOFiles.array("files", 10),createPRPOController);

export default router;