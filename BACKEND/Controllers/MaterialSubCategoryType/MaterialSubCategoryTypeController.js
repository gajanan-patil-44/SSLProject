import {
    getAllMaterialSubCategoryTypes,
    checkMaterialSubCategoryExists,
    checkMaterialSubCategoryExistsForUpdate,
    checkMaterialCategoryExists,
    addMaterialSubCategoryType,
    getMaterialCategoryDropdown,
    updateMaterialSubCategoryType,
    updateMaterialSubCategoryTypeStatus
} from "../../Models/MaterialSubCategoryType/MaterialSubCategoryTypeModels.js"


// =====================================================
// FLAG ID 1 - GET ALL SUB CATEGORIES
// =====================================================

export const getMaterialSubCategoryType = async (req, res) => {
    const { FlagId } = req.body;
    try {
        if (parseInt(FlagId) === 1) {
            const rows = await getAllMaterialSubCategoryTypes();
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
        console.error("Error fetching material sub category types:", error);
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

        if (parseInt(FlagId) === 2) {
            const data = req.body;
            // ---------------------------------------------
            // VALIDATE CATEGORY
            // ---------------------------------------------
            if (!data.MaterialCategoryTypeId) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeId is required"
                });
            }

            const categoryExists =
                await checkMaterialCategoryExists(
                    data.MaterialCategoryTypeId
                );

            if (categoryExists.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid MaterialCategoryTypeId"
                });
            }

            if (!data.MaterialSubCategoryTypeName) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeName is required"
                });
            }

            if (!data.MaterialSubCategoryTypeCode) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeCode is required"
                });
            }

            if (!data.CreatedByUserName) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }

            // ---------------------------------------------
            // CHECK DUPLICATE
            // ---------------------------------------------
            const existing = await checkMaterialSubCategoryExists(
                    data.MaterialSubCategoryTypeName,
                    data.MaterialSubCategoryTypeCode
                );

            if (existing.length > 0) {

                const duplicate = existing[0];

                if (duplicate.MaterialSubCategoryTypeName ===data.MaterialSubCategoryTypeName) 
                    {
                    return res.status(409).json({
                        status: "error",
                        message: "Material sub category name already exists"
                    });
                }

                if (duplicate.MaterialSubCategoryTypeCode === data.MaterialSubCategoryTypeCode)
                     {
                    return res.status(409).json({
                        status: "error",
                        message: "Material sub category code already exists"
                    });
                }
            }

            // ---------------------------------------------
            // INSERT
            // ---------------------------------------------
            const result = await addMaterialSubCategoryType(data);
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
        console.error("Error adding material sub category:", error);
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
        if (parseInt(FlagId) === 3) {
            const rows = await getMaterialCategoryDropdown();
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
            if (!data.MaterialSubCategoryTypeId) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeId is required"
                });
            }

           
            if (!data.MaterialCategoryTypeId) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeId is required"
                });
            }

            const categoryExists = await checkMaterialCategoryExists(data.MaterialCategoryTypeId);

            if (categoryExists.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid MaterialCategoryTypeId"
                });
            }
            // ---------------------------------------------
            // VALIDATE NAME
            // ---------------------------------------------
            if (!data.MaterialSubCategoryTypeName) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeName is required"
                });
            }

            // ---------------------------------------------
            // VALIDATE CODE
            // ---------------------------------------------
            if (!data.MaterialSubCategoryTypeCode) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialSubCategoryTypeCode is required"
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
            // CHECK DUPLICATE
            // ---------------------------------------------
            const existing = await checkMaterialSubCategoryExistsForUpdate(
                    data.MaterialSubCategoryTypeName,
                    data.MaterialSubCategoryTypeCode,
                    data.MaterialSubCategoryTypeId
                );

            if (existing.length > 0) {
                const duplicate = existing[0];

                if (
                    duplicate.MaterialSubCategoryTypeName === data.MaterialSubCategoryTypeName) 
                    {

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

            const result =
                await updateMaterialSubCategoryType(data);

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

        console.error("Error updating material sub category:", error);

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