import {
    getAllVendors,
    getVendorTypeDropdown,
    getVendorFileTypeDropdown,
    addVendor,
    updateVendor,
    updateVendorStatus,
    fetchVendorFilePath
} from "../../Models/Vendor/VendorModel.js";

import path from "path";
import fs from "fs";

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

    // =========================================
    // REQUIRED FIELDS
    // =========================================
    const requiredFields = [
        "VendorName",
        "VendorCode",
        "ContactPerson",
        "MobileNumber",
        "Email",
        "GSTINUINNumber",
        "City",
        "VendorAddress1",
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

    // =========================================
    // VENDOR NAME
    // =========================================
    data.VendorName = data.VendorName.trim();

    if (
        data.VendorName.length > 250 ||
        !/^[a-zA-Z\s]+$/.test(data.VendorName)
    ) {
        return "VendorName must contain only alphabets and spaces and cannot exceed 250 characters";
    }

    // =========================================
    // VENDOR CODE
    // =========================================
    data.VendorCode = data.VendorCode.trim();

    if (data.VendorCode.length > 150) {
        return "VendorCode cannot exceed 150 characters";
    }

    // =========================================
    // CONTACT PERSON
    // =========================================
    data.ContactPerson = data.ContactPerson.trim();

    if (!/^[a-zA-Z\s.'-]+$/.test(data.ContactPerson)) {
        return "ContactPerson must contain only alphabets and spaces";
    }

    // =========================================
    // MOBILE NUMBER
    // =========================================
    data.MobileNumber = data.MobileNumber.trim();

    if (!/^[6-9]\d{9}$/.test(data.MobileNumber)) {
        return "Please enter a valid 10-digit mobile number";
    }

    // =========================================
    // EMAIL
    // =========================================
    data.Email = data.Email.trim().toLowerCase();

    const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(data.Email) || data.Email.length > 75) {
        return "Please enter a valid Email Address (maximum 75 characters)";
    }

    // =========================================
    // GSTIN / UIN
    // =========================================
    data.GSTINUINNumber = data.GSTINUINNumber.trim().toUpperCase();

    const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

    if (!gstinRegex.test(data.GSTINUINNumber)) {
        return "Please enter a valid 15-character GSTIN/UIN Number";
    }

    // =========================================
    // CITY
    // =========================================
    data.City = data.City.trim();

    if (!/^[a-zA-Z\s.'-]+$/.test(data.City)) {
        return "City must contain only alphabets and spaces";
    }

    // =========================================
    // ADDRESS LINE 1
    // =========================================
    data.VendorAddress1 = data.VendorAddress1.trim();

    // =========================================
    // VENDOR TYPE ID
    // =========================================
    data.VendorTypeId = Number(data.VendorTypeId);

    if (!Number.isSafeInteger(data.VendorTypeId) || data.VendorTypeId <= 0) {
        return "A valid VendorTypeId is required";
    }

    // =========================================
    // COMPANY ID (OPTIONAL)
    // =========================================
    if (data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId !== "") {
        data.CompanyId = Number(data.CompanyId);

        if (!Number.isSafeInteger(data.CompanyId) || data.CompanyId <= 0) {
            return "A valid CompanyId is required";
        }
    } else {
        data.CompanyId = null;
    }

    // =========================================
    // OPTIONAL FIELDS
    // =========================================
    data.BankName = data.BankName?.trim() || null;
    data.AccountHolderName = data.AccountHolderName?.trim() || null;
    data.VendorAddress2 = data.VendorAddress2?.trim() || null;
    data.Remarks = data.Remarks?.trim() || null;

    // =========================================
    // OPTIONAL IFSC CODE
    // =========================================
    data.IFSCCode = data.IFSCCode?.trim().toUpperCase() || null;

    if (
        data.IFSCCode &&
        !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.IFSCCode)
    ) {
        return "Please enter a valid 11-character IFSC Code";
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

       

            const CompanyId = req.user?.CompanyId ?? null;

            const data = await getAllVendors(CompanyId);

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
    const { FlagId, CompanyId } = req.body;

    try {
        // =========================================
        // FLAG ID 2: VENDOR TYPE DROPDOWN
        // =========================================
        if (parseInt(FlagId) === 2) {
            const companyId = CompanyId === undefined || CompanyId === ""
                ? null
                : CompanyId === null
                    ? null
                    : Number(CompanyId);

            const vendorTypes = await getVendorTypeDropdown(companyId);

            return res.status(200).json({
                status: "success",
                message: "Vendor types fetched successfully",
                data: {
                    VendorTypes: vendorTypes
                }
            });
        }

        // =========================================
        // FLAG ID 3: VENDOR FILE TYPE DROPDOWN
        // =========================================
        if (parseInt(FlagId) === 3) {
            const vendorFileTypes = await getVendorFileTypeDropdown();

            return res.status(200).json({
                status: "success",
                message: "Vendor file types fetched successfully",
                data: {
                    VendorFileTypes: vendorFileTypes
                }
            });
        }

        // =========================================
        // INVALID FLAG ID
        // =========================================
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
        if (parseInt(FlagId) === 4) {

            const data = req.body;

            // =========================================
            // GET COMPANY ID FROM AUTHENTICATED USER
            // =========================================
            data.CompanyId = req.user?.CompanyId ?? null;

            // =========================================
            // VALIDATE VENDOR
            // =========================================
            const validationError = validateVendor(data);

            if (validationError) {
                return res.status(400).json({
                    status: "error",
                    message: validationError
                });
            }

            // =========================================
            // GET CREATED BY USER ID FROM AUTHENTICATION
            // =========================================
            const createdByUserId = Number(req.user?.UserId);

            if (
                !Number.isSafeInteger(createdByUserId) ||
                createdByUserId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "A valid CreatedByUserId is required"
                });
            }

            data.CreatedByUserId = createdByUserId;

            // =========================================
            // PREPARE UPLOADED VENDOR FILES
            // =========================================
            const files = prepareVendorFiles(req);

            // =========================================
            // CHECK COMPULSORY FILE TYPES
            // =========================================
            const uploadedFileTypeIds = files.map(file =>
                Number(file.VendorFileTypeId)
            );

            if (!uploadedFileTypeIds.includes(1)) {
                return res.status(400).json({
                    status: "error",
                    message: "Vendor File Type 1 is compulsory"
                });
            }

            if (!uploadedFileTypeIds.includes(2)) {
                return res.status(400).json({
                    status: "error",
                    message: "Vendor File Type 2 is compulsory"
                });
            }

            // =========================================
            // INSERT VENDOR AND FILES
            // =========================================
            const result = await addVendor(data, files);

            return res.status(201).json({
                status: "success",
                message: "Vendor added successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 4."
        });

    } catch (error) {

        console.error("Create vendor error:", error);

        if (
            error.message.startsWith("VendorFileTypeIds") ||
            error.message.startsWith("Provide one VendorFileTypeId") ||
            error.message.startsWith("Uploaded") ||
            error.message.startsWith("Invalid VendorFileTypeId")
        ) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

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
        if (parseInt(FlagId) === 5) {

            const data = req.body;

            // =========================================
            // GET COMPANY ID FROM AUTHENTICATED USER
            // =========================================
            data.CompanyId = req.user?.CompanyId ?? null;

            // =========================================
            // COMMON VENDOR VALIDATION
            // =========================================
            const validationError = validateVendor(data);

            if (validationError) {
                return res.status(400).json({
                    status: "error",
                    message: validationError
                });
            }

            // =========================================
            // VENDOR ID VALIDATION
            // =========================================
            const vendorId = Number(data.VendorId);

            if (!Number.isSafeInteger(vendorId) || vendorId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "A valid VendorId is required"
                });
            }

            data.VendorId = vendorId;

            // =========================================
            // GET UPDATED BY USER ID FROM AUTHENTICATED USER
            // =========================================
            const updatedByUserId = Number(req.user?.UserId);

            if (
                !Number.isSafeInteger(updatedByUserId) ||
                updatedByUserId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "A valid UpdatedByUserId is required"
                });
            }

            data.UpdatedByUserId = updatedByUserId;

            // =========================================
            // PREPARE VENDOR FILES
            // =========================================
            const files = prepareVendorFiles(req);

            // =========================================
            // UPDATE VENDOR
            // =========================================
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
            message: "Invalid FlagId. Use FlagId 5."
        });

    } catch (error) {

        console.error("Edit Vendor Error:", error);

        if (
            error.message.startsWith("VendorFileTypeIds") ||
            error.message.startsWith("Provide one VendorFileTypeId") ||
            error.message.startsWith("Uploaded") ||
            error.message.startsWith("Invalid VendorFileTypeId")
        ) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

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
        if (parseInt(FlagId) === 6) {
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

export const viewVendorFile = async (req, res) => {
    const { FlagId, VendorFileId } = req.body || {};

    try {
        if (parseInt(FlagId) === 6) {

            // Validate VendorFileId
            if (
                VendorFileId === undefined ||
                VendorFileId === null ||
                String(VendorFileId).trim() === "" ||
                !Number.isSafeInteger(Number(VendorFileId)) ||
                Number(VendorFileId) <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "A valid VendorFileId is required"
                });
            }

            // Fetch file path from database
            const files = await fetchVendorFilePath(
                Number(VendorFileId)
            );

            if (!files || files.length === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Vendor file not found"
                });
            }

            const filePath = files[0].VendorFilePath;

            if (typeof filePath !== "string" || !filePath.trim()) {
                return res.status(404).json({
                    status: "error",
                    message: "Vendor file path not available"
                });
            }

            // Same directory used for vendor uploads
            const uploadDirectory = path.resolve(
                process.env.VENDOR_UPLOAD_DIR || "./uploads/Vendors"
            );

            // Get stored filename
            const fileName = path.basename(
                filePath.trim().replace(/\\/g, "/")
            );

            const absolutePath = path.join(
                uploadDirectory,
                fileName
            );

            // Validate supported file types
            const ext = path.extname(fileName).toLowerCase();

            const contentTypes = {
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".webp": "image/webp",
                ".pdf": "application/pdf"
            };

            if (!contentTypes[ext]) {
                return res.status(400).json({
                    status: "error",
                    message: "Unsupported vendor file type"
                });
            }

            // Check file exists
            let fileStats;

            try {
                fileStats = await fs.promises.stat(absolutePath);
            } catch (error) {
                if (error.code === "ENOENT") {
                    return res.status(404).json({
                        status: "error",
                        message: "Vendor file does not exist on server"
                    });
                }

                throw error;
            }

            if (!fileStats.isFile()) {
                return res.status(404).json({
                    status: "error",
                    message: "Vendor file not found on server"
                });
            }

            // Display image or PDF inline
            res.setHeader("Content-Type", contentTypes[ext]);

            res.setHeader(
                "Content-Disposition",
                `inline; filename="${fileName}"`
            );

            res.setHeader("X-Content-Type-Options", "nosniff");

            const fileStream = fs.createReadStream(absolutePath);

            fileStream.on("error", (error) => {
                console.error("Vendor file stream error:", error);

                if (!res.headersSent) {
                    return res.status(500).json({
                        status: "error",
                        message: "Unable to read vendor file"
                    });
                }

                res.destroy(error);
            });

            return fileStream.pipe(res);
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 6."
        });

    } catch (error) {
        console.error("View vendor file error:", error);

        if (res.headersSent) {
            return res.end();
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to view vendor file",
            error: error.message
        });
    }
};