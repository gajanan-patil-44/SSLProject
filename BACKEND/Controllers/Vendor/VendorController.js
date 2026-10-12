import {
    getAllVendors,
    getVendorTypeDropdown,
    getVendorFileTypeDropdown,
    addVendor,
    updateVendor,
    updateVendorStatus
} from "../../Models/Vendor/VendorModel.js";

import path from "path";

// =====================================================
// HELPER - PREPARE OPTIONAL VENDOR FILES
// =====================================================

const prepareVendorFiles = (req) => {
    const uploadedFiles = req.files || [];
    const rawIds = req.body.VendorFileTypeIds;

    if (uploadedFiles.length === 0) {
        if (rawIds !== undefined) {
            throw new Error(
                "VendorFileTypeIds were provided without files"
            );
        }

        return [];
    }

    if (rawIds === undefined) {
        throw new Error(
            "Provide one VendorFileTypeId for every uploaded file"
        );
    }

    const ids = Array.isArray(rawIds) ? rawIds : [rawIds];

    if (ids.length !== uploadedFiles.length) {
        throw new Error(
            `Uploaded ${uploadedFiles.length} files, but received ${ids.length} VendorFileTypeIds`
        );
    }

    return uploadedFiles.map((file, index) => {
        const VendorFileTypeId = Number(ids[index]);

        if (
            !Number.isSafeInteger(VendorFileTypeId) ||
            VendorFileTypeId <= 0
        ) {
            throw new Error(
                `Invalid VendorFileTypeId at position ${index + 1}`
            );
        }

        return {
            VendorFileTypeId,
            VendorFilePath: path.join(
                "uploads",
                "Vendors",
                file.filename
            ).replace(/\\/g, "/")
        };
    });
};

// =====================================================
// HELPER - REQUIRED FIELD VALIDATION
// =====================================================

const validateVendor = (data) => {
    const requiredFields = [
        "VendorName",
        "VendorCode",
        "MobileNumber",
        "GSTINUINNumber",
        "VendorTypeId"
    ];

    for (const field of requiredFields) {
        if (
            data[field] === undefined ||
            data[field] === null ||
            String(data[field]).trim() === ""
        ) {
            return `${field} is required`;
        }
    }

    if (
        !Number.isSafeInteger(Number(data.VendorTypeId)) ||
        Number(data.VendorTypeId) <= 0
    ) {
        return "A valid VendorTypeId is required";
    }

    if (String(data.MobileNumber).trim().length > 12) {
        return "MobileNumber cannot exceed 12 characters";
    }

    if (String(data.VendorName).trim().length > 250) {
        return "VendorName cannot exceed 250 characters";
    }

    if (String(data.VendorCode).trim().length > 150) {
        return "VendorCode cannot exceed 150 characters";
    }

    if (String(data.GSTINUINNumber).trim().length > 20) {
        return "GSTINUINNumber cannot exceed 20 characters";
    }

    if (data.Email && String(data.Email).length > 75) {
        return "Email cannot exceed 75 characters";
    }

    return null;
};

// =====================================================
// FLAG ID 1 - VIEW ALL VENDORS
// =====================================================

export const getVendors = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 1) {
            const data = await getAllVendors();

            return res.status(200).json({
                status: "success",
                message: "Vendors fetched successfully",
                data
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Get vendors error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch vendors",
            error: error.message
        });
    }
};

// =====================================================
// FLAG ID 2 - FETCH VENDOR DROPDOWNS
// =====================================================

export const getVendorDropdowns = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 2) {
            const [vendorTypes, vendorFileTypes] = await Promise.all([
                getVendorTypeDropdown(),
                getVendorFileTypeDropdown()
            ]);

            return res.status(200).json({
                status: "success",
                message: "Vendor dropdowns fetched successfully",
                data: {
                    VendorTypes: vendorTypes,
                    VendorFileTypes: vendorFileTypes
                }
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Vendor dropdown error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch vendor dropdowns",
            error: error.message
        });
    }
};

// =====================================================
// FLAG ID 3 - ADD VENDOR
// =====================================================

export const createVendor = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 3) {
            const data = req.body;

            const validationError = validateVendor(data);

            if (validationError) {
                return res.status(400).json({
                    status: "error",
                    message: validationError
                });
            }

            const files = prepareVendorFiles(req);
            const result = await addVendor(data, files);

            return res.status(201).json({
                status: "success",
                message: "Vendor added successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to add vendor",
            error: error.message
        });
    }
};

// =====================================================
// FLAG ID 4 - EDIT VENDOR
// =====================================================

export const editVendor = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 4) {
            const data = req.body;

            if (!data.VendorId) {
                return res.status(400).json({
                    status: "error",
                    message: "VendorId is required"
                });
            }

            const validationError = validateVendor(data);

            if (validationError) {
                return res.status(400).json({
                    status: "error",
                    message: validationError
                });
            }

            const files = prepareVendorFiles(req);
            const result = await updateVendor(data, files);

            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Vendor not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Vendor updated successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update vendor",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 5 - ENABLE / DISABLE VENDOR
// =====================================================
export const updateVendorStatusController = async (req, res) => {
    const { FlagId, VendorId, IsDisabled } = req.body;

    try {
        if (parseInt(FlagId) === 5) {
            const result = await updateVendorStatus(VendorId, IsDisabled);

            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Vendor not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: IsDisabled
                    ? "Vendor disabled successfully"
                    : "Vendor enabled successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Vendor status error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update vendor status",
            error: error.message
        });
    }
};