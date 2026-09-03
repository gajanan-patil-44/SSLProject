import * as backendHelpers from "../Helpers/Backend_Helpers.js";

import UserRoutes from "../Routes/User/userRoutes.js";
import RoleRoutes from "../Routes/Role/roleRoutes.js";
import ProductRoute from "../Routes/Product/productRoutes.js";
import CompanyRoute from "../Routes/Company/companyRoutes.js";
import FileTypeRoutes from "../Routes/FileType/fileTypeRoute.js";
import DesignationRoutes from "../Routes/Designation/designationRoutes.js";
import ProjectRoutes from "../Routes/Projects/projectRoutes.js"
import CompanyProductRoutes from "../Routes/CompanyProduct/CompanyProduct.js"
import Login from "../Routes/Login/login.js"

const applyRoutes = (app) => {
app.use(backendHelpers.USER_CREATION, UserRoutes);   // written by  hithin
app.use(backendHelpers.LOGIN, Login);   // written by  hithin

app.use(backendHelpers.ROLES_CREATION, RoleRoutes); // written by  hithin
app.use(backendHelpers.PRODUCT_CREATION, ProductRoute);
app.use(backendHelpers.COMPANY_CREATION, CompanyRoute);
app.use(backendHelpers.FILE_TYPE,FileTypeRoutes);   // written by  hithin
app.use(backendHelpers.COMPANY_PRODUCT_CREATION, CompanyProductRoutes);   // written by  hithin
app.use(backendHelpers.DESIGNATION_CREATION, DesignationRoutes);
app.use(backendHelpers.PROJECT_CREATION, ProjectRoutes);

};

export default applyRoutes;