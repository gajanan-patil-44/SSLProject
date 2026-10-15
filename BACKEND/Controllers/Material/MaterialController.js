import fs from "fs";
import path from "path";
import "dotenv/config";
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
    updateMaterialStatus,
    fetchMaterialFilePath
} from "../../Models/Material/MaterialModel.js";

// =====================================================
// HELPER - PREPARE UPLOADED FILES
// ====================================================
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
// ====================================================
export const getMaterial = async (req, res) => {
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 1) {
            const data = await getAllMaterials();

            return res.status(200).json({
                status: "success",
                message: "Materials fetched successfully",
                data
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 1."
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
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 2) {
            const data = await getMaterialCategoryDropdown();

            return res.status(200).json({
                status: "success",
                message: "Material categories fetched successfully",
                data
            });
        }

        if (parseInt(FlagId) === 3) {
            const { MaterialCategoryTypeId } = req.body;

            if (!MaterialCategoryTypeId) {
                return res.status(400).json({
                    status: "error",
                    message: "MaterialCategoryTypeId is required"
                });
            }

            const data = await getMaterialSubCategoryDropdown(
                MaterialCategoryTypeId
            );

            return res.status(200).json({
                status: "success",
                message: "Material sub-categories fetched successfully",
                data
            });
        }

        if (parseInt(FlagId) === 4) {
            const data = await getUOMDropdown();

            return res.status(200).json({
                status: "success",
                message: "UOM dropdown fetched successfully",
                data
            });
        }

        if (parseInt(FlagId) === 5) {
            const data = await getGSTTypeDropdown();

            return res.status(200).json({
                status: "success",
                message: "GST types fetched successfully",
                data
            });
        }

        if (parseInt(FlagId) === 6) {
            const data = await getGSTRateDropdown();

            return res.status(200).json({
                status: "success",
                message: "GST rates fetched successfully",
                data
            });
        }

        if (parseInt(FlagId) === 7) {
            const data = await getFileTypeDropdown();

            return res.status(200).json({
                status: "success",
                message: "File types fetched successfully",
                data
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 2 to 7."
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
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 8) {
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
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 8."
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
    const { FlagId } = req.body;

    try {
        if (parseInt(FlagId) === 9) {
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
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 9."
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
    const { FlagId, MaterialId, IsDisabled } = req.body;

    try {
        if (parseInt(FlagId) === 10) {

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
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 10."
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
// =====================================================
// FLAG ID 11 - VIEW MATERIAL FILE
// =====================================================
export const viewMaterialFile = async (req, res) => {
    const { FlagId, MaterialFileId } = req.body || {};

    try {
        if (parseInt(FlagId) === 11) {

            // MATERIAL FILE ID VALIDATION
            if (
                MaterialFileId === undefined ||
                MaterialFileId === null ||
                String(MaterialFileId).trim() === "" ||
                !Number.isSafeInteger(Number(MaterialFileId)) ||
                Number(MaterialFileId) <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "A valid MaterialFileId is required"
                });
            }

            // FETCH FILE PATH FROM DATABASE
            const files = await fetchMaterialFilePath(
                Number(MaterialFileId)
            );

            if (!files || files.length === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Material file not found"
                });
            }

            const FilePatch = files[0].FilePatch;

            if (
                typeof FilePatch !== "string" ||
                !FilePatch.trim()
            ) {
                return res.status(404).json({
                    status: "error",
                    message: "Material file path not available"
                });
            }

            // USE THE SAME DIRECTORY AS MULTER
            const uploadDirectory = path.resolve(
                process.env.MATERIAL_UPLOAD_DIR || "./uploads/Materials"
            );

            // GET THE STORED FILE NAME
            const fileName = path.basename(
                FilePatch.trim().replace(/\\/g, "/")
            );

            // CONSTRUCT THE ABSOLUTE PATH
            const absolutePath = path.join(uploadDirectory, fileName);

            // VERIFY FILE PATH
            if (path.dirname(absolutePath) !== uploadDirectory) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid material file path"
                });
            }

            // CHECK WHETHER THE FILE EXISTS
            let fileStats;

            try {
                fileStats = await fs.promises.stat(absolutePath);
            } catch (error) {
                if (error.code === "ENOENT") {
                    return res.status(404).json({
                        status: "error",
                        message: "Material file does not exist on server",
                        checkedPath: absolutePath
                    });
                }

                throw error;
            }

            if (!fileStats.isFile()) {
                return res.status(404).json({
                    status: "error",
                    message: "Material file not found on server"
                });
            }

            // VALIDATE FILE TYPE
            const ext = path.extname(fileName).toLowerCase();

            const contentTypes = {
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".webp": "image/webp",
                ".pdf": "application/pdf"
            };

            if (!contentTypes[ext]) {
                return res.status(400).json({
                    status: "error",
                    message: "Unsupported material file type"
                });
            }

            // SET RESPONSE HEADERS
            res.setHeader("Content-Type", contentTypes[ext]);

            res.setHeader(
                "Content-Disposition",
                `inline; filename="MaterialFile${ext}"`
            );

            res.setHeader("X-Content-Type-Options", "nosniff");

            // STREAM FILE
            const fileStream = fs.createReadStream(absolutePath);

            fileStream.on("error", (error) => {
                console.error("Material File Stream Error:", error);

                if (!res.headersSent) {
                    return res.status(500).json({
                        status: "error",
                        message: "Unable to read material file"
                    });
                }

                res.destroy(error);
            });

            return fileStream.pipe(res);
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use FlagId 11."
        });

    } catch (error) {
        console.error("View Material File Error:", error);

        if (res.headersSent) {
            return res.end();
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to view material file",
            error: error.message
        });
    }
};