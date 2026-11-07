import {
    getAllMaterialCategoryTypes,
    checkMaterialCategoryTypeCodeExists,
    checkMaterialCategoryTypeCodeExistsForUpdate,
    addMaterialCategoryTypeModel,
    updateMaterialCategoryTypeModel,
    toggleMaterialCategoryTypeStatusModel,
    validateCompanyId
} from "../../Models/ItemCategory/ItemCategoryModel.js";


// GET ALL ITEM CATEGORIES

export const getMaterialCategoryTypes = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (
            flagId === undefined ||
            flagId === null ||
            flagId === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (!Number.isInteger(Number(flagId))) {
            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }

        if (Number(flagId) === 1) {

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(401).json({
                    status: "error",
                    message: "User authentication information is missing"
                });
            }

            const rows = await getAllMaterialCategoryTypes(loggedInCompanyId);

            return res.status(200).json({
                status: "success",
                message: "Item categories fetched successfully",
                data: rows
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch item categories",
            error: error.message
        });
    }
};

// ADD ITEM CATEGORY

export const addMaterialCategoryType = async (req, res) => {

    const { flagId } = req.body;

    try {

        // =============================================
        // FLAG ID VALIDATION
        // =============================================

        if (
            flagId === undefined ||
            flagId === null ||
            flagId === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (!Number.isInteger(Number(flagId))) {
            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }

        // =============================================
        // FLAG ID 2 - ADD MATERIAL CATEGORY TYPE
        // =============================================

        if (Number(flagId) === 2) {

            const categoryData = req.body;

            // =============================================
            // VALIDATE LOGGED-IN USER
            // =============================================

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(401).json({
                    status: "error",
                    message: "User authentication information is missing"
                });
            }

            // =============================================
            // SELECT COMPANY ID
            // =============================================

            // Super Admin: Take CompanyId from request.
            // Company Admin: Take CompanyId from JWT.

            const selectedCompanyId =
                loggedInCompanyId === null
                    ? categoryData.CompanyId
                    : loggedInCompanyId;

            if (
                selectedCompanyId === undefined ||
                selectedCompanyId === null ||
                String(selectedCompanyId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            // =============================================
            // VALIDATE COMPANY ID
            // =============================================

            const companyValidation = await validateCompanyId(
                selectedCompanyId
            );

            if (!companyValidation.valid) {
                return res.status(400).json({
                    status: "error",
                    message: companyValidation.message
                });
            }

            // =============================================
            // VALIDATE MATERIAL CATEGORY NAME
            // =============================================

            const categoryName = String(
                categoryData.MaterialCategoryTypeName ?? ""
            ).trim();

            if (!categoryName) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName is required"
                });
            }

            const categoryNameRegex = /^[A-Za-z\s]+$/;

            if (!categoryNameRegex.test(categoryName)) {
                return res.status(400).json({
                    status: "error",
                    message: "Material category Name should contain only alphabets and spaces"
                });
            }

            if (categoryName.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName cannot exceed 30 characters"
                });
            }

            // =============================================
            // VALIDATE MATERIAL CATEGORY CODE
            // =============================================

            const categoryCode = String(
                categoryData.MaterialCategoryTypeCode ?? ""
            ).trim();

            if (!categoryCode) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode is required"
                });
            }

            if (categoryCode.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode cannot exceed 30 characters"
                });
            }

            // =============================================
            // VALIDATE IS DISABLED
            // =============================================

            if (
                categoryData.IsDisabled === undefined ||
                categoryData.IsDisabled === null ||
                String(categoryData.IsDisabled).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled is required"
                });
            }

            const isDisabledValue = String(
                categoryData.IsDisabled
            ).trim().toLowerCase();

            if (!["true", "false", "0", "1"].includes(isDisabledValue)) {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

            const isDisabled = ["true", "1"].includes(isDisabledValue);

            // =============================================
            // VALIDATE CREATED BY USERNAME
            // =============================================

            const createdByUserName = String(
                categoryData.CreatedByUserName ?? ""
            ).trim();

            if (!createdByUserName) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }

            // =============================================
            // CHECK DUPLICATE CATEGORY CODE
            // WITHIN THE SAME COMPANY
            // =============================================

            const existingCategory =
                await checkMaterialCategoryTypeCodeExists(
                    companyValidation.CompanyId,
                    categoryCode
                );

            if (existingCategory.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "Item category code already exists for this company"
                });
            }

            // =============================================
            // ADD MATERIAL CATEGORY TYPE
            // =============================================

            const category = await addMaterialCategoryTypeModel({

                CompanyId: companyValidation.CompanyId,

                MaterialCategoryTypeName: categoryName,

                MaterialCategoryTypeCode: categoryCode,

                IsDisabled: isDisabled,

                CreatedByUserName: createdByUserName

            });

            return res.status(201).json({
                status: "success",
                message: "Item category added successfully",
                data: category
            });
        }

        // =============================================
        // INVALID FLAG ID
        // =============================================

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Add Material Category Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add item category",
            error: error.message
        });
    }
};

// UPDATE ITEM CATEGORY

