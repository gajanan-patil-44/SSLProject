import {
    getAllMaterials,
    getMaterialCategoryDropdown,
    getMaterialSubCategoryDropdown,
    getUOMDropdown,
    getGSTTypeDropdown,
    getGSTRateDropdown,
    getFileTypeDropdown,
    addMaterial,
    updateMaterial,
    updateMaterialStatus
} from "../../Models/Material/MaterialModel.js";


// =====================================================
// HELPER - PREPARE UPLOADED FILES
// =====================================================

const prepareMaterialFiles = (req) => {
    const uploadedFiles = req.files || [];
    const rawFileTypeIds = req.body.FileTypeIds;

    // No files uploaded
    if (uploadedFiles.length === 0) {
        if (rawFileTypeIds !== undefined) {
            throw new Error(
                "Upload a file for every FileTypeId"
            );
        }

        return [];
    }

    // FileTypeIds must be provided
    if (rawFileTypeIds === undefined) {
        throw new Error(
            "Provide one FileTypeId for every uploaded file"
        );
    }

    // Support one FileTypeId or multiple repeated FileTypeIds
    const fileTypeIds = Array.isArray(rawFileTypeIds)
        ? rawFileTypeIds
        : [rawFileTypeIds];

    // Each file must have exactly one FileTypeId
    if (fileTypeIds.length !== uploadedFiles.length) {
        throw new Error(
            `Uploaded ${uploadedFiles.length} files, but received ${fileTypeIds.length} FileTypeIds`
        );
    }

    // Dynamically associate each FileTypeId with its file
    return uploadedFiles.map((file, index) => {
        const fileTypeId = Number(fileTypeIds[index]);

        if (!Number.isInteger(fileTypeId) || fileTypeId <= 0) {
            throw new Error(
                `Invalid FileTypeId at position ${index + 1}`
            );
        }

        return {
            FileTypeId: fileTypeId,
            FilePatch: `uploads/Materials/${file.filename}`
        };
    });
};


// =====================================================
// FLAG ID 1 - VIEW ALL MATERIALS
// =====================================================

export const getMaterial = async (req, res) => {
    try {
        if (Number(req.body.FlagId) !== 1) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 1."
            });
        }

        const rows = await getAllMaterials();

        return res.status(200).json({
            status: "success",
            message: "Materials fetched successfully",
            data: rows
        });
    } catch (error) {
        console.error("Get materials error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch materials",
            error: error.message
        });
    }
};


// =====================================================
// FLAG ID 2 TO 7 - SEPARATE DROPDOWNS
// =====================================================

export const getMaterialDropdown = async (req, res) => {
    try {
        const FlagId = Number(req.body.FlagId);

        let data;
        let message;

        switch (FlagId) {
            case 2:
                data = await getMaterialCategoryDropdown();
                message = "Material categories fetched successfully";
                break;

            case 3:
                data = await getMaterialSubCategoryDropdown();
                message = "Material sub-categories fetched successfully";
                break;

            case 4:
                data = await getUOMDropdown();
                message = "UOM dropdown fetched successfully";
                break;

            case 5:
                data = await getGSTTypeDropdown();
                message = "GST types fetched successfully";
                break;

            case 6:
                data = await getGSTRateDropdown();
                message = "GST rates fetched successfully";
                break;

            case 7:
                data = await getFileTypeDropdown();
                message = "File types fetched successfully";
                break;

            default:
                return res.status(400).json({
                    status: "error",
                    message: "Invalid FlagId. Use FlagId 2 to 7."
                });
        }

        return res.status(200).json({
            status: "success",
            message,
            data
        });
    } catch (error) {
        console.error("Material dropdown error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch material dropdown",
            error: error.message
        });
    }
};


// =====================================================
// FLAG ID 8 - ADD MATERIAL WITH MULTER FILES
// =====================================================

export const createMaterial = async (req, res) => {
    try {
        if (Number(req.body.FlagId) !== 8) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 8."
            });
        }

        const data = req.body;

        if (
            !data.MaterialName?.trim() ||
            !data.MaterialCode?.trim()
        ) {
            return res.status(400).json({
                status: "error",
                message: "MaterialName and MaterialCode are required"
            });
        }

        const files = prepareMaterialFiles(req);

        const result = await addMaterial(data, files);

        return res.status(201).json({
            status: "success",
            message: "Material added successfully",
            data: result
        });
    } catch (error) {
        console.error("Create material error:", error);

        if (
            error.message.startsWith("FileTypeIds") ||
            error.message.startsWith("Provide one FileTypeId") ||
            error.message.startsWith("Every FileTypeId")
        ) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to add material",
            error: error.message
        });
    }
};


// =====================================================
// FLAG ID 9 - EDIT MATERIAL
// =====================================================

export const editMaterial = async (req, res) => {
    try {
        if (Number(req.body.FlagId) !== 9) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 9."
            });
        }

        const data = req.body;

        if (
            !Number.isInteger(Number(data.MaterialId)) ||
            Number(data.MaterialId) <= 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "A valid MaterialId is required"
            });
        }

        if (
            !data.MaterialName?.trim() ||
            !data.MaterialCode?.trim()
        ) {
            return res.status(400).json({
                status: "error",
                message: "MaterialName and MaterialCode are required"
            });
        }

        const files = prepareMaterialFiles(req);

        const result = await updateMaterial(data, files);

        if (!result) {
            return res.status(404).json({
                status: "error",
                message: "Material not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Material updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Edit material error:", error);

        if (
            error.message.startsWith("FileTypeIds") ||
            error.message.startsWith("Provide one FileTypeId") ||
            error.message.startsWith("Every FileTypeId")
        ) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        } 

        return res.status(500).json({
            status: "error",
            message: "Failed to update material",
            error: error.message
        });
    }
};


// =====================================================
// FLAG ID 10 - ENABLE / DISABLE MATERIAL
// =====================================================

export const updateMaterialStatusController = async (req, res) => {
    try {
        const {
            FlagId,
            MaterialId,
            IsDisabled
        } = req.body;

        if (Number(FlagId) !== 10) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Use FlagId 10."
            });
        }

        if (
            !Number.isInteger(Number(MaterialId)) ||
            Number(MaterialId) <= 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "A valid MaterialId is required"
            });
        }

        if (typeof IsDisabled !== "boolean") {
            return res.status(400).json({
                status: "error",
                message: "IsDisabled must be true or false"
            });
        }

        const result = await updateMaterialStatus(
            Number(MaterialId),
            IsDisabled
        );

        if (!result) {
            return res.status(404).json({
                status: "error",
                message: "Material not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: IsDisabled
                ? "Material disabled successfully"
                : "Material enabled successfully",
            data: result
        });
    } catch (error) {
        console.error("Material status error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update material status",
            error: error.message
        });
    }
};



