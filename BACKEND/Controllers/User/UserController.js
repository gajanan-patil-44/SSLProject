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
import {processUserFilesUsingWorker} from "../../Helpers/userFileWorkerHelper.js";

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
export const createUserController = async (req, res) => {
    try {
        const userData = req.body;

        // ==========================================================
        // HELPER: CONVERT INPUT TO ARRAY
        // ==========================================================

        const toArray = (value) => {
            if (value === undefined || value === null || value === "") {
                return [];
            }

            if (Array.isArray(value)) {
                return value;
            }

            if (typeof value === "string" && value.trim().startsWith("[")) {
                try {
                    const parsed = JSON.parse(value);

                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                } catch {
                    throw new Error("Invalid array format");
                }
            }

            return [value];
        };

        // ==========================================================
        // HELPER: CONVERT AND VALIDATE NUMERIC ID
        // ==========================================================

        const convertId = (value, fieldName) => {
            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {
                throw new Error(`${fieldName} is required`);
            }

            const id = Number(value);

            if (!Number.isInteger(id) || id <= 0) {
                throw new Error(
                    `${fieldName} must be a valid positive number`
                );
            }

            return id;
        };

        // ==========================================================
        // MULTER FILES
        // ==========================================================

        const files = req.files || [];

        // ==========================================================
        // PHOTO
        // ==========================================================

        const photoFile = files.find(
            (file) => file.fieldname === "Photo"
        );

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
            (file) => file.fieldname === "UserFile"
        );

        let fileTypeIds = toArray(req.body.FileTypeId);

        fileTypeIds = fileTypeIds.map((id, index) =>
            convertId(id, `FileTypeId at index ${index}`)
        );

        if (userFiles.length !== fileTypeIds.length) {
            return res.status(400).json({
                status: "error",
                message: `Received ${userFiles.length} UserFiles but ${fileTypeIds.length} FileTypeIds`
            });
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

            fileTypeGroups.get(fileTypeId).push(file.path);
        }

        // ==========================================================
        // PROCESS FILES USING WORKER
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
                console.error("UserFile Worker Error:", workerError);

                return res.status(500).json({
                    status: "error",
                    message: "Failed to process UserFile",
                    error: workerError.message
                });
            }
        }

        // ==========================================================
        // FILE TYPE FOR USER DETAILS
        // ==========================================================

        userData.FileTypeId =
            userData.UserFiles.length > 0
                ? userData.UserFiles[0].FileTypeId
                : null;

        // ==========================================================
        // REQUIRED USER FIELDS
        // ==========================================================

        const requiredFields = [
            "EmployeeId",
            "FirstName",
            "PhoneNumber",
            "DateOfBirth",
            "DateOfJoining",
            "GenderId",
            "MaritalStatusId",
            "DesignationId",
            "Email",
            "LoginName",
            "Password"
        ];

        for (const field of requiredFields) {
            if (
                userData[field] === undefined ||
                userData[field] === null ||
                String(userData[field]).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: `${field} is required`
                });
            }
        }

        // ==========================================================
        // COMPANY ID
        // ==========================================================

        userData.CompanyId = convertId(
            userData.CompanyId,
            "CompanyId"
        );

        // ==========================================================
        // COMPANY PRODUCT IDS - REQUIRED ARRAY
        // ==========================================================

        userData.CompanyProductId = toArray(
            userData.CompanyProductId
        ).map((id, index) =>
            convertId(id, `CompanyProductId at index ${index}`)
        );

        if (userData.CompanyProductId.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "At least one CompanyProductId is required"
            });
        }

        if (
            new Set(userData.CompanyProductId).size !==
            userData.CompanyProductId.length
        ) {
            return res.status(400).json({
                status: "error",
                message: "Duplicate CompanyProductId values are not allowed"
            });
        }

        // ==========================================================
        // PROJECT IDS - REQUIRED NESTED ARRAY
        //
        // Example:
        // CompanyProductId: [10, 20]
        // ProjectId: [[101, 102], [201, 202]]
        // ==========================================================

        let projectIds = userData.ProjectId;

        if (typeof projectIds === "string") {
            try {
                projectIds = JSON.parse(projectIds);
            } catch {
                return res.status(400).json({
                    status: "error",
                    message:
                        "ProjectId must be a nested array of project IDs"
                });
            }
        }

        if (!Array.isArray(projectIds)) {
            return res.status(400).json({
                status: "error",
                message:
                    "ProjectId must be a nested array of project IDs"
            });
        }

        if (
            projectIds.length !==
            userData.CompanyProductId.length
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Each CompanyProductId must have a corresponding ProjectId array"
            });
        }

        userData.ProjectId = [];

        for (let i = 0; i < projectIds.length; i++) {
            let currentProjects = projectIds[i];

            // Parse nested JSON string if supplied through multipart form-data
            if (typeof currentProjects === "string") {
                try {
                    currentProjects = JSON.parse(currentProjects);
                } catch {
                    return res.status(400).json({
                        status: "error",
                        message: `Invalid ProjectId array for CompanyProductId ${userData.CompanyProductId[i]}`
                    });
                }
            }

            if (!Array.isArray(currentProjects)) {
                return res.status(400).json({
                    status: "error",
                    message:
                        `ProjectId at index ${i} must be an array`
                });
            }

            const convertedProjects = currentProjects.map(
                (id, projectIndex) =>
                    convertId(
                        id,
                        `ProjectId at product index ${i}, project index ${projectIndex}`
                    )
            );

            if (convertedProjects.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message:
                        `At least one ProjectId is required for CompanyProductId ${userData.CompanyProductId[i]}`
                });
            }

            if (
                new Set(convertedProjects).size !==
                convertedProjects.length
            ) {
                return res.status(400).json({
                    status: "error",
                    message:
                        `Duplicate ProjectId values are not allowed for CompanyProductId ${userData.CompanyProductId[i]}`
                });
            }

            userData.ProjectId.push(convertedProjects);
        }

        // ==========================================================
        // ROLE ID
        // ==========================================================

        userData.RoleId = convertId(
            userData.RoleId,
            "RoleId"
        );

        // ==========================================================
        // REPORTING MANAGER IDS - OPTIONAL ARRAY
        // ==========================================================

        userData.ReportingManagerUserId = toArray(
            userData.ReportingManagerUserId
        ).map((id, index) =>
            convertId(
                id,
                `ReportingManagerUserId at index ${index}`
            )
        );

        if (
            new Set(userData.ReportingManagerUserId).size !==
            userData.ReportingManagerUserId.length
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    "Duplicate ReportingManagerUserId values are not allowed"
            });
        }

        // ==========================================================
        // CONVERT SINGLE NUMERIC VALUES
        // ==========================================================

        userData.GenderId = convertId(
            userData.GenderId,
            "GenderId"
        );

        userData.MaritalStatusId = convertId(
            userData.MaritalStatusId,
            "MaritalStatusId"
        );

        userData.DesignationId = convertId(
            userData.DesignationId,
            "DesignationId"
        );

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

        userData.PhoneNumber = String(
            userData.PhoneNumber
        ).trim();

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
            userData.AltPhoneNumber = String(
                userData.AltPhoneNumber
            ).trim();

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

        const emailExists = await checkEmailExists(
            userData.Email
        );

        if (emailExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Email already exists"
            });
        }

        // ==========================================================
        // DUPLICATE LOGIN NAME
        // ==========================================================

        const loginNameExists = await checkLoginNameExists(
            userData.LoginName
        );

        if (loginNameExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Login name already exists"
            });
        }

        // ==========================================================
        // DUPLICATE PHONE
        // ==========================================================

        const phoneExists = await checkPhoneNumberExists(
            userData.PhoneNumber
        );

        if (phoneExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Phone number already exists"
            });
        }

        // ==========================================================
        // DUPLICATE EMPLOYEE ID
        // ==========================================================

        const employeeExists = await checkEmployeeIdExists(
            String(userData.EmployeeId)
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

        userData.Password = await bcrypt.hash(
            userData.Password,
            10
        );

        // ==========================================================
        // VALIDATE DATE OF JOINING
        // ==========================================================

        const joiningDate = new Date(
            userData.DateOfJoining
        );

        if (isNaN(joiningDate.getTime())) {
            return res.status(400).json({
                status: "error",
                message: "Invalid DateOfJoining"
            });
        }

        // ==========================================================
        // CREATE USER
        // ==========================================================

        const createdUser = await createUser(userData);

        // ==========================================================
        // SUCCESS
        // ==========================================================

        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            data: createdUser
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