export const updateMaterialCategoryType = async (req, res) => {

    const { flagId } = req.body;

    try {

        // =============================================
        // FLAG ID VALIDATION
        // =============================================

        if (
            flagId === undefined ||
            flagId === null ||
            flagId === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (!Number.isInteger(Number(flagId))) {
            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }

        // =============================================
        // FLAG ID 3 = UPDATE MATERIAL CATEGORY
        // =============================================

        if (Number(flagId) === 3) {

            const categoryData = req.body;

            // =============================================
            // VALIDATE LOGGED-IN COMPANY
            // =============================================

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(401).json({
                    status: "error",
                    message: "User authentication information is missing"
                });
            }

            // Super Admin selects CompanyId.
            // Company users use CompanyId from JWT.

            const selectedCompanyId =
                loggedInCompanyId === null
                    ? categoryData.CompanyId
                    : loggedInCompanyId;

            if (
                selectedCompanyId === undefined ||
                selectedCompanyId === null ||
                String(selectedCompanyId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            // =============================================
            // VALIDATE COMPANY
            // =============================================

            const companyValidation = await validateCompanyId(
                selectedCompanyId
            );

            if (!companyValidation.valid) {
                return res.status(400).json({
                    status: "error",
                    message: companyValidation.message
                });
            }

            // =============================================
            // VALIDATE MATERIAL CATEGORY ID
            // =============================================

            const categoryId = Number(
                categoryData.MaterialCategoryTypeId
            );

            if (
                !Number.isInteger(categoryId) ||
                categoryId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid MaterialCategoryTypeId is required"
                });
            }

            // =============================================
            // VALIDATE CATEGORY NAME
            // =============================================

            const categoryName = String(
                categoryData.MaterialCategoryTypeName ?? ""
            ).trim();

            if (!categoryName) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName is required"
                });
            }

            const categoryNameRegex = /^[A-Za-z\s]+$/;

            if (!categoryNameRegex.test(categoryName)) {
                return res.status(400).json({
                    status: "error",
                    message: "Material category Name should contain only alphabets and spaces"
                });
            }

            if (categoryName.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName cannot exceed 30 characters"
                });
            }

            // =============================================
            // VALIDATE CATEGORY CODE
            // =============================================

            const categoryCode = String(
                categoryData.MaterialCategoryTypeCode ?? ""
            ).trim();

            if (!categoryCode) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode is required"
                });
            }

            if (categoryCode.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode cannot exceed 30 characters"
                });
            }

            // =============================================
            // VALIDATE UPDATED BY USERNAME
            // =============================================

            const updatedByUserName = String(
                categoryData.UpdatedByUserName ?? ""
            ).trim();

            if (!updatedByUserName) {
                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }

            // =============================================
            // CHECK DUPLICATE CATEGORY CODE
            // WITHIN THE SAME COMPANY
            // =============================================

            const existingCategories =
                await checkMaterialCategoryTypeCodeExistsForUpdate(
                    companyValidation.CompanyId,
                    categoryCode,
                    categoryId
                );

            if (existingCategories.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "Item category code already exists for this company"
                });
            }

            // =============================================
            // UPDATE MATERIAL CATEGORY
            // =============================================

            const updatedCategory =
                await updateMaterialCategoryTypeModel({

                    CompanyId: companyValidation.CompanyId,

                    MaterialCategoryTypeId: categoryId,

                    MaterialCategoryTypeName: categoryName,

                    MaterialCategoryTypeCode: categoryCode,

                    UpdatedByUserName: updatedByUserName

                });

            // =============================================
            // RECORD NOT FOUND
            // =============================================

            if (!updatedCategory) {
                return res.status(404).json({
                    status: "error",
                    message: "Item category not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Item category updated successfully",
                data: updatedCategory
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Update Material Category Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update item category",
            error: error.message
        });
    }
};

// TOGGLE ITEM CATEGORY STATUS

export const toggleMaterialCategoryTypeStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID VALIDATION

        if (flagId === undefined || flagId === null || flagId === "") {

            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        if (!Number.isInteger(Number(flagId))) {

            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }


        // flagId 4 = Toggle Status
        if (parseInt(flagId) === 4) {

            const categoryData = req.body;

            // ID VALIDATION

            if (
                categoryData.MaterialCategoryTypeId === undefined ||
                categoryData.MaterialCategoryTypeId === null ||
                categoryData.MaterialCategoryTypeId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeId is required"
                });
            }


            if (
                !Number.isInteger(
                    Number(categoryData.MaterialCategoryTypeId)
                )
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeId must be a valid number"
                });
            }


            // STATUS VALIDATION

            if (
                typeof categoryData.IsDisabled !== "boolean"
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be either true or false"
                });
            }


            // TOGGLE STATUS

            const category = await toggleMaterialCategoryTypeStatusModel(categoryData);

            // Category does not exist
            if (!category) {

                return res.status(404).json({
                    status: "error",
                    message: "Item category not found"
                });
            }


            return res.status(200).json({
                status: "success",
                message: "Item category status updated successfully",
                data: category
            });
        }


        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to update item category status",
            error: error.message
        });
    }
};


