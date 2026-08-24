import {
    getAllFileTypes,
    checkFileTypeExists,
    checkFileTypeExistsForUpdate,
    addFileType,
    updateFileType,
    deleteFileType,
    updateFileTypeStatus
} from "../../Models/FileTypeModels.js";


// ==========================================================
// GET ALL FILE TYPES
// FlagId = 1
// ==========================================================

export const getFileTypesController = async (req, res) => {

    try {

        const { FlagId } = req.body;

        // ------------------------------------------
        // VALIDATE FLAG ID
        // ------------------------------------------

        if (
            FlagId === undefined ||
            FlagId === null ||
            String(FlagId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        if (Number(FlagId) !== 1) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId"
            });
        }

        // ------------------------------------------
        // GET ALL FILE TYPES
        // ------------------------------------------

        const result = await getAllFileTypes();

        return res.status(200).json({
            status: "success",
            message: "File types fetched successfully",
            data: result
        });

    } catch (error) {

        console.error("Get File Types Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch file types",
            error: error.message
        });
    }
};


// ==========================================================
// ADD FILE TYPE
// FlagId = 2
// ==========================================================

export const addFileTypeController = async (req, res) => {

    try {

        const {
            FlagId,
            FileTypeName,
            Description,
            CreatedByUserName
        } = req.body;

        // ------------------------------------------
        // FLAG ID VALIDATION
        // ------------------------------------------

        if (
            FlagId === undefined ||
            FlagId === null ||
            String(FlagId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        if (Number(FlagId) !== 2) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Expected FlagId 2"
            });
        }

        // ------------------------------------------
        // FILE TYPE NAME VALIDATION
        // ------------------------------------------

        if (
            FileTypeName === undefined ||
            FileTypeName === null ||
            String(FileTypeName).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FileTypeName is required"
            });
        }

        // ------------------------------------------
        // CREATED BY VALIDATION
        // ------------------------------------------

        if (
            CreatedByUserName === undefined ||
            CreatedByUserName === null ||
            String(CreatedByUserName).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "CreatedByUserName is required"
            });
        }

        const fileTypeData = {
            FileTypeName: String(FileTypeName).trim(),
            Description:
                Description === undefined ||
                Description === null
                    ? null
                    : String(Description).trim(),
            CreatedByUserName: String(CreatedByUserName).trim()
        };

        // ------------------------------------------
        // CHECK DUPLICATE FILE TYPE
        // ------------------------------------------

        const existingFileType =
            await checkFileTypeExists(
                fileTypeData.FileTypeName
            );

        if (existingFileType.length > 0) {

            return res.status(409).json({
                status: "error",
                message: "File type already exists"
            });
        }

        // ------------------------------------------
        // ADD FILE TYPE
        // ------------------------------------------

        const result =
            await addFileType(fileTypeData);

        return res.status(201).json({
            status: "success",
            message: "File type created successfully",
            data: result
        });

    } catch (error) {

        console.error("Add File Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to create file type",
            error: error.message
        });
    }
};


// ==========================================================
// UPDATE FILE TYPE
// FlagId = 3
// ==========================================================

export const updateFileTypeController = async (req, res) => {

    try {

        const {
            FlagId,
            FileTypeId,
            FileTypeName,
            Description,
            UpdatedByUserName
        } = req.body;

        // ------------------------------------------
        // FLAG ID VALIDATION
        // ------------------------------------------

        if (
            FlagId === undefined ||
            FlagId === null ||
            String(FlagId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        if (Number(FlagId) !== 3) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Expected FlagId 3"
            });
        }

        // ------------------------------------------
        // FILE TYPE ID VALIDATION
        // ------------------------------------------

        if (
            FileTypeId === undefined ||
            FileTypeId === null ||
            String(FileTypeId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FileTypeId is required"
            });
        }

        if (
            !Number.isInteger(Number(FileTypeId)) ||
            Number(FileTypeId) <= 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FileTypeId"
            });
        }

        // ------------------------------------------
        // FILE TYPE NAME VALIDATION
        // ------------------------------------------

        if (
            FileTypeName === undefined ||
            FileTypeName === null ||
            String(FileTypeName).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FileTypeName is required"
            });
        }

        // ------------------------------------------
        // UPDATED BY VALIDATION
        // ------------------------------------------

        if (
            UpdatedByUserName === undefined ||
            UpdatedByUserName === null ||
            String(UpdatedByUserName).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "UpdatedByUserName is required"
            });
        }

        const fileTypeData = {
            FileTypeId: Number(FileTypeId),
            FileTypeName: String(FileTypeName).trim(),
            Description:
                Description === undefined ||
                Description === null
                    ? null
                    : String(Description).trim(),
            UpdatedByUserName:
                String(UpdatedByUserName).trim()
        };

        // ------------------------------------------
        // CHECK DUPLICATE NAME
        // ------------------------------------------

        const duplicate =
            await checkFileTypeExistsForUpdate(
                fileTypeData.FileTypeName,
                fileTypeData.FileTypeId
            );

        if (duplicate.length > 0) {

            return res.status(409).json({
                status: "error",
                message:
                    "Another file type with the same name already exists"
            });
        }

        // ------------------------------------------
        // UPDATE FILE TYPE
        // ------------------------------------------

        const result =
            await updateFileType(fileTypeData);

        if (!result) {

            return res.status(404).json({
                status: "error",
                message: "File type not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "File type updated successfully",
            data: result
        });

    } catch (error) {

        console.error("Update File Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update file type",
            error: error.message
        });
    }
};


