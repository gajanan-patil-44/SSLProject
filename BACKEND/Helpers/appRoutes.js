import * as backendHelpers from "../Helpers/Backend_Helpers.js";

import UserRoutes from "../Routes/User/UserRoutes.js";
import RoleRoutes from "../Routes/Role/roleRoutes.js";
import ProductRoute from "../Routes/Product/productRoutes.js";
import CompanyRoute from "../Routes/Company/companyRoutes.js";
import FileTypeRoutes from "../Routes/FileType/fileTypeRoute.js";
import DesignationRoutes from "../Routes/Designation/designationRoutes.js";
import ProjectRoutes from "../Routes/Projects/projectRoutes.js"
import CompanyProductRoutes from "../Routes/CompanyProduct/CompanyProduct.js"
import Login from "../Routes/Login/login.js"
import ManagePagesRoutes from "../Routes/ManagePages/Managepages.js"
import Usereditroute from "../Routes/Useredit/UserEditRoute.js"
import ItemCategoryRoutes from "../Routes/ItemCategory/ItemCategoryRoute.js"
import MaterialSubCategoryTypeRoutes from "../Routes/MaterialSubCategoryType/MaterialSubCategoryTypeRoutes.js"
import materialRoutes from "../Routes/Material/MaterialRoutes.js";
import VendorRoutes from "../Routes/Vendor/VendorRoutes.js";
import locationTypeMasterRoutes from "../Routes/LocationTypeMaster/LocationTypeMasterRoutes.js";
import CompanyMasterRoutes from "../Routes/CompanyMaster/CompanyMasterRoutes.js"
import LocationMasterRoutes from "../Routes/LocationMaster/LocationMasterRoutes.js"
import GstRateRoutes from "../Routes/GstRate/GstRate.js"
import DepartmentRoutes from "../Routes/Department/DepartmentRoutes.js"
import viewPRPORoutes from "../Routes/ViewPRPO/ViewPRPORoutes.js"


const applyRoutes = (app) => {
app.use(backendHelpers.USER_CREATION, UserRoutes);   // written by  hithin
app.use(backendHelpers.LOGIN, Login);   // written by  hithin

app.use(backendHelpers.ROLES_CREATION, RoleRoutes); // written by  hithin
app.use(backendHelpers.FILE_TYPE,FileTypeRoutes);   // written by  hithin
app.use(backendHelpers.COMPANY_PRODUCT_CREATION, CompanyProductRoutes);   // written by  hithin
app.use(backendHelpers.PRODUCT_CREATION, ProductRoute);  //Done by kavya
app.use(backendHelpers.COMPANY_CREATION, CompanyRoute);  //Done by kavya
app.use(backendHelpers.DESIGNATION_CREATION, DesignationRoutes);  //Done by kavya
app.use(backendHelpers.PROJECT_CREATION, ProjectRoutes);  //Done by kavya
app.use(backendHelpers.MANAGE_PAGES, ManagePagesRoutes);  
app.use(backendHelpers.USER_EDIT,Usereditroute);

app.use(backendHelpers.ITEM_CATEGORY_CREATION, ItemCategoryRoutes);
app.use(backendHelpers.MATERIAL_SUB_CATEGORY_TYPE, MaterialSubCategoryTypeRoutes);  
app.use(backendHelpers.MATERIAL, materialRoutes);
app.use(backendHelpers.VENDOR, VendorRoutes);
app.use(backendHelpers.GST_RATE, GstRateRoutes);


app.use(backendHelpers.LOCATION_TYPE_MASTER, locationTypeMasterRoutes);
app.use(backendHelpers.COMPANY_MASTER, CompanyMasterRoutes);
app.use(backendHelpers.LOCATION_MASTER, LocationMasterRoutes);
app.use(backendHelpers.DEPARTMENT, DepartmentRoutes);
app.use(backendHelpers.VIEW_PRPO, viewPRPORoutes);
};

export default applyRoutes;