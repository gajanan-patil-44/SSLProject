import * as backendHelpers from "./Backend_Helpers.js";

import BirthdayRoutes from "../../BIRTHDAY/Routes/birthdayRoutes.js";

const applyRoutes = (app) => {
    app.use(backendHelpers.BIRTHDAY_EMAILS, BirthdayRoutes);
}

export default applyRoutes;