// ==========================================================
// DELETE FILE TYPE
// FlagId = 4
// ==========================================================

export const deleteFileTypeController = async (req, res) => {

    try {

        const {
            FlagId,
            FileTypeId
        } = req.body;

        // ------------------------------------------
        // FLAG ID VALIDATION
        // ------------------------------------------

        if (
            FlagId === undefined ||
            FlagId === null ||
            String(FlagId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        if (Number(FlagId) !== 4) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Expected FlagId 4"
            });
        }

        // ------------------------------------------
        // FILE TYPE ID VALIDATION
        // ------------------------------------------

        if (
            FileTypeId === undefined ||
            FileTypeId === null ||
            String(FileTypeId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FileTypeId is required"
            });
        }

        if (
            !Number.isInteger(Number(FileTypeId)) ||
            Number(FileTypeId) <= 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FileTypeId"
            });
        }

        // ------------------------------------------
        // DELETE
        // ------------------------------------------

        const deleted =
            await deleteFileType(
                Number(FileTypeId)
            );

        if (!deleted) {

            return res.status(404).json({
                status: "error",
                message: "File type not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "File type deleted successfully"
        });

    } catch (error) {

        console.error("Delete File Type Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to delete file type",
            error: error.message
        });
    }
};


// ==========================================================
// UPDATE FILE TYPE STATUS
// FlagId = 5
// ==========================================================

export const updateFileTypeStatusController = async (req, res) => {

    try {

        const {
            FlagId,
            FileTypeId,
            IsDisabled,
            UpdatedByUserName
        } = req.body;

        // ------------------------------------------
        // FLAG ID VALIDATION
        // ------------------------------------------

        if (
            FlagId === undefined ||
            FlagId === null ||
            String(FlagId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        if (Number(FlagId) !== 5) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId. Expected FlagId 5"
            });
        }

        // ------------------------------------------
        // FILE TYPE ID VALIDATION
        // ------------------------------------------

        if (
            FileTypeId === undefined ||
            FileTypeId === null ||
            String(FileTypeId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FileTypeId is required"
            });
        }

        if (
            !Number.isInteger(Number(FileTypeId)) ||
            Number(FileTypeId) <= 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FileTypeId"
            });
        }

        // ------------------------------------------
        // IS DISABLED VALIDATION
        // ------------------------------------------

        if (typeof IsDisabled !== "boolean") {

            return res.status(400).json({
                status: "error",
                message: "IsDisabled must be true or false"
            });
        }

        // ------------------------------------------
        // UPDATED BY VALIDATION
        // ------------------------------------------

        if (
            UpdatedByUserName === undefined ||
            UpdatedByUserName === null ||
            String(UpdatedByUserName).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "UpdatedByUserName is required"
            });
        }

        // ------------------------------------------
        // UPDATE STATUS
        // ------------------------------------------

        const result =
            await updateFileTypeStatus(
                Number(FileTypeId),
                IsDisabled,
                String(UpdatedByUserName).trim()
            );

        if (!result) {

            return res.status(404).json({
                status: "error",
                message: "File type not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: IsDisabled
                ? "File type disabled successfully"
                : "File type enabled successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Update File Type Status Error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to update file type status",
            error: error.message
        });
    }
};