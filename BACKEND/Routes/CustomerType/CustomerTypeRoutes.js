
import express from "express";
import {
    getCustomerTypes,
    addCustomerTypeController,
    editCustomerTypeController,
    toggleCustomerTypeStatus
} from "../../Controllers/CustomerType/CustomerTypeController.js";

const router = express.Router();

router.post("/view", getCustomerTypes);
router.post("/add", addCustomerTypeController);
router.patch("/edit", editCustomerTypeController);
router.patch("/status", toggleCustomerTypeStatus);

export default router;
