import express from "express";
import {getCompanyProduct,companyProductController,editCompanyProductController,deleteCompanyProductController} from "../../Controllers/CompanyProduct/CompanyProductController.js";


const router = express.Router();

router.post("/view",getCompanyProduct);
router.post("/companyProduct",companyProductController); // Get all company,products for dropdown and add company product
router.post("/editcompanyproduct",editCompanyProductController);  //get all company,products for dropdown and edit company product
router.post("/deleteCompanyProduct", deleteCompanyProductController);


export default router;