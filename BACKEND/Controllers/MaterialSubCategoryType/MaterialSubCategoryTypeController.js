import {
    getAllMaterialSubCategoryTypes,
    checkMaterialSubCategoryExists,
    checkMaterialSubCategoryExistsForUpdate,
    checkMaterialCategoryExists,
    addMaterialSubCategoryType,
    getMaterialCategoryDropdown,
    updateMaterialSubCategoryType,
    updateMaterialSubCategoryTypeStatus} from "../../Models/MaterialSubCategoryType/MaterialSubCategoryTypeModels.js"
 import { validateCompanyId } from "../../Models/ItemCategory/ItemCategoryModel.js";

// =====================================================
// FLAG ID 1 - GET ALL SUB CATEGORIES
// =====================================================


export const getMaterialSubCategoryType = async (req, res) => {

    const { FlagId } = req.body;

    try {

        // =============================================
        // FLAG ID VALIDATION
        // =============================================

        if (
            FlagId === undefined ||
            FlagId === null ||
            FlagId === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        if (!Number.isInteger(Number(FlagId))) {
            return res.status(400).json({
                status: "error",
                message: "FlagId must be a valid number"
            });
        }

        // =============================================
        // FLAG ID 1 = GET MATERIAL SUB CATEGORY TYPES
        // =============================================

        if (Number(FlagId) === 1) {

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(401).json({
                    status: "error",
                    message: "User authentication information is missing"
                });
            }

            const rows = await getAllMaterialSubCategoryTypes(
                loggedInCompanyId
            );

            return res.status(200).json({
                status: "success",
                message: "Material sub category types fetched successfully",
                data: rows
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Get Material Sub Category Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch material sub category types",
            error: error.message
        });
    }
};

// ====================================================
// FLAG ID 2 - ADD SUB CATEGORY
// =====================================================

export const addMaterialSubCategory = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (FlagId === undefined || FlagId === null || FlagId === "") {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        if (!Number.isInteger(Number(FlagId))) {
            return res.status(400).json({
                status: "error",
                message: "FlagId must be a valid number"
            });
        }

        if (Number(FlagId) === 2) {

            const data = req.body;

            // =============================================
            // COMPANY ACCESS
            // =============================================

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(401).json({
                    status: "error",
                    message: "Company information is missing"
                });
            }

            // Super Admin can select any company.
            // Company Admin can only use their JWT CompanyId.

            const selectedCompanyId =
                loggedInCompanyId === null
                    ? data.CompanyId
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

            const companyId = Number(selectedCompanyId);

            if (!Number.isInteger(companyId) || companyId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid CompanyId is required"
                });
            }

            // =============================================
            // VALIDATE COMPANY
            // =============================================

            const companyValidation = await validateCompanyId(companyId);

            if (!companyValidation.valid) {
                return res.status(400).json({
                    status: "error",
                    message: companyValidation.message
                });
            }

            // =============================================
            // VALIDATE CATEGORY
            // =============================================

            const categoryId = Number(data.MaterialCategoryTypeId);

            if (!Number.isInteger(categoryId) || categoryId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Valid MaterialCategoryTypeId is required"
                });
            }

            const categoryExists = await checkMaterialCategoryExists(
                categoryId,
                companyId
            );

            if (categoryExists.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid MaterialCategoryTypeId for this company"
                });
            }

            // =============================================
            // VALIDATE SUBCATEGORY NAME
            // =============================================

            const subCategoryName = String(
                data.MaterialSubCategoryTypeName ?? ""
            ).trim();

            if (!subCategoryName) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeName is required"
                });
            }

            if (subCategoryName.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category name must not exceed 30 characters"
                });
            }

            if (!/^[a-zA-Z0-9]+$/.test(subCategoryName)) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category name must contain only alphanumeric characters"
                });
            }

            // =============================================
            // VALIDATE SUBCATEGORY CODE
            // =============================================

            const subCategoryCode = String(
                data.MaterialSubCategoryTypeCode ?? ""
            ).trim();

            if (!subCategoryCode) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeCode is required"
                });
            }

            if (subCategoryCode.length > 15) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category code must not exceed 15 characters"
                });
            }

            if (!/^[a-zA-Z0-9]+$/.test(subCategoryCode)) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category code must contain only alphanumeric characters"
                });
            }

            // =============================================
            // VALIDATE CREATED BY USERNAME
            // =============================================

            const createdByUserName = String(
                data.CreatedByUserName ?? ""
            ).trim();

            if (!createdByUserName) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }

            // =============================================
            // CHECK DUPLICATES WITHIN COMPANY
            // =============================================

            const existing = await checkMaterialSubCategoryExists(
                companyId,
                subCategoryName,
                subCategoryCode
            );

            if (existing.length > 0) {

                const duplicateName = existing.some(
                    item =>
                        item.MaterialSubCategoryTypeName.toLowerCase() ===
                        subCategoryName.toLowerCase()
                );

                const duplicateCode = existing.some(
                    item =>
                        item.MaterialSubCategoryTypeCode.toLowerCase() ===
                        subCategoryCode.toLowerCase()
                );

                if (duplicateName) {
                    return res.status(409).json({
                        status: "error",
                        message: "Material sub category name already exists for this company"
                    });
                }

                if (duplicateCode) {
                    return res.status(409).json({
                        status: "error",
                        message: "Material sub category code already exists for this company"
                    });
                }
            }

            // =============================================
            // INSERT
            // =============================================

            const subCategoryData = {
                CompanyId: companyId,
                MaterialCategoryTypeId: categoryId,
                MaterialSubCategoryTypeName: subCategoryName,
                MaterialSubCategoryTypeCode: subCategoryCode,
                CreatedByUserName: createdByUserName
            };

            const result = await addMaterialSubCategoryType(
                subCategoryData
            );

            return res.status(201).json({
                status: "success",
                message: "Material sub category added successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Add Material Sub Category Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add material sub category",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 3 - CATEGORY DROPDOWN
// =====================================================
export const getMaterialCategory = async (req, res) => {

    const { FlagId } = req.body;

    try {

        if (Number(FlagId) === 3) {

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(401).json({
                    status: "error",
                    message: "Company information is missing"
                });
            }

            const rows = await getMaterialCategoryDropdown(
                loggedInCompanyId
            );

            return res.status(200).json({
                status: "success",
                message: "Material category dropdown fetched successfully",
                data: rows
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Get Material Category Dropdown Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch material category dropdown",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 4 - EDIT SUB CATEGORY
// =====================================================
export const editMaterialSubCategory = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 4) {

            const data = req.body;

            // ---------------------------------------------
            // VALIDATE LOGIN COMPANY
            // ---------------------------------------------
            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(403).json({
                    status: "error",
                    message: "Company access information is missing"
                });
            }

            // ---------------------------------------------
            // DETERMINE COMPANY ID
            // Super Admin: CompanyId from request
            // Company Admin: CompanyId from JWT
            // ---------------------------------------------
            let CompanyId;

            if (loggedInCompanyId === null) {
                CompanyId = data.CompanyId;

                if (!CompanyId) {
                    return res.status(400).json({
                        status: "error",
                        message: "CompanyId is required"
                    });
                }
            } else {
                CompanyId = loggedInCompanyId;
            }

            // ---------------------------------------------
            // VALIDATE COMPANY
            // ---------------------------------------------
            const companyExists = await validateCompanyId(CompanyId);

            if (!companyExists.valid) {
                return res.status(400).json({
                    status: "error",
                    message: companyExists.message
                });
            }

            // ---------------------------------------------
            // VALIDATE SUB CATEGORY ID
            // ---------------------------------------------
            if (!data.MaterialSubCategoryTypeId) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeId is required"
                });
            }

            // ---------------------------------------------
            // VALIDATE CATEGORY ID
            // ---------------------------------------------
            if (!data.MaterialCategoryTypeId) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeId is required"
                });
            }

            // Category must belong to the selected company
            const categoryExists = await checkMaterialCategoryExists(
                data.MaterialCategoryTypeId,
                CompanyId
            );

            if (categoryExists.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid MaterialCategoryTypeId for the selected company"
                });
            }

            // ---------------------------------------------
            // VALIDATE SUB CATEGORY NAME
            // ---------------------------------------------
            if (!data.MaterialSubCategoryTypeName) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeName is required"
                });
            }

            if (data.MaterialSubCategoryTypeName.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category name must not exceed 30 characters"
                });
            }

            if (!/^[a-zA-Z0-9]+$/.test(data.MaterialSubCategoryTypeName)) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category name must contain only alphanumeric characters"
                });
            }

            // ---------------------------------------------
            // VALIDATE SUB CATEGORY CODE
            // ---------------------------------------------
            if (!data.MaterialSubCategoryTypeCode) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeCode is required"
                });
            }

            if (data.MaterialSubCategoryTypeCode.length > 15) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category code must not exceed 15 characters"
                });
            }

            if (!/^[a-zA-Z0-9]+$/.test(data.MaterialSubCategoryTypeCode)) {
                return res.status(400).json({
                    status: "error",
                    message: "Material sub category code must contain only alphanumeric characters"
                });
            }

            // ---------------------------------------------
            // VALIDATE UPDATED USER
            // ---------------------------------------------
            if (!data.UpdatedByUserName) {
                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }

            // ---------------------------------------------
            // CHECK WHETHER SUB CATEGORY BELONGS TO COMPANY
            // ---------------------------------------------
            const subCategoryExists = await checkMaterialSubCategoryBelongsToCompany(
                data.MaterialSubCategoryTypeId,
                CompanyId
            );

            if (subCategoryExists.length === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Material sub category not found for this company"
                });
            }

            // ---------------------------------------------
            // CHECK DUPLICATE NAME AND CODE
            // ---------------------------------------------
            const existing = await checkMaterialSubCategoryExistsForUpdate(
                data.MaterialSubCategoryTypeName,
                data.MaterialSubCategoryTypeCode,
                data.MaterialSubCategoryTypeId,
                CompanyId
            );

            if (existing.length > 0) {

                const duplicate = existing[0];

                if (
                    duplicate.MaterialSubCategoryTypeName ===
                    data.MaterialSubCategoryTypeName
                ) {
                    return res.status(409).json({
                        status: "error",
                        message: "Material sub category name already exists"
                    });
                }

                if (
                    duplicate.MaterialSubCategoryTypeCode ===
                    data.MaterialSubCategoryTypeCode
                ) {
                    return res.status(409).json({
                        status: "error",
                        message: "Material sub category code already exists"
                    });
                }
            }

            // ---------------------------------------------
            // UPDATE
            // ---------------------------------------------
            const result = await updateMaterialSubCategoryType({
                ...data,
                CompanyId
            });

            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Material sub category not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Material sub category updated successfully",
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
            message: "Failed to update material sub category",
            error: error.message
        });
    }
};
// =====================================================
// FLAG ID 5 - TOGGLE STATUS
// =====================================================
export const updateMaterialSubCategoryStatus = async (req, res) => {
    const {FlagId,MaterialSubCategoryTypeId,IsDisabled} = req.body;
    try {
        if (parseInt(FlagId) === 5) {
            if (!MaterialSubCategoryTypeId) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeId is required"
                });
            }
            // ---------------------------------------------
            // VALIDATE STATUS
            // ---------------------------------------------
            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

            // ---------------------------------------------
            // UPDATE STATUS
            // ---------------------------------------------
            const result = await updateMaterialSubCategoryTypeStatus(MaterialSubCategoryTypeId,IsDisabled);
            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Material sub category not found"
                });
            }
            return res.status(200).json({
                status: "success",
                message: IsDisabled
                    ? "Material sub category disabled successfully"
                    : "Material sub category enabled successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {
        console.error("Error updating material sub category status:",error);
        return res.status(500).json({
            status: "error",
            message: "Failed to update material sub category status",
            error: error.message
        });
    }
};