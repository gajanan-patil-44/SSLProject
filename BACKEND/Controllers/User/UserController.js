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
    getProjectDropdown
} from "../../Models/UserModels.js";


// =====================================================
// USER DROPDOWNS
// FlagId 1 = Gender
// FlagId 2 = Marital Status
// FlagId 3 = Designation
// =====================================================

export const userDropdownController = async (req, res) => {

    const { FlagId } = req.body;

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
        // INVALID FLAG
        // ==========================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId"
        });

    } catch (error) {

        console.error("User Dropdown Error:", error);

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

    const userData = req.body;

    try {
        if (req.file) {

            userData.Photo = req.file.buffer;

        } else {

            userData.Photo = null;

        }


        // ==========================================
        // REQUIRED FIELD VALIDATION
        // ==========================================

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


        // ==========================================
        // EMAIL VALIDATION
        // ==========================================

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(userData.Email)) {

            return res.status(400).json({
                status: "error",
                message: "Invalid email format"
            });
        }


        // ==========================================
        // PHONE NUMBER VALIDATION
        // ==========================================

        const phoneRegex = /^[0-9]{10,12}$/;

        if (!phoneRegex.test(userData.PhoneNumber)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid phone number"
            });
        }


        // ==========================================
        // ALTERNATE PHONE NUMBER - OPTIONAL
        // ==========================================

        if (
            userData.AltPhoneNumber !== undefined &&
            userData.AltPhoneNumber !== null &&
            String(userData.AltPhoneNumber).trim() !== ""
        ) {

            userData.AltPhoneNumber = String(
                userData.AltPhoneNumber
            ).trim();

            const altPhoneRegex = /^[0-9]{10,12}$/;

            if (!altPhoneRegex.test(userData.AltPhoneNumber)) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid alternate phone number"
                });
            }
        }

        // ==========================================
        // CHECK EMAIL DUPLICATE
        // ==========================================

        const emailExists = await checkEmailExists(
            userData.Email
        );

        if (emailExists.length > 0) {

            return res.status(409).json({
                status: "error",
                message: "Email already exists"
            });
        }


        // ==========================================
        // CHECK LOGIN NAME DUPLICATE
        // ==========================================

        const loginNameExists = await checkLoginNameExists(
            userData.LoginName
        );

        if (loginNameExists.length > 0) {

            return res.status(409).json({
                status: "error",
                message: "Login name already exists"
            });
        }


        // ==========================================
        // CHECK PHONE DUPLICATE
        // ==========================================

        const phoneExists = await checkPhoneNumberExists(
            userData.PhoneNumber
        );

        if (phoneExists.length > 0) {

            return res.status(409).json({
                status: "error",
                message: "Phone number already exists"
            });
        }


        // ==========================================
        // EMPLOYEE ID VALIDATION
        // ==========================================

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

        // ==========================================
        // CHECK EMPLOYEE ID DUPLICATE
        // ==========================================

        const employeeExists = await checkEmployeeIdExists(
            userData.EmployeeId.trim()
        );

        if (employeeExists.length > 0) {
            return res.status(409).json({
                status: "error",
                message: "Employee ID already exists"
            });
        }
        // ==========================================
        // PASSWORD HASH
        // ==========================================

        const hashedPassword = await bcrypt.hash(
            userData.Password,
            10
        );

        userData.Password = hashedPassword;


        // ==========================================
        // CREATE USER
        // ==========================================

        const result = await createUser(userData);


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            data: result
        });

    } catch (error) {

        console.error("User Creation Error:", error);

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

    const { FlagId, CompanyId, ProductId } = req.body;

    try {

        // ==================================================
        // FLAG ID VALIDATION
        // ==================================================

        if (
            FlagId === undefined ||
            FlagId === null
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

            const result =
                await getCompanyDropdown();

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

            const result =
                await getProductDropdown(
                    CompanyId
                );

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
                CompanyId === undefined ||
                CompanyId === null ||
                String(CompanyId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (
                ProductId === undefined ||
                ProductId === null ||
                String(ProductId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProductId is required"
                });
            }

            const result =
                await getProjectDropdown(
                    CompanyId,
                    ProductId
                );

            return res.status(200).json({
                status: "success",
                message: "Project data fetched successfully",
                data: result
            });
        }


        // ==================================================
        // INVALID FLAG
        // ==================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use 1, 2 or 3"
        });

    } catch (error) {

        console.error(
            "Company Product Project Dropdown Error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch dropdown data",
            error: error.message
        });
    }
};