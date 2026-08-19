import express from "express";
import {
    getCompany,
    addCompanies,
    updateCompany,
    deleteCompany
} from "../../Controllers/Company/companyController.js";

const router = express.Router();

router.post("/getCompany", getCompany);
router.post("/addCompany", addCompanies);
router.post("/updateCompany", updateCompany);
router.post("/deleteCompany", deleteCompany);

export default router;