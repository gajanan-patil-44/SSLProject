import express from "express";
import {
    getCompany,
    addCompanies,
    updateCompany,
    toggleCompanyStatus,
    deleteCompany
} from "../../Controllers/Company/companyController.js";

const router = express.Router();

router.post("/getCompany", getCompany);
router.post("/addCompany", addCompanies);
router.post("/updateCompany", updateCompany);
router.post("/toggleCompanyStatus", toggleCompanyStatus);
router.post("/deleteCompany", deleteCompany);

export default router;