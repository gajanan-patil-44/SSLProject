import express from "express";
import {getCompanyProduct,companyProductController,editCompanyProductController,deleteCompanyProductController,updateCompanyProductstatusController} from "../../Controllers/CompanyProduct/CompanyProductController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view", authenticateToken,getCompanyProduct);
router.post("/companyProduct",authenticateToken,  companyProductController); // Get all company,products for dropdown and add company product
router.patch("/editcompanyproduct", authenticateToken, editCompanyProductController);  //get all company,products for dropdown and edit company product
router.post("/deleteCompanyProduct", authenticateToken, deleteCompanyProductController);
router.patch("/updateCompanyProductstatus", authenticateToken, updateCompanyProductstatusController);  


export default router;