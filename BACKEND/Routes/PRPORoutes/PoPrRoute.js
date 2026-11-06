import express from "express";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
import { createPRPOController,getMaterialDrpDwnController ,getPriorityLevelDrpDwnController,updatePRPOActionController} from "../../Controllers/PRPOController/PrController.js";

import { uploadPRPOFiles } from "../../MiddleWare/PRPO/prpoMiddleware.js";
const router = express.Router();

router.post("/createPRPO",authenticateToken,uploadPRPOFiles.array("files", 10),createPRPOController);
router.post("/getMaterialDrpDwn",authenticateToken,getMaterialDrpDwnController);
router.post("/getPrioritylevelDrpDwn",authenticateToken,getPriorityLevelDrpDwnController);
router.post("/PrPoAction",authenticateToken,updatePRPOActionController);

//authenticateToken,
export default router;

