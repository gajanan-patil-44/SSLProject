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
// ==========================================================
// CREATE USER
// ==========================================================

export const createUserController = async (req, res) => {

    try {

        const userData = req.body;


        // ==========================================================
        // EMPTY VALUE CHECK
        // ==========================================================

        const isEmpty = (value) => {

            return (
                value === undefined ||
                value === null ||
                value === ""
            );

        };


        // ==========================================================
        // CONVERT MULTIPART ARRAY FIELDS
        // ==========================================================

        const arrayFields = [
            "CompanyProductId",
            "ProjectId",
            "ReportingManagerUserId"
        ];


        for (const field of arrayFields) {

            if (!isEmpty(userData[field])) {

                if (typeof userData[field] === "string") {

                    try {

                        userData[field] =
                            JSON.parse(userData[field]);

                    } catch (error) {

                        return res.status(400).json({
                            status: "error",
                            message:
                                `${field} must be a valid JSON array`
                        });

                    }

                }

            }

        }


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
            "Password",
            "CompanyId",
            "RoleId"
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
        // REQUIRED ARRAY FIELDS
        // ==========================================================

        const requiredArrayFields = [
            "CompanyProductId",
            "ProjectId"
        ];


        for (const field of requiredArrayFields) {

            if (
                !Array.isArray(userData[field]) ||
                userData[field].length === 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        `${field} must be a non-empty array`
                });

            }

        }


        // ==========================================================
        // REPORTING MANAGER
        // OPTIONAL ARRAY
        // ==========================================================

        if (isEmpty(userData.ReportingManagerUserId)) {

            userData.ReportingManagerUserId = [];

        }


        if (
            !Array.isArray(
                userData.ReportingManagerUserId
            )
        ) {

            return res.status(400).json({
                status: "error",
                message:
                    "ReportingManagerUserId must be an array"
            });

        }


        // ==========================================================
        // SINGLE NUMERIC FIELDS
        // ==========================================================

        const numericFields = [
            "CompanyId",
            "RoleId",
            "GenderId",
            "MaritalStatusId",
            "DesignationId"
        ];


        for (const field of numericFields) {

            userData[field] =
                Number(userData[field]);


            if (
                !Number.isInteger(userData[field]) ||
                userData[field] <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        `${field} must be a valid number`
                });

            }

        }


        // ==========================================================
        // ARRAY NUMERIC FIELDS
        // ==========================================================

        const numericArrayFields = [
            "CompanyProductId",
            "ProjectId",
            "ReportingManagerUserId"
        ];


        for (const field of numericArrayFields) {

            userData[field] =
                userData[field].map(
                    id => Number(id)
                );


            for (const id of userData[field]) {

                if (
                    !Number.isInteger(id) ||
                    id <= 0
                ) {

                    return res.status(400).json({
                        status: "error",
                        message:
                            `${field} must contain valid numeric IDs`
                    });

                }

            }

        }


        // ==========================================================
        // CHECK DUPLICATE EMAIL
        // ==========================================================

        const emailExists =
            await checkEmailExists(
                userData.Email
            );


        if (emailExists.length > 0) {

            return res.status(409).json({
                status: "error",
                message: "Email already exists"
            });

        }


        // ==========================================================
        // CHECK DUPLICATE LOGIN NAME
        // ==========================================================

        const loginNameExists =
            await checkLoginNameExists(
                userData.LoginName
            );


        if (loginNameExists.length > 0) {

            return res.status(409).json({
                status: "error",
                message:
                    "Login name already exists"
            });

        }


        // ==========================================================
        // CHECK DUPLICATE PHONE NUMBER
        // ==========================================================

        const phoneExists =
            await checkPhoneNumberExists(
                userData.PhoneNumber
            );


        if (phoneExists.length > 0) {

            return res.status(409).json({
                status: "error",
                message:
                    "Phone number already exists"
            });

        }


        // ==========================================================
        // CHECK DUPLICATE EMPLOYEE ID
        // ==========================================================

        const employeeExists =
            await checkEmployeeIdExists(
                String(userData.EmployeeId)
            );


        if (employeeExists.length > 0) {

            return res.status(409).json({
                status: "error",
                message:
                    "Employee ID already exists"
            });

        }


        // ==========================================================
        // CREATE USER
        // ==========================================================

        const result =
            await createUser(
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

        console.error(
            "Create User Error:",
            error
        );


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
            if (CompanyProductId === undefined || CompanyProductId === null ) {
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









