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
    getUserReportingManagerDropdown


} from "../../Models/UserModels.js";
import { readFile } from "fs/promises";
import {
    processUserFilesUsingWorker
} from "../../Helpers/userFileWorkerHelper.js";

// =====================================================
// USER DROPDOWNS
// FlagId 1 = Gender
// FlagId 2 = Marital Status
// FlagId 3 = Designation
// =====================================================

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
// =====================================================
// CREATE USER
// =====================================================
export const createUserController = async (req, res) => {
    try {

        const userData = req.body;

        // ==========================================================
        // MULTER FILES
        // ==========================================================

        const files = req.files || [];

        const photoFile = files.find(
            file => file.fieldname === "Photo"
        );

        // ==========================================================
        // PHOTO
        // ==========================================================

        if (photoFile) {

            const photoBuffer = await readFile(photoFile.path);

            userData.Photo = photoBuffer;

        } else {

            userData.Photo = null;

        }

        // ==========================================================
        // USER FILES
        // ==========================================================

        const userFiles = files.filter(
            file => file.fieldname === "UserFile"
        );

        let fileTypeIds = req.body.FileTypeId || [];

        if (!Array.isArray(fileTypeIds)) {
            fileTypeIds = [fileTypeIds];
        }

        // ==========================================================
        // CONVERT FILE TYPE IDS TO NUMBER
        // ==========================================================

        fileTypeIds = fileTypeIds.map(id => Number(id));

        if (userFiles.length !== fileTypeIds.length) {

            return res.status(400).json({
                status: "error",
                message:
                    `Received ${userFiles.length} UserFiles but ${fileTypeIds.length} FileTypeIds`
            });

        }

        // ==========================================================
        // VALIDATE FILE TYPE IDS
        // ==========================================================

        for (let i = 0; i < fileTypeIds.length; i++) {

            if (
                !Number.isInteger(fileTypeIds[i]) ||
                fileTypeIds[i] <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        `Invalid FileTypeId for UserFile ${i + 1}`
                });

            }
        }

        userData.UserFiles = [];

        // ==========================================================
        // GROUP FILES BY FILE TYPE
        // ==========================================================

        const fileTypeGroups = new Map();

        for (let i = 0; i < userFiles.length; i++) {

            const file = userFiles[i];

            const fileTypeId = fileTypeIds[i];

            if (!fileTypeGroups.has(fileTypeId)) {

                fileTypeGroups.set(fileTypeId, []);

            }

            fileTypeGroups
                .get(fileTypeId)
                .push(file.path);
        }

        // ==========================================================
        // PROCESS EACH FILE TYPE USING WORKER
        // ==========================================================

        for (const [fileTypeId, inputPaths] of fileTypeGroups) {

            try {

                const workerResult =
                    await processUserFilesUsingWorker(inputPaths);

                userData.UserFiles.push({

                    FileTypeId: Number(fileTypeId),

                    FilePath: workerResult.filePath

                });

            } catch (workerError) {

                console.error(
                    "UserFile Worker Error:",
                    workerError
                );

                return res.status(500).json({
                    status: "error",
                    message: "Failed to process UserFile",
                    error: workerError.message
                });
            }
        }

        // ==========================================================
        // REQUIRED USER FIELDS
        // ==========================================================

        if (
            userData.EmployeeId === undefined ||
            userData.EmployeeId === null ||
            String(userData.EmployeeId).trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "EmployeeId is required"
            });

        }

        if (!userData.FirstName) {

            return res.status(400).json({
                status: "error",
                message: "FirstName is required"
            });

        }

        if (!userData.PhoneNumber) {

            return res.status(400).json({
                status: "error",
                message: "PhoneNumber is required"
            });

        }

        if (!userData.DateOfBirth) {

            return res.status(400).json({
                status: "error",
                message: "DateOfBirth is required"
            });

        }

        if (!userData.DateOfJoining) {

            return res.status(400).json({
                status: "error",
                message: "DateOfJoining is required"
            });

        }

        if (!userData.GenderId) {

            return res.status(400).json({
                status: "error",
                message: "GenderId is required"
            });

        }

        if (!userData.MaritalStatusId) {

            return res.status(400).json({
                status: "error",
                message: "MaritalStatusId is required"
            });

        }

        if (!userData.DesignationId) {

            return res.status(400).json({
                status: "error",
                message: "DesignationId is required"
            });

        }

        if (!userData.Email) {

            return res.status(400).json({
                status: "error",
                message: "Email is required"
            });

        }

        if (!userData.LoginName) {

            return res.status(400).json({
                status: "error",
                message: "LoginName is required"
            });

        }

        if (!userData.Password) {

            return res.status(400).json({
                status: "error",
                message: "Password is required"
            });

        }

        // ==========================================================
        // REQUIRED RELATIONSHIP FIELDS
        // ==========================================================

        if (
            userData.CompanyId === undefined ||
            userData.CompanyId === null ||
            String(userData.CompanyId).trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "CompanyId is required"
            });

        }

        if (
            userData.CompanyProductId === undefined ||
            userData.CompanyProductId === null ||
            String(userData.CompanyProductId).trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "CompanyProductId is required"
            });

        }

        if (
            userData.ProjectId === undefined ||
            userData.ProjectId === null ||
            String(userData.ProjectId).trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "ProjectId is required"
            });

        }

        if (
            userData.RoleId === undefined ||
            userData.RoleId === null ||
            String(userData.RoleId).trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "RoleId is required"
            });

        }

        // ==========================================================
        // REPORTING MANAGER
        // ==========================================================

        if (
            userData.ReportingManagerUserId !== undefined &&
            userData.ReportingManagerUserId !== null &&
            String(userData.ReportingManagerUserId).trim() !== ""
        ) {
            userData.ReportingManagerUserId = Number(userData.ReportingManagerUserId);
            if (!Number.isInteger(userData.ReportingManagerUserId) || userData.ReportingManagerUserId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "ReportingManagerUserId must be a valid number"
                });
            }

        } else {
            userData.ReportingManagerUserId = null;
        }
        // ==========================================================
        // CONVERT FORM DATA VALUES
        // ==========================================================
        userData.CompanyId = Number(userData.CompanyId);
        userData.CompanyProductId = Number(userData.CompanyProductId);
        userData.ProjectId = Number(userData.ProjectId);
        userData.RoleId = Number(userData.RoleId);
        userData.GenderId = Number(userData.GenderId);
        userData.MaritalStatusId = Number(userData.MaritalStatusId);
        userData.DesignationId = Number(userData.DesignationId);
        // ==========================================================
        // NUMERIC VALIDATION
        // ==========================================================
        const numericFields = [
            ["CompanyId", userData.CompanyId],
            ["CompanyProductId", userData.CompanyProductId],
            ["ProjectId", userData.ProjectId],
            ["RoleId", userData.RoleId],
            ["GenderId", userData.GenderId],
            ["MaritalStatusId", userData.MaritalStatusId],
            ["DesignationId", userData.DesignationId]

        ];

        for (const [field, value] of numericFields) {

            if (!Number.isInteger(value) || value <= 0) {
                return res.status(400).json({
                    status: "error",
                    message:
                        `${field} must be a valid number`
                });
            }
        }
        // ==========================================================
        // EMAIL VALIDATION
        // ==========================================================
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(userData.Email)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid email format"
            });

        }
        // ==========================================================
        // PHONE VALIDATION
        // ==========================================================
        userData.PhoneNumber = String(userData.PhoneNumber).trim();
        const phoneRegex = /^[0-9]{10,12}$/;
        if (!phoneRegex.test(userData.PhoneNumber)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid phone number"
            });

        }

        // ==========================================================
        // ALTERNATE PHONE
        // ==========================================================

        if (
            userData.AltPhoneNumber !== undefined &&
            userData.AltPhoneNumber !== null &&
            String(userData.AltPhoneNumber).trim() !== ""
        ) {
            userData.AltPhoneNumber = String(userData.AltPhoneNumber).trim();
            if (!phoneRegex.test(userData.AltPhoneNumber)) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid alternate phone number"
                });
            }

        } else {
            userData.AltPhoneNumber = null;
        }
        // ==========================================================
        // DUPLICATE EMAIL
        // ==========================================================
        const emailExists = await checkEmailExists(userData.Email);
        if (emailExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Email already exists"
            });
        }
        // ==========================================================
        // DUPLICATE LOGIN NAME
        // ==========================================================
        const loginNameExists = await checkLoginNameExists(userData.LoginName);
        if (loginNameExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Login name already exists"
            });

        }
        // ==========================================================
        // DUPLICATE PHONE
        // ==========================================================
        const phoneExists = await checkPhoneNumberExists(userData.PhoneNumber);
        if (phoneExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Phone number already exists"
            });
        }
        // ==========================================================
        // DUPLICATE EMPLOYEE ID
        // ==========================================================
        const employeeExists =
            await checkEmployeeIdExists(
                String(userData.EmployeeId).trim()
            );

        if (employeeExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Employee ID already exists"
            });

        }
        // ==========================================================
        // HASH PASSWORD
        // ==========================================================
        userData.Password = await bcrypt.hash(userData.Password, 10);
        // ==========================================================
        // VALIDATE DATE OF JOINING
        // ==========================================================
        const joiningDate = new Date(userData.DateOfJoining);
        if (isNaN(joiningDate.getTime())) {
            return res.status(400).json({
                status: "error",
                message: "Invalid DateOfJoining"
            });
        }
        // ==========================================================
        // CREATE USER
        // ==========================================================
        const result = await createUser(userData);
        // ==========================================================
        // SUCCESS
        // ==========================================================
        return res.status(201).json({
            status: "success",
            message: "User created successfully",
        });

    } catch (error) {
        console.error("Create User Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to create user",
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
        // ==================================================
        // FLAG ID VALIDATION
        // ==================================================
        if (FlagId === undefined || FlagId === null) {
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

            const result = await getProductDropdown(CompanyId);
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
            if (CompanyProductId === undefined || CompanyProductId === null || String(CompanyProductId).trim() === "") {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId is required"
                });
            }
            const result = await getProjectDropdown(CompanyProductId);
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
        console.error("Company Product Project Dropdown Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch dropdown data",
            error: error.message
        });
    }
};
