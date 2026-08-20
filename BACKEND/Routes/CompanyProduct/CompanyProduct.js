import express from "express";
import {getCompanyProduct,companyProductController} from "../../Controllers/CompanyProduct/CompanyProductController.js";


const router = express.Router();

router.post("/view",getCompanyProduct);
router.post("/companyProduct",companyProductController);
// router.post("/addCompanyProduct",addCompanyProductController);
// router.post("/companies",getCompaniesForDropdownController);
// router.post("/products",getProductsForDropdownController);


export default router;