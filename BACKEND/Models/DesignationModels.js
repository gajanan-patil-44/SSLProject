import { pool } from "../Config/db.js";


// ======================================================
// GET ALL DESIGNATIONS
// ======================================================

export const getAllDesignations = async () => {

    try {

        const query = `
            SELECT
                cd."CompanyDesignationId",
                cd."CompanyId",
                c."CompanyName",
                c."CompanyCode",
                cd."DesignationName",
                cd."DesignationCode",
                cd."IsDisabled",
                cd."CreatedAt",
                cd."CreatedByUserName",
                cd."UpdateByUserName",
                cd."UpdatedAt"
            FROM "LKP"."CompanyDesignation" cd
            INNER JOIN "LKP"."Company" c
                ON c."CompanyId" = cd."CompanyId"
            WHERE cd."IsDisabled" = false
            ORDER BY cd."CompanyDesignationId" ASC
        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        console.error(
            "Error fetching all designations:",
            error
        );

        throw error;
    }
};


// ======================================================
// GET COMPANIES FOR ADD DROPDOWN
// ======================================================

export const getCompaniesForDropdown = async () => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName",
                "CompanyCode"
            FROM "LKP"."Company"
            WHERE "IsDisabled" = false
            ORDER BY "CompanyName" ASC
        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        console.error(
            "Error fetching companies for dropdown:",
            error
        );

        throw error;
    }
};


// ======================================================
// CHECK COMPANY EXISTS AND IS ACTIVE
// ======================================================

export const checkCompanyExists = async (CompanyId) => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName",
                "CompanyCode"
            FROM "LKP"."Company"
            WHERE
                "CompanyId" = $1
                AND "IsDisabled" = false
        `;

        const result = await pool.query(
            query,
            [CompanyId]
        );

        return result.rows;

    } catch (error) {

        console.error(
            "Error checking company:",
            error
        );

        throw error;
    }
};


// ======================================================
// CHECK DUPLICATE DESIGNATION FOR ADD
// ======================================================

export const checkDesignationData = async (
    CompanyId,
    DesignationName,
    DesignationCode
) => {

    try {

        const query = `
            SELECT
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled"
            FROM "LKP"."CompanyDesignation"
            WHERE
                "CompanyId" = $1
                AND "IsDisabled" = false
                AND (
                    LOWER(TRIM("DesignationName")) =
                        LOWER(TRIM($2))
                    OR
                    LOWER(TRIM("DesignationCode")) =
                        LOWER(TRIM($3))
                )
        `;

        const result = await pool.query(
            query,
            [
                CompanyId,
                DesignationName,
                DesignationCode
            ]
        );

        return result.rows;

    } catch (error) {

        console.error(
            "Error checking designation data:",
            error
        );

        throw error;
    }
};


// ======================================================
// ADD DESIGNATION
// ======================================================

export const addDesignation = async (designationData) => {

    try {

        const {
            CompanyId,
            DesignationName,
            DesignationCode,
            IsDisabled,
            CreatedByUserName
        } = designationData;


        const query = `
            INSERT INTO "LKP"."CompanyDesignation"
            (
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName"
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                CURRENT_TIMESTAMP,
                $5
            )
            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "UpdateByUserName",
                "UpdatedAt"
        `;

        const result = await pool.query(
            query,
            [
                CompanyId,
                DesignationName,
                DesignationCode,
                IsDisabled,
                CreatedByUserName
            ]
        );

        return result.rows[0];

    } catch (error) {

        console.error(
            "Error adding designation:",
            error
        );

        throw error;
    }
};


// ======================================================
// GET COMPANIES FOR EDIT DROPDOWN
// ======================================================

export const getCompaniesForEditDropdown = async () => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName",
                "CompanyCode"
            FROM "LKP"."Company"
            WHERE "IsDisabled" = false
            ORDER BY "CompanyName" ASC
        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        console.error(
            "Error fetching companies for edit dropdown:",
            error
        );

        throw error;
    }
};


// ======================================================
// GET DESIGNATION BY ID
// ======================================================

export const getDesignationById = async (
    CompanyDesignationId
) => {

    try {

        const query = `
            SELECT
                cd."CompanyDesignationId",
                cd."CompanyId",
                c."CompanyName",
                c."CompanyCode",
                cd."DesignationName",
                cd."DesignationCode",
                cd."IsDisabled",
                cd."CreatedAt",
                cd."CreatedByUserName",
                cd."UpdateByUserName",
                cd."UpdatedAt"
            FROM "LKP"."CompanyDesignation" cd
            INNER JOIN "LKP"."Company" c
                ON c."CompanyId" = cd."CompanyId"
            WHERE
                cd."CompanyDesignationId" = $1
        `;

        const result = await pool.query(
            query,
            [CompanyDesignationId]
        );

        return result.rows;

    } catch (error) {

        console.error(
            "Error fetching designation by ID:",
            error
        );

        throw error;
    }
};


// ======================================================
// CHECK DUPLICATE DESIGNATION FOR UPDATE
// ======================================================

export const checkDesignationExistsForUpdate = async (
    CompanyDesignationId,
    CompanyId,
    DesignationName,
    DesignationCode
) => {

    try {

        const query = `
            SELECT
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled"
            FROM "LKP"."CompanyDesignation"
            WHERE
                "CompanyId" = $1
                AND "CompanyDesignationId" <> $2
                AND "IsDisabled" = false
                AND (
                    LOWER(TRIM("DesignationName")) =
                        LOWER(TRIM($3))
                    OR
                    LOWER(TRIM("DesignationCode")) =
                        LOWER(TRIM($4))
                )
        `;

        const result = await pool.query(
            query,
            [
                CompanyId,
                CompanyDesignationId,
                DesignationName,
                DesignationCode
            ]
        );

        return result.rows;

    } catch (error) {

        console.error(
            "Error checking designation for update:",
            error
        );

        throw error;
    }
};


// ======================================================
// UPDATE DESIGNATION
// ======================================================

export const editDesignation = async (
    designationData
) => {

    try {

        const {
            CompanyDesignationId,
            CompanyId,
            DesignationName,
            DesignationCode,
            IsDisabled,
            UpdateByUserName
        } = designationData;


        const query = `
            UPDATE "LKP"."CompanyDesignation"
            SET
                "CompanyId" = $1,
                "DesignationName" = $2,
                "DesignationCode" = $3,
                "IsDisabled" = $4,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdateByUserName" = $5
            WHERE
                "CompanyDesignationId" = $6
            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "UpdateByUserName",
                "UpdatedAt"
        `;

        const result = await pool.query(
            query,
            [
                CompanyId,
                DesignationName,
                DesignationCode,
                IsDisabled,
                UpdateByUserName,
                CompanyDesignationId
            ]
        );

        return result.rows[0] || null;

    } catch (error) {

        console.error(
            "Error updating designation:",
            error
        );

        throw error;
    }
};


// ======================================================
// TOGGLE DESIGNATION STATUS
// ======================================================

export const toggleDesignationStatuses = async (
    designationData
) => {

    try {

        const {
            CompanyDesignationId,
            IsDisabled,
            UpdateByUserName
        } = designationData;


        const query = `
            UPDATE "LKP"."CompanyDesignation"
            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdateByUserName" = $2
            WHERE
                "CompanyDesignationId" = $3
            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "UpdateByUserName",
                "UpdatedAt"
        `;

        const result = await pool.query(
            query,
            [
                IsDisabled,
                UpdateByUserName,
                CompanyDesignationId
            ]
        );

        return result.rows[0] || null;

    } catch (error) {

        console.error(
            "Error toggling designation status:",
            error
        );

        throw error;
    }
};


// ======================================================
// DELETE DESIGNATION
// ======================================================

export const deleteDesignation = async (
    CompanyDesignationId
) => {

    try {

        const query = `
            DELETE FROM "LKP"."CompanyDesignation"
            WHERE
                "CompanyDesignationId" = $1
            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode"
        `;

        const result = await pool.query(
            query,
            [CompanyDesignationId]
        );

        return result.rows[0] || null;

    } catch (error) {

        console.error(
            "Error deleting designation:",
            error
        );

        throw error;
    }
};