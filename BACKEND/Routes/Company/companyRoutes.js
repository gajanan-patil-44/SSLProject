import express from "express";
import { getCompany,addCompanies,updateCompany,toggleCompanyStatus,deleteCompany} from "../../Controllers/Company/companyController.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

<<<<<<< HEAD
router.post("/getCompany", getCompany);
router.post("/addCompany", addCompanies);
router.patch("/updateCompany", authenticateToken, updateCompany);
router.patch("/toggleCompanyStatus", authenticateToken, toggleCompanyStatus);
router.post("/deleteCompany", authenticateToken, deleteCompany);


export default router;
=======

router.post("/getCompany",authenticateToken, getCompany);
router.post("/addCompany",authenticateToken, addCompanies);
router.post("/updateCompany",authenticateToken, updateCompany);
router.post("/toggleCompanyStatus",authenticateToken, toggleCompanyStatus);
router.post("/deleteCompany",authenticateToken, deleteCompany);

export default router;

>>>>>>> 69bc7674324df59fbe679b50795e3d53124861bb
