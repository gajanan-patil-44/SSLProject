import {
    getAllMaterialCategoryTypes,
    checkMaterialCategoryTypeCodeExists,
    checkMaterialCategoryTypeCodeExistsForUpdate,
    addMaterialCategoryTypeModel,
    updateMaterialCategoryTypeModel,
    toggleMaterialCategoryTypeStatusModel
} from "../../Models/ItemCategory/ItemCategoryModel.js";


// GET ALL ITEM CATEGORIES

export const getMaterialCategoryTypes = async (req, res) => {

    const { flagId } = req.body;

    try {

        // flagId validation
        if (flagId === undefined || flagId === null || flagId === "") {

            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // Check whether flagId is a valid number
        if (!Number.isInteger(Number(flagId))) {

            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }


        // flagId 1 = Get All Item Categories
        if (parseInt(flagId) === 1) {

            const rows = await getAllMaterialCategoryTypes();

            return res.status(200).json({
                status: "success",
                message: "Item categories fetched successfully",
                data: rows
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
            message: "Failed to fetch item categories",
            error: error.message
        });
    }
};


// ADD ITEM CATEGORY

export const addMaterialCategoryType = async (req, res) => {

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


        // flagId 2 = Add Item Category
        if (parseInt(flagId) === 2) {

            const categoryData = req.body;


            // ==================================================
            // VALIDATE MATERIAL CATEGORY NAME - ONLY ALPHABETS
            // ==================================================

            const categoryNameRegex = /^[A-Za-z\s]+$/;

            if (!categoryNameRegex.test(String(categoryData.MaterialCategoryTypeName).trim())) {

                return res.status(400).json({
                    status: "error",
                    message: "Material category Name should contain only alphabets and spaces"
                });
            }


            // ==================================================
            // REQUIRED FIELD VALIDATION
            // ==================================================

            if (
                categoryData.MaterialCategoryTypeName === undefined ||
                categoryData.MaterialCategoryTypeName === null ||
                String(categoryData.MaterialCategoryTypeName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName is required"
                });
            }


            if (
                categoryData.MaterialCategoryTypeCode === undefined ||
                categoryData.MaterialCategoryTypeCode === null ||
                String(categoryData.MaterialCategoryTypeCode).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode is required"
                });
            }

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

            if (
                categoryData.CreatedByUserName === undefined ||
                categoryData.CreatedByUserName === null ||
                String(categoryData.CreatedByUserName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }



            // LENGTH VALIDATION
            // Database varchar = 75

            const categoryName = String(categoryData.MaterialCategoryTypeName).trim();

            const categoryCode = String(categoryData.MaterialCategoryTypeCode).trim();


            if (categoryName.length > 75) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName cannot exceed 75 characters"
                });
            }


            if (categoryCode.length > 75) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode cannot exceed 75 characters"
                });
            }


            // CHECK DUPLICATE CATEGORY CODE

            const existingCategory = await checkMaterialCategoryTypeCodeExists(categoryCode);


            if (existingCategory.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Item category code already exists"
                });
            }


            // ADD ITEM CATEGORY

            const category = await addMaterialCategoryTypeModel({
                ...categoryData,
                MaterialCategoryTypeName: categoryName,
                MaterialCategoryTypeCode: categoryCode
            });


            return res.status(201).json({
                status: "success",
                message: "Item category added successfully",
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
            message: "Failed to add item category",
            error: error.message
        });
    }
};


// UPDATE ITEM CATEGORY

export const updateMaterialCategoryType = async (req, res) => {

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


        // flagId 3 = Update Item Category
        if (parseInt(flagId) === 3) {

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

            // REQUIRED FIELD VALIDATION

            if (
                categoryData.MaterialCategoryTypeName === undefined ||
                categoryData.MaterialCategoryTypeName === null ||
                String(categoryData.MaterialCategoryTypeName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName is required"
                });
            }

            // MATERIAL CATEGORY NAME VALIDATION - ONLY ALPHABETS

            const categoryNameRegex = /^[A-Za-z\s]+$/;

            if (!categoryNameRegex.test(String(categoryData.MaterialCategoryTypeName).trim())) {

                return res.status(400).json({
                    status: "error",
                    message: "Material category Name should contain only alphabets and spaces"
                });
            }


            if (
                categoryData.MaterialCategoryTypeCode === undefined ||
                categoryData.MaterialCategoryTypeCode === null ||
                String(categoryData.MaterialCategoryTypeCode).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode is required"
                });
            }

            if (
                categoryData.UpdatedByUserName === undefined ||
                categoryData.UpdatedByUserName === null ||
                String(categoryData.UpdatedByUserName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }


            const categoryName = String(categoryData.MaterialCategoryTypeName).trim();

            const categoryCode = String(categoryData.MaterialCategoryTypeCode).trim();

            // LENGTH VALIDATION

            if (categoryName.length > 75) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeName cannot exceed 75 characters"
                });
            }


            if (categoryCode.length > 75) {

                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeCode cannot exceed 75 characters"
                });
            }

            // CHECK DUPLICATE CATEGORY CODE
            // Exclude the current record

            const existingCategories = await checkMaterialCategoryTypeCodeExistsForUpdate(
                categoryCode,
                Number(categoryData.MaterialCategoryTypeId)
            );


            if (existingCategories.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Item category code already exists"
                });
            }


            // UPDATE ITEM CATEGORY

            const category = await updateMaterialCategoryTypeModel({
                ...categoryData,
                MaterialCategoryTypeName: categoryName,
                MaterialCategoryTypeCode: categoryCode
            });


            // RECORD NOT FOUND

            if (category === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Item category not found"
                });
            }


            return res.status(200).json({
                status: "success",
                message: "Item category updated successfully"
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


