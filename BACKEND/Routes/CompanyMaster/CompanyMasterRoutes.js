import express from "express";

import {
    getCompanyMaster,
    addCompanyMaster,
    updateCompanyMaster,
    toggleCompanyMasterStatus,
    deleteCompanyMaster
} from "../../Controllers/CompanyMaster/CompanyMasterController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/getCompanyMaster", authenticateToken, getCompanyMaster);     //VIEW CompanyMaster
router.post("/addCompanyMaster", authenticateToken, addCompanyMaster);     // ADD CompanyMaster
router.patch("/updateCompanyMaster", authenticateToken, updateCompanyMaster);   //UPDATE CompanyMaster
router.patch("/toggleCompanyMasterStatus", authenticateToken, toggleCompanyMasterStatus);  //TOGGLESTATUS
router.post("/deleteCompanyMaster", authenticateToken, deleteCompanyMaster);  // DELETE CompanyMaster


export default router;