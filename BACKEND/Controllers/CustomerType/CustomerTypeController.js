
import {
    getAllCustomerTypes,
    checkCustomerTypeExists,
    checkCustomerTypeExistsForUpdate,
    addCustomerType,
    updateCustomerType,
    updateCustomerTypeStatus
} from "../../Models/CustomerType/CustomerTypeModel.js";

// Validate Customer Type Name and Code
const validateNameAndCode = (data) => {
    if (!data.CustomerTypeName || !String(data.CustomerTypeName).trim()) {
        return "CustomerTypeName is required";
    }

    if (String(data.CustomerTypeName).length > 150) {
        return "CustomerTypeName must not exceed 150 characters";
    }

    if (!/^[a-zA-Z ]+$/.test(data.CustomerTypeName)) {
        return "CustomerTypeName must contain only alphabets";
    }

    if (!data.CustomerTypeCode || !String(data.CustomerTypeCode).trim()) {
        return "CustomerTypeCode is required";
    }

    if (String(data.CustomerTypeCode).length > 100) {
        return "CustomerTypeCode must not exceed 100 characters";
    }

    if (!/^[a-zA-Z0-9]+$/.test(data.CustomerTypeCode)) {
        return "CustomerTypeCode must contain only alphanumeric characters";
    }

    return null;
};

const bad = (res, message, code = 400) =>
    res.status(code).json({ status: "error", message });


// FLAG ID 1 - VIEW (POST)

export const getCustomerTypes = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) !== 1) return bad(res, "Invalid FlagId.");

        const rows = await getAllCustomerTypes();

        return res.status(200).json({
            status: "success",
            message: "Customer types fetched successfully",
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch customer types",
            error: error.message
        });
    }
};


// FLAG ID 2 - ADD (POST)

export const addCustomerTypeController = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) !== 2) return bad(res, "Invalid FlagId.");

        const data = req.body;

        data.CustomerTypeName = data.CustomerTypeName?.trim();
        data.CustomerTypeCode = data.CustomerTypeCode?.trim();

        const err = validateNameAndCode(data);
        if (err) return bad(res, err);

        if (typeof data.GstApplicable !== "boolean") {
            if (data.GstApplicable === undefined) {
                data.GstApplicable = false;
            } else {
                return bad(res, "GstApplicable must be true or false");
            }
        }

        if (data.Description != null && typeof data.Description !== "string") {
            return bad(res, "Description must be a string");
        }

        if (!data.CreatedByUserName || !String(data.CreatedByUserName).trim()) {
            return bad(res, "CreatedByUserName is required");
        }

        data.CreatedByUserName = data.CreatedByUserName.trim();

        const existing = await checkCustomerTypeExists(data.CustomerTypeCode);

        if (existing.length > 0) {
            return bad(res, "Customer type code already exists", 409);
        }

        const result = await addCustomerType(data);

        return res.status(201).json({
            status: "success",
            message: "Customer type added successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to add customer type",
            error: error.message
        });
    }
};


// FLAG ID 3 - EDIT (PATCH)

export const editCustomerTypeController = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) !== 3) return bad(res, "Invalid FlagId.");

        const data = req.body;

        data.CustomerTypeName = data.CustomerTypeName?.trim();
        data.CustomerTypeCode = data.CustomerTypeCode?.trim();

        if (!data.CustomerTypeId) {
            return bad(res, "CustomerTypeId is required");
        }

        data.CustomerTypeId = Number(data.CustomerTypeId);

        if (!Number.isSafeInteger(data.CustomerTypeId) || data.CustomerTypeId <= 0) {
            return bad(res, "A valid CustomerTypeId is required");
        }

        const err = validateNameAndCode(data);
        if (err) return bad(res, err);

        if (typeof data.GstApplicable !== "boolean") {
            return bad(res, "GstApplicable must be true or false");
        }

        if (data.Description != null && typeof data.Description !== "string") {
            return bad(res, "Description must be a string");
        }

        if (!data.UpdatedByUserName || !String(data.UpdatedByUserName).trim()) {
            return bad(res, "UpdatedByUserName is required");
        }

        data.UpdatedByUserName = data.UpdatedByUserName.trim();

        const existing = await checkCustomerTypeExistsForUpdate(
            data.CustomerTypeCode,
            data.CustomerTypeId
        );

        if (existing.length > 0) {
            return bad(res, "Customer type code already exists", 409);
        }

        const result = await updateCustomerType(data);

        if (!result) return bad(res, "Customer type not found", 404);

        return res.status(200).json({
            status: "success",
            message: "Customer type updated successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update customer type",
            error: error.message
        });
    }
};


// FLAG ID 4 - TOGGLE STATUS (PATCH)

export const toggleCustomerTypeStatus = async (req, res) => {
    const { FlagId, CustomerTypeId, IsDisabled, UpdatedByUserName } = req.body;

    try {
        if (parseInt(FlagId) !== 4) return bad(res, "Invalid FlagId.");

        const id = Number(CustomerTypeId);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return bad(res, "A valid CustomerTypeId is required");
        }

        if (typeof IsDisabled !== "boolean") {
            return bad(res, "IsDisabled must be true or false");
        }

        if (!UpdatedByUserName || !String(UpdatedByUserName).trim()) {
            return bad(res, "UpdatedByUserName is required");
        }

        const result = await updateCustomerTypeStatus(
            id,
            IsDisabled,
            UpdatedByUserName.trim()
        );

        if (!result) return bad(res, "Customer type not found", 404);

        return res.status(200).json({
            status: "success",
            message: IsDisabled
                ? "Customer type disabled successfully"
                : "Customer type enabled successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update customer type status",
            error: error.message
        });
    }
};
