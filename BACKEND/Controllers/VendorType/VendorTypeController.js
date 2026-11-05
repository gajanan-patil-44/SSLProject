import {
    getAllVendorTypes,
    checkVendorTypeExists,
    checkVendorTypeExistsForUpdate,
    addVendorType,
    updateVendorType,
    updateVendorTypeStatus,
    checkCompanyExists
} from "../../Models/VendorType/VendorTypeModel.js";

// name and code validate
const validateNameAndCode = (data) => {
    if (!data.VendorTypeName || !String(data.VendorTypeName).trim()) {
        return "VendorTypeName is required";
    }
    if (String(data.VendorTypeName).length > 30) {
        return "VendorTypeName must not exceed 30 characters";
    }
    if (!/^[a-zA-Z ]+$/.test(data.VendorTypeName)) {
    return "VendorTypeName must contain only alphabets";
    } 
    if (!data.VendorCode || !String(data.VendorCode).trim()) {
        return "VendorCode is required";
    }
    if (String(data.VendorCode).length > 15) {
        return "VendorCode must not exceed 15 characters";
    }
    if (!/^[a-zA-Z0-9]+$/.test(data.VendorCode)) {
        return "VendorCode must contain only alphanumeric characters";
    }
    return null;
};

const bad = (res, message, code = 400) =>
    res.status(code).json({ status: "error", message });


// FLAG ID 1 - VIEW (POST)

export const getVendorTypes = async (req, res) => {
    const { FlagId, CompanyId } = req.body;
    try {
        if (parseInt(FlagId) !== 1) return bad(res, "Invalid FlagId.");

        const rows = await getAllVendorTypes(CompanyId ? Number(CompanyId) : null);
        return res.status(200).json({
            status: "success",
            message: "Vendor types fetched successfully",
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch vendor types",
            error: error.message
        });
    }
};


// FLAG ID 2 - ADD (POST)

export const addVendorTypeController = async (req, res) => {
    const { FlagId } = req.body;
    try {
        if (parseInt(FlagId) !== 2) return bad(res, "Invalid FlagId.");

        const data = req.body;
        data.VendorTypeName = data.VendorTypeName?.trim();
        data.VendorCode = data.VendorCode?.trim();

        const err = validateNameAndCode(data);
        if (err) return bad(res, err);

        if (!data.CompanyId) return bad(res, "CompanyId is required");
        data.CompanyId = Number(data.CompanyId);
        if (!Number.isSafeInteger(data.CompanyId) || data.CompanyId <= 0) {
            return bad(res, "A valid CompanyId is required");
        }
        const company = await checkCompanyExists(data.CompanyId);
        if (company.length === 0) return bad(res, "Invalid CompanyId");

        if (!data.CreatedByUserName) return bad(res, "CreatedByUserName is required");

        const existing = await checkVendorTypeExists(
            data.VendorTypeName, data.VendorCode, data.CompanyId
        );
        if (existing.length > 0) {
            const dup = existing[0];
            if (dup.VendorTypeName.toLowerCase() === data.VendorTypeName.toLowerCase()) {
                return bad(res, "Vendor type name already exists", 409);
            }
            return bad(res, "Vendor code already exists", 409);
        }

        const result = await addVendorType(data);
        return res.status(201).json({
            status: "success",
            message: "Vendor type added successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to add vendor type",
            error: error.message
        });
    }
};


// FLAG ID 3 - EDIT (PATCH)

export const editVendorTypeController = async (req, res) => {
    const { FlagId } = req.body;
    try {
        if (parseInt(FlagId) !== 3) return bad(res, "Invalid FlagId.");

        const data = req.body;
        data.VendorTypeName = data.VendorTypeName?.trim();
        data.VendorCode = data.VendorCode?.trim();

        if (!data.VendorTypeId) return bad(res, "VendorTypeId is required");

        const err = validateNameAndCode(data);
        if (err) return bad(res, err);

        if (!data.CompanyId) return bad(res, "CompanyId is required");
        if (!data.UpdatedByUserName) return bad(res, "UpdatedByUserName is required");

        const existing = await checkVendorTypeExistsForUpdate(
            data.VendorTypeName, data.VendorCode,
            Number(data.CompanyId), data.VendorTypeId
        );
        if (existing.length > 0) {
            const dup = existing[0];
            if (dup.VendorTypeName.toLowerCase() === data.VendorTypeName.toLowerCase()) {
                return bad(res, "Vendor type name already exists", 409);
            }
            return bad(res, "Vendor code already exists", 409);
        }

        const result = await updateVendorType(data);
        if (!result) return bad(res, "Vendor type not found", 404);

        return res.status(200).json({
            status: "success",
            message: "Vendor type updated successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update vendor type",
            error: error.message
        });
    }
};


// FLAG ID 4 - TOGGLE STATUS (PATCH)

export const toggleVendorTypeStatus = async (req, res) => {
    const { FlagId, VendorTypeId, IsDisabled, UpdatedByUserName } = req.body;
    try {
        if (parseInt(FlagId) !== 4) return bad(res, "Invalid FlagId.");

        if (!VendorTypeId) return bad(res, "VendorTypeId is required");
        if (typeof IsDisabled !== "boolean") {
            return bad(res, "IsDisabled must be true or false");
        }
        if (!UpdatedByUserName) return bad(res, "UpdatedByUserName is required");

        const result = await updateVendorTypeStatus(VendorTypeId, IsDisabled, UpdatedByUserName);
        if (!result) return bad(res, "Vendor type not found", 404);

        return res.status(200).json({
            status: "success",
            message: IsDisabled
                ? "Vendor type disabled successfully"
                : "Vendor type enabled successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update vendor type status",
            error: error.message
        });
    }
};
