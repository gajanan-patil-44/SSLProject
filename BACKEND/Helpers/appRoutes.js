import fs from "fs";
import * as backendHelpers from "../Helpers/Backend_Helpers.js";

import RoleRoutes from "../Routes/Role/roleRoutes.js";
import ProductRoute from "../Routes/Product/productRoutes.js";
import CompanyRoute from "../Routes/Company/companyRoutes.js";
import CompanyProductRoutes from "../Routes/CompanyProduct/companyProduct.js";

const applyRoutes = (app) => {
app.use(backendHelpers.ROLES_CREATION, RoleRoutes);
app.use(backendHelpers.PRODUCT_CREATION, ProductRoute);
app.use(backendHelpers.COMPANY_CREATION, CompanyRoute);
app.use(backendHelpers.COMPANY_PRODUCT_CREATION, CompanyProductRoutes);
};

export default applyRoutes;