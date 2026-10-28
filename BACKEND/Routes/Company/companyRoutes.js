import express from "express";
import {
    getCompany,
    addCompanies,
    updateCompany,
    toggleCompanyStatus,
    deleteCompany
} from "../../Controllers/Company/companyController.js";

import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();


router.post("/getCompany",authenticateToken, getCompany);
router.post("/addCompany",authenticateToken, addCompanies);
router.patch("/updateCompany",authenticateToken, updateCompany);
router.patch("/toggleCompanyStatus",authenticateToken, toggleCompanyStatus);
router.post("/deleteCompany",authenticateToken, deleteCompany);

export default router;

