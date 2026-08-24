import * as backendHelpers from "../Helpers/Backend_Helpers.js";

import UserRoutes from "../Routes/User/userRoutes.js";
import RoleRoutes from "../Routes/Role/roleRoutes.js";
import ProductRoute from "../Routes/Product/productRoutes.js";
import CompanyRoute from "../Routes/Company/companyRoutes.js";
import CompanyProductRoutes from "../Routes/CompanyProduct/companyProduct.js";
import FileTypeRoutes from "../Routes/FileType/fileTypeRoute.js";

const applyRoutes = (app) => {
app.use(backendHelpers.USER_CREATION, UserRoutes);
app.use(backendHelpers.ROLES_CREATION, RoleRoutes);
app.use(backendHelpers.PRODUCT_CREATION, ProductRoute);
app.use(backendHelpers.COMPANY_CREATION, CompanyRoute);
app.use(backendHelpers.FILE_TYPE,FileTypeRoutes);
app.use(backendHelpers.COMPANY_PRODUCT_CREATION, CompanyProductRoutes);

};

export default applyRoutes;