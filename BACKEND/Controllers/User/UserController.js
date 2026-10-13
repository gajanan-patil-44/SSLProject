import bcrypt from "bcrypt";
import {
    getGenderDropdown,
    getMaritalStatusDropdown,
    getDesignationDropdown,
    checkLoginNameExists,
    checkEmailExists,
    checkPhoneNumberExists,
    checkEmployeeIdExists,
    createUser,
    getCompanyDropdown,
    getProductDropdown,
    getProjectDropdown,
    getRoleDropdown,
    getUserReportingManagerDropdown,
    getDesignationById


} from "../../Models/UserModels.js";
import { readFile } from "fs/promises";
import { processUserFilesUsingWorker } from "../../Helpers/userFileWorkerHelper.js";

import { getAllUserDetails, editUserdetails } from "../../Models/userEditDetails/UserEdit.js";
// =====================================================
// USER DROPDOWNS
// FlagId 1 = Gender
// FlagId 2 = Marital Status
// FlagId 3 = Designation
// =====================================================



//import {getAllGenders, getAllMaritalStatuses, getAllDesignations, getAllCompanies, getAllReportingManagers, getAllCompanyProducts, getAllProjects, getAllRoles} from "../../Models/UserModels.js";



export const userDropdownController = async (req, res) => {

    const { FlagId, CompanyId, DesignationId } = req.body;

    try {
        // ==========================================
        // VALIDATE FLAG ID
        // ==========================================

        if (!FlagId) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }
        // ==========================================
        // FLAG 1 = GENDER
        // ==========================================
        if (parseInt(FlagId) === 1) {
            const result = await getGenderDropdown();
            return res.status(200).json({
                status: "success",
                message: "Gender data fetched successfully",
                data: result
            });
        }
        // ==========================================
        // FLAG 2 = MARITAL STATUS
        // ==========================================

        if (parseInt(FlagId) === 2) {
            const result = await getMaritalStatusDropdown();
            return res.status(200).json({
                status: "success",
                message: "Marital status data fetched successfully",
                data: result
            });
        }
        // ==========================================
        // FLAG 3 = DESIGNATION
        // ==========================================

        if (parseInt(FlagId) === 3) {
            const result = await getDesignationDropdown();
            return res.status(200).json({
                status: "success",
                message: "Designation data fetched successfully",
                data: result
            });
        }
        // ==========================================
        // FLAG 4 = USER REPORTING MANAGER
        // ==========================================
        if (parseInt(FlagId) === 4) {
            const result = await getUserReportingManagerDropdown(CompanyId, DesignationId);
            return res.status(200).json({
                status: "success",
                message: "User reporting manager data fetched successfully",
                data: result
            });
        }
        // ==========================================
        // INVALID FLAG
        // ==========================================
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch user dropdown",
            error: error.message
        });
    }
};
// ==========================================================
// CREATE USER
// ==========================================================
export const createUserController = async (req, res) => {
    try {
        // ==========================================================
        // FORM DATA
        // ==========================================================

        const userData = req.body;

        // ==========================================================
        // EMPTY VALUE CHECK
        // ==========================================================

        const isEmpty = (value) =>
            value === undefined ||
            value === null ||
            value === "";

        // ==========================================================
        // COMMON REQUIRED FIELDS
        // ==========================================================

        const requiredFields = [
            "EmployeeId",
            "FirstName",
            "PhoneNumber",
            "DateOfBirth",
            "DateOfJoining",
            "GenderId",
            "MaritalStatusId",
            "Email",
            "LoginName",
            "Password",
            "RoleId",
            "CreatedByUserName"
        ];

        for (const field of requiredFields) {
            if (isEmpty(userData[field])) {
                return res.status(400).json({
                    status: "error",
                    message: `${field} is required`
                });
            }
        }

        // ==========================================================
        // ROLE ID
        // ==========================================================

        userData.RoleId = Number(userData.RoleId);

        if (
            !Number.isInteger(userData.RoleId) ||
            userData.RoleId <= 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "RoleId must be a valid number"
            });
        }

        // ==========================================================
        // PARSE FORM-DATA ARRAY FIELDS
        // ==========================================================

        const arrayFields = [
            "CompanyProductId",
            "ProjectId",
            "ReportingManagerUserId"
        ];

        for (const field of arrayFields) {
            if (isEmpty(userData[field])) {
                userData[field] = null;
                continue;
            }

            if (typeof userData[field] === "string") {
                try {
                    userData[field] = JSON.parse(userData[field]);
                } catch (error) {
                    return res.status(400).json({
                        status: "error",
                        message: `${field} must be a valid JSON array`
                    });
                }
            }

            if (!Array.isArray(userData[field])) {
                return res.status(400).json({
                    status: "error",
                    message: `${field} must be an array`
                });
            }
        }

        // ==========================================================
        // ROLE ID = 1 : SUPER ADMIN
        // ==========================================================

        if (userData.RoleId === 1) {
            userData.CompanyId = null;
            userData.CompanyProductId = null;
            userData.ProjectId = null;
            userData.ReportingManagerUserId = null;
            userData.DesignationId = null;
        }

        // ==========================================================
        // ROLE ID = 2 : ADMIN
        // ==========================================================

        else if (userData.RoleId === 2) {
            if (isEmpty(userData.CompanyId)) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            userData.CompanyId = Number(userData.CompanyId);

            if (
                !Number.isInteger(userData.CompanyId) ||
                userData.CompanyId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId must be a valid number"
                });
            }

            userData.CompanyProductId = null;
            userData.ProjectId = null;
            userData.ReportingManagerUserId = null;
            userData.DesignationId = null;
        }

        // ==========================================================
        // ROLE ID > 2 : NORMAL USER
        // ==========================================================

        else {
            // ------------------------------------------------------
            // COMPANY ID
            // ------------------------------------------------------

            if (isEmpty(userData.CompanyId)) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            userData.CompanyId = Number(userData.CompanyId);

            if (
                !Number.isInteger(userData.CompanyId) ||
                userData.CompanyId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId must be a valid number"
                });
            }

            // ------------------------------------------------------
            // COMPANY PRODUCT
            // ------------------------------------------------------

            if (
                !Array.isArray(userData.CompanyProductId) ||
                userData.CompanyProductId.length === 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "CompanyProductId must be a non-empty array"
                });
            }

            // ------------------------------------------------------
            // PROJECT
            // ------------------------------------------------------

            if (
                !Array.isArray(userData.ProjectId) ||
                userData.ProjectId.length === 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProjectId must be a non-empty array"
                });
            }

            // ------------------------------------------------------
            // DESIGNATION
            // ------------------------------------------------------

            if (isEmpty(userData.DesignationId)) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationId is required"
                });
            }

            userData.DesignationId = Number(userData.DesignationId);

            if (
                !Number.isInteger(userData.DesignationId) ||
                userData.DesignationId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationId must be a valid number"
                });
            }

            // ------------------------------------------------------
            // REPORTING MANAGER
            // Managing Director does not require a manager
            // ------------------------------------------------------

            const designation = await getDesignationById(
                userData.DesignationId
            );

            if (!designation) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid DesignationId"
                });
            }

            if (
                String(designation.DesignationName || "")
                    .trim()
                    .toLowerCase() === "managing director"
            ) {
                userData.ReportingManagerUserId = null;
            } else {
                if (
                    !Array.isArray(userData.ReportingManagerUserId) ||
                    userData.ReportingManagerUserId.length === 0
                ) {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "ReportingManagerUserId must be a non-empty array"
                    });
                }
            }
        }

        // ==========================================================
        // CONVERT COMPANY PRODUCT IDS
        // ==========================================================

        if (Array.isArray(userData.CompanyProductId)) {
            userData.CompanyProductId =
                userData.CompanyProductId.map(Number);

            for (const id of userData.CompanyProductId) {
                if (!Number.isInteger(id) || id <= 0) {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "CompanyProductId must contain valid numeric IDs"
                    });
                }
            }
        }

        // ==========================================================
        // CONVERT PROJECT IDS
        // ==========================================================

        if (Array.isArray(userData.ProjectId)) {
            userData.ProjectId = userData.ProjectId.map(Number);

            for (const id of userData.ProjectId) {
                if (!Number.isInteger(id) || id <= 0) {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "ProjectId must contain valid numeric IDs"
                    });
                }
            }
        }

        // ==========================================================
        // CONVERT REPORTING MANAGER IDS
        // ==========================================================

        if (Array.isArray(userData.ReportingManagerUserId)) {
            userData.ReportingManagerUserId =
                userData.ReportingManagerUserId.map(Number);

            for (const id of userData.ReportingManagerUserId) {
                if (!Number.isInteger(id) || id <= 0) {
                    return res.status(400).json({
                        status: "error",
                        message:
                            "ReportingManagerUserId must contain valid numeric IDs"
                    });
                }
            }
        }

        // ==========================================================
        // OTHER NUMERIC FIELDS
        // ==========================================================

        const numericFields = [
            "GenderId",
            "MaritalStatusId"
        ];

        for (const field of numericFields) {
            userData[field] = Number(userData[field]);

            if (
                !Number.isInteger(userData[field]) ||
                userData[field] <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: `${field} must be a valid number`
                });
            }
        }

        // ==========================================================
        // DUPLICATE CHECKS
        // ==========================================================

        const duplicateFields = {
            Email: {
                check: checkEmailExists,
                message: "Email already exists"
            },
            LoginName: {
                check: checkLoginNameExists,
                message: "Login name already exists"
            },
            PhoneNumber: {
                check: checkPhoneNumberExists,
                message: "Phone number already exists"
            },
            EmployeeId: {
                check: checkEmployeeIdExists,
                message: "Employee ID already exists",
                transform: (value) => String(value)
            }
        };

        for (const field of Object.keys(duplicateFields)) {
            const config = duplicateFields[field];

            let value = userData[field];

            if (config.transform) {
                value = config.transform(value);
            }

            const existingRecord = await config.check(value);

            if (existingRecord.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: config.message
                });
            }
        }

        // ==========================================================
        // HASH PASSWORD
        // ==========================================================

        const plainPassword = userData.Password;

        const hashedPassword = await bcrypt.hash(
            plainPassword,
            10
        );

        userData.Password = hashedPassword;
        userData.PlainPassword = plainPassword;
        userData.HashedPassword = hashedPassword;

        // ==========================================================
        // GET UPLOADED FILES
        // Supports multer array() and fields()
        // ==========================================================

        const uploadedFiles = Array.isArray(req.files)
            ? req.files
            : Object.values(req.files || {}).flat();

        // ==========================================================
        // PHOTO - CONVERT TO BINARY BUFFER
        // NO BASE64 CONVERSION
        // ==========================================================

        const uploadedPhoto = uploadedFiles.find(
            (file) => file.fieldname === "Photo"
        );

        // Photo is optional
        userData.Photo = null;

        if (uploadedPhoto) {
            if (uploadedPhoto.buffer) {
                // Memory storage already provides binary data
                userData.Photo = uploadedPhoto.buffer;
            } else if (uploadedPhoto.path) {
                // Disk storage: read actual binary file contents
                userData.Photo = await readFile(uploadedPhoto.path);
            } else {
                return res.status(400).json({
                    status: "error",
                    message:
                        "Photo was uploaded but its binary data could not be read"
                });
            }

            // Verify binary data before calling the model
            console.log("Photo binary verification:", {
                fieldname: uploadedPhoto.fieldname,
                mimetype: uploadedPhoto.mimetype,
                size: userData.Photo.length,
                isBuffer: Buffer.isBuffer(userData.Photo)
            });

            if (
                !Buffer.isBuffer(userData.Photo) ||
                userData.Photo.length === 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "Photo binary data is empty or invalid"
                });
            }
        }

        // ==========================================================
        // USER FILES
        // ==========================================================

        const uploadedUserFiles = uploadedFiles.filter(
            (file) => file.fieldname === "UserFile"
        );

        const fileTypeIds = Array.isArray(userData.FileTypeId)
            ? userData.FileTypeId
            : userData.FileTypeId
                ? [userData.FileTypeId]
                : [];

        if (uploadedUserFiles.length !== fileTypeIds.length) {
            return res.status(400).json({
                status: "error",
                message:
                    "Each UserFile must have a corresponding FileTypeId"
            });
        }

        userData.UserFiles = uploadedUserFiles.map(
            (file, index) => ({
                FileTypeId: Number(fileTypeIds[index]),
                FilePath: file.path
            })
        );

        // ==========================================================
        // CREATE USER
        // ==========================================================

        const createdUser = await createUser(
            userData,
            req.files
        );

        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(201).json({
            status: "success",
            message: "User created successfully"
        });

    } catch (error) {
        console.error("Create User Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};
// ==========================================================
// COMPANY / PRODUCT / PROJECT DROPDOWN
//
// FlagId = 1 -> Company
// FlagId = 2 -> Product
// FlagId = 3 -> Project
// ==========================================================
export const companyProductProjectDropdownController = async (req, res) => {
    const { FlagId, CompanyId, CompanyProductId } = req.body;
    try {
        // =================================================
        // FLAG ID VALIDATION
        // ==================================================
        if (FlagId === undefined || FlagId === null || String(FlagId).trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }
        // ==================================================
        // FLAG ID 1 - COMPANY
        // ==================================================
        if (parseInt(FlagId) === 1) {
            const result = await getCompanyDropdown();
            return res.status(200).json({
                status: "success",
                message: "Company data fetched successfully",
                data: result
            });
        }
        // ==================================================
        // FLAG ID 2 - PRODUCT
        // ==================================================
        if (parseInt(FlagId) === 2) {
            if (CompanyId === undefined || CompanyId === null || String(CompanyId).trim() === "") {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            const result = await getProductDropdown(parseInt(CompanyId));
            return res.status(200).json({
                status: "success",
                message: "Product data fetched successfully",
                data: result
            });
        }
        // ==================================================
        // FLAG ID 3 - PROJECT
        // ==================================================
        if (parseInt(FlagId) === 3) {

            if (
                CompanyProductId === undefined ||
                CompanyProductId === null ||
                (
                    !Array.isArray(CompanyProductId) &&
                    String(CompanyProductId).trim() === ""
                )
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId is required"
                });
            }

            const result = await getProjectDropdown(
                CompanyProductId
            );

            return res.status(200).json({
                status: "success",
                message: "Project data fetched successfully",
                data: result
            });
        }
        // ==================================================
        // FLAG ID 4 - ROLE
        // ==================================================
        if (parseInt(FlagId) === 4) {
            const result = await getRoleDropdown();
            return res.status(200).json({
                status: "success",
                message: "Role data fetched successfully",
                data: result
            });
        }
        // ==================================================
        // INVALID FLAG
        // ==================================================
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use 1, 2, 3 or 4"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch dropdown data",
            error: error.message
        });
    }
};