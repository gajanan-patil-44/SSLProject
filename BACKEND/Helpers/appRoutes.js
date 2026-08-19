import fs from "fs";
import * as backendHelpers from "../Helpers/Backend_Helpers.js";

import RoleRoutes from "../Routes/Role/roleRoutes.js";

const applyRoutes = (app) => {
app.use(backendHelpers.ROLES_CREATION, RoleRoutes);

};

export default applyRoutes;