import express from "express";
import {getCompanyProduct,companyProductController,editCompanyProductController,deleteCompanyProductController,updateCompanyProductstatusController} from "../../Controllers/CompanyProduct/CompanyProductController.js";
// import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/view",  getCompanyProduct);
router.post("/companyProduct",  companyProductController); // Get all company,products for dropdown and add company product
router.patch("/editcompanyproduct",  editCompanyProductController);  //get all company,products for dropdown and edit company product
router.post("/deleteCompanyProduct",  deleteCompanyProductController);
router.patch("/updateCompanyProductstatus",  updateCompanyProductstatusController);  


export default router;