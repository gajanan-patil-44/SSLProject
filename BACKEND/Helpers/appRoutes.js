import fs from "fs";
import * as backendHelpers from "../Helpers/Backend_Helpers.js";

import RoleRoutes from "../Routes/Role/roleRoutes.js";
import ProductRoute from "../Routes/Product/productRoutes.js";
import CompanyRoute from "../Routes/Company/companyRoutes.js";

const applyRoutes = (app) => {
    app.use(backendHelpers.ROLES_CREATION, RoleRoutes);
    app.use(backendHelpers.COMPANY_CREATION, CompanyRoute);
    app.use(backendHelpers.PRODUCT_CREATION, ProductRoute);

};

export default applyRoutes;