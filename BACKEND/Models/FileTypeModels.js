import { pool } from "../Config/db.js";


// ==========================================================
// GET ALL FILE TYPES
// ==========================================================

export const getAllFileTypes = async () => {
    const query = `
        SELECT
            "FileTypeId",
            "FileTypeName",
            "Description",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName"
        FROM "LKP"."FileType"
<<<<<<< HEAD
        WHERE "FileTypeId" IN (1, 2, 3)
=======
        WHERE "FileTypeId" IN (1, 2)
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
        ORDER BY "FileTypeId";
    `;

    const result = await pool.query(query);

    return result.rows;
};


// ==========================================================
// CHECK FILE TYPE NAME
// Used while ADDING
// ==========================================================

export const checkFileTypeExists = async (FileTypeName) => {

    const query = `
        SELECT
            "FileTypeId",
            "FileTypeName"
        FROM "LKP"."FileType"
        WHERE LOWER("FileTypeName") = LOWER($1);
    `;

    const result = await pool.query(
        query,
        [FileTypeName]
    );

    return result.rows;
};


// ==========================================================
// CHECK FILE TYPE NAME FOR UPDATE
// Excludes current FileTypeId
// ==========================================================

export const checkFileTypeExistsForUpdate = async (
    FileTypeName,
    FileTypeId
) => {

    const query = `
        SELECT
            "FileTypeId",
            "FileTypeName"
        FROM "LKP"."FileType"
        WHERE
            LOWER("FileTypeName") = LOWER($1)
            AND "FileTypeId" <> $2;
    `;

    const result = await pool.query(
        query,
        [
            FileTypeName,
            FileTypeId
        ]
    );

    return result.rows;
};


// ==========================================================
// GET FILE TYPE BY ID
// ==========================================================

export const getFileTypeById = async (FileTypeId) => {

    const query = `
        SELECT
            "FileTypeId",
            "FileTypeName",
            "Description",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName"
        FROM "LKP"."FileType"
        WHERE "FileTypeId" = $1;
    `;

    const result = await pool.query(
        query,
        [FileTypeId]
    );

    return result.rows;
};


// ==========================================================
// ADD FILE TYPE
// ==========================================================

export const addFileType = async (fileTypeData) => {

    const query = `
        INSERT INTO "LKP"."FileType"
        (
            "FileTypeName",
            "Description",
            "IsDisabled",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES
        (
            $1,
            $2,
            false,
            CURRENT_TIMESTAMP,
            $3
        )
        RETURNING
            "FileTypeId",
            "FileTypeName",
            "Description",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName";
    `;

    const values = [
        fileTypeData.FileTypeName,
        fileTypeData.Description || null,
        fileTypeData.CreatedByUserName
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};


// ==========================================================
// UPDATE FILE TYPE
// ==========================================================

export const updateFileType = async (fileTypeData) => {

    const query = `
        UPDATE "LKP"."FileType"
        SET
            "FileTypeName" = $1,
            "Description" = $2,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $3
        WHERE "FileTypeId" = $4
        RETURNING
            "FileTypeId",
            "FileTypeName",
            "Description",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName";
    `;

    const values = [
        fileTypeData.FileTypeName,
        fileTypeData.Description || null,
        fileTypeData.UpdatedByUserName,
        fileTypeData.FileTypeId
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};


// ==========================================================
// DELETE FILE TYPE
// ==========================================================

export const deleteFileType = async (FileTypeId) => {

    const query = `
        DELETE FROM "LKP"."FileType"
        WHERE "FileTypeId" = $1;
    `;

    const result = await pool.query(
        query,
        [FileTypeId]
    );

    return result.rowCount;
};


// ==========================================================
// UPDATE FILE TYPE STATUS
// IsDisabled = true / false
// ==========================================================

export const updateFileTypeStatus = async (
    FileTypeId,
    IsDisabled,
    UpdatedByUserName
) => {

    const query = `
        UPDATE "LKP"."FileType"
        SET
            "IsDisabled" = $1,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $2
        WHERE "FileTypeId" = $3
        RETURNING
            "FileTypeId",
            "FileTypeName",
            "Description",
            "IsDisabled",
            "UpdatedAt",
            "UpdatedByUserName";
    `;

    const values = [
        IsDisabled,
        UpdatedByUserName,
        FileTypeId
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};