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
    getDepartmentDropdown,
    getUserReportingManagerDropdown,
    getDesignationById,
    getUserCount
} from "../../Models/UserModels.js";
import {
    convertUploadedImagesToPdf
} from "../../Helpers/convertUploadedImagesToPdf.js";
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

        // FLAG 3 = DESIGNATION BASED ON COMPANY

        if (parseInt(FlagId) === 3) {

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                String(CompanyId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            const companyId = Number(CompanyId);

            if (!Number.isInteger(companyId) || companyId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId must be a valid positive integer"
                });
            }

            const result = await getDesignationDropdown(companyId);

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
            "DepartmentId"
        ];

        for (const field of requiredFields) {
            if (isEmpty(userData[field])) {
                return res.status(400).json({
                    status: "error",
                    message: `${field} is required`
                });
            }
        }

        // EMPLOYEE ID AND LOGIN NAME VALIDATION
        // ==========================================================
        // EMPLOYEE ID VALIDATION
        // ==========================================================

        const employeeId = String(userData.EmployeeId ?? "").trim();

        if (!/^[A-Za-z0-9]{1,6}$/.test(employeeId)) {
            return res.status(400).json({
                status: "error",
                message: "EmployeeId must contain only alphanumeric characters and must not exceed 6 characters"
            });
        }

        userData.EmployeeId = employeeId;
        const loginName = String(userData.LoginName ?? "").trim();

        if (!/^[A-Za-z0-9]+$/.test(loginName)) {
            return res.status(400).json({
                status: "error",
                message: "LoginName must contain only alphanumeric characters"
            });
        }

        userData.LoginName = loginName;


        // ==========================================================
        // PHONE AND ALTERNATE NUMBER VALIDATION
        // ==========================================================


        const phoneNumber = String(userData.PhoneNumber ?? "").trim();
        const alternateNumber = String(userData.AltPhoneNumber ?? "").trim();

        if (
            alternateNumber !== "" &&
            phoneNumber === alternateNumber
        ) {
            return res.status(400).json({
                status: "error",
                message: "PhoneNumber and AltPhoneNumber must not be the same"
            });
        }

        // ==========================================================
        // CREATED BY USER VALIDATION
        // ==========================================================

        const userCount = await getUserCount();

        if (
            Number(userData.RoleId) === 1 &&
            userCount === 0
        ) {
            userData.CreatedByUserName = null;
        } else if (isEmpty(userData.CreatedByUserName)) {
            return res.status(400).json({
                status: "error",
                message: "CreatedByUserName is required"
            });
        }


        // ==========================================================
        // EMAIL FORMAT VALIDATION
        // ==========================================================

        const email = String(userData.Email).trim();

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: "error",
                message: "Please enter a valid email address"
            });
        }

        userData.Email = email;
        // ==========================================================
        // ROLE ID VALIDATION
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
        // STRONG PASSWORD VALIDATION
        // ==========================================================

        const password = String(userData.Password);

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                status: "error",
                message:
                    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
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
            // GET DESIGNATION DETAILS
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

            // ------------------------------------------------------
            // DESIGNATION LEVEL 100
            // CompanyProductId, ProjectId and ReportingManagerUserId
            // are not required
            // ------------------------------------------------------

            if (Number(designation.DesignationLevel) === 100) {
                userData.CompanyProductId = null;
                userData.ProjectId = null;
                userData.ReportingManagerUserId = null;
            } else {
                // --------------------------------------------------
                // COMPANY PRODUCT
                // --------------------------------------------------

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

                // --------------------------------------------------
                // PROJECT
                // --------------------------------------------------

                if (
                    !Array.isArray(userData.ProjectId) ||
                    userData.ProjectId.length === 0
                ) {
                    return res.status(400).json({
                        status: "error",
                        message: "ProjectId must be a non-empty array"
                    });
                }

                // --------------------------------------------------
                // REPORTING MANAGER
                // --------------------------------------------------

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
        // Check Email
        if (userData.Email && await checkEmailExists(userData.Email)) {
            return res.status(409).json({
                status: "error",
                message: "Email already exists"
            });
        }

        // Check LoginName
        if (userData.LoginName && await checkLoginNameExists(userData.LoginName)) {
            return res.status(409).json({
                status: "error",
                message: "Login name already exists"
            });
        }

        // Check PhoneNumber
        if (userData.PhoneNumber && await checkPhoneNumberExists(userData.PhoneNumber)) {
            return res.status(409).json({
                status: "error",
                message: "Phone number already exists"
            });
        }

        // Check EmployeeId
        if (
            userData.EmployeeId &&
            await checkEmployeeIdExists(String(userData.EmployeeId))
        ) {
            return res.status(409).json({
                status: "error",
                message: "Employee ID already exists"
            });
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
        // ==========================================================
        // GET UPLOADED FILES
        // ==========================================================

        const uploadedFiles = Array.isArray(req.files)
            ? req.files
            : Object.values(req.files || {}).flat();

        const fileTypeIds = Array.isArray(userData.FileTypeId)
            ? userData.FileTypeId
            : userData.FileTypeId
                ? [userData.FileTypeId]
                : [];

        let processedFiles;

        try {
            processedFiles = await convertUploadedImagesToPdf(
                uploadedFiles,
                fileTypeIds
            );
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

        // ==========================================================
        // PHOTO - STORE CONVERTED PDF AS BYTEA
        // ==========================================================

        const uploadedPhoto = processedFiles.find(
            file => file.fieldname === "Photo"
        );

        userData.Photo = null;

        if (uploadedPhoto) {
            userData.Photo = await readFile(uploadedPhoto.path);
        }

        // ==========================================================
        // USER FILES - STORE MERGED PDF PATHS
        // ==========================================================

        const uploadedUserFiles = processedFiles.filter(
            file => file.fieldname === "UserFile"
        );

        userData.UserFiles = uploadedUserFiles.map(file => ({
            FileTypeId: Number(file.FileTypeId),
            FilePath: file.path
        }));

        await createUser(userData, processedFiles);

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
//flagId = 4 -> Role
// ==========================================================
export const companyProductProjectDropdownController = async (req, res) => {

    const { FlagId, CompanyId, CompanyProductId } = req.body;

    try {

        // ==================================================
        // FLAG ID VALIDATION
        // ==================================================

        if (
            FlagId === undefined ||
            FlagId === null ||
            String(FlagId).trim() === ""
        ) {
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

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                String(CompanyId).trim() === ""
            ) {
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

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                String(CompanyId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            const result = await getRoleDropdown(
                parseInt(CompanyId)
            );

            return res.status(200).json({
                status: "success",
                message: "Role data fetched successfully",
                data: result
            });
        }

        // ==================================================
        // FLAG ID 5 - DEPARTMENT
        // ==================================================

        if (parseInt(FlagId) === 5) {

            let companyId = null;

            // CompanyId is optional for Department dropdown

            if (
                CompanyId !== undefined &&
                CompanyId !== null &&
                String(CompanyId).trim() !== ""
            ) {

                companyId = Number(CompanyId);

                if (
                    !Number.isInteger(companyId) ||
                    companyId <= 0
                ) {
                    return res.status(400).json({
                        status: "error",
                        message: "CompanyId must be a valid positive integer"
                    });
                }
            }

            const result = await getDepartmentDropdown(companyId);

            return res.status(200).json({
                status: "success",
                message: "Department data fetched successfully",
                data: result
            });
        }

        // ==================================================
        // INVALID FLAG
        // ==================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use 1, 2, 3, 4 or 5"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch dropdown data",
            error: error.message
        });
    }
};