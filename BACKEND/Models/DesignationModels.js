import { pool } from "../Config/db.js";


// ==========================================
// GET ALL DESIGNATIONS
// ==========================================

export const getAllDesignations = async () => {

    try {

        const query = `
            SELECT
                CD."CompanyDesignationId",
                C."CompanyName",
                CD."CompanyId",
                CD."DesignationName",
                CD."DesignationCode",
                CD."IsDisabled",
                CD."CreatedAt",
                CD."CreatedByUserName",
                CD."UpdateByUserName",
                CD."UpdatedAt"
            FROM "LKP"."CompanyDesignation" CD
            INNER JOIN "LKP"."Company" C
                ON CD."CompanyId" = C."CompanyId"
            WHERE CD."IsDisabled" = FALSE
            ORDER BY CD."CreatedAt" DESC;
        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        console.error("Error fetching designations:", error);

        throw error;
    }
};


// ==========================================
// GET COMPANIES FOR DROPDOWN
// ==========================================

export const getCompaniesForDropdown = async () => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName"
            FROM "LKP"."Company"
            WHERE "IsDisabled" = false
            ORDER BY "CompanyName";
        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        console.error("Error fetching companies for designation dropdown:", error);

        throw error;
    }
};


// ==========================================
// CHECK COMPANY EXISTS
// ==========================================

export const checkCompanyExists = async (CompanyId) => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName"
            FROM "LKP"."Company"
            WHERE "CompanyId" = $1
            AND "IsDisabled" = false;
        `;

        const values = [CompanyId];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        console.error("Error checking company:", error);

        throw error;
    }
};


// ==========================================
// CHECK DUPLICATE DESIGNATION
// ==========================================

export const checkDesignationData = async (CompanyId, DesignationCode, DesignationName) => {

    try {

        const query = `
            SELECT
                "CompanyDesignationId",
                "CompanyId",
                "DesignationCode",
                "DesignationName"
            FROM "LKP"."CompanyDesignation"
            WHERE "CompanyId" = $1
            AND (
                "DesignationCode" = $2
                OR "DesignationName" = $3
            );
        `;

        const values = [
            CompanyId,
            DesignationCode,
            DesignationName
        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        console.error("Error checking designation:", error);

        throw error;
    }
};


// ==========================================
// ADD DESIGNATION
// ==========================================

export const addDesignation = async (designationData) => {

    try {

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
                "CreatedByUserName";
        `;

        const values = [
            designationData.CompanyId,
            designationData.DesignationName,
            designationData.DesignationCode,
            designationData.IsDisabled,
            designationData.CreatedByUserName
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        console.error("Error adding designation:", error);

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
                "CompanyName"
            FROM "LKP"."Company"
            WHERE "IsDisabled" = false
            ORDER BY "CompanyName";
        `;


        const result = await pool.query(query);


        return result.rows;

    } catch (error) {

        console.error("Error fetching companies for edit dropdown:", error);

        throw error;
    }
};



// ==========================================
// GET DESIGNATION BY ID
// ==========================================

export const getDesignationById = async (CompanyDesignationId) => {

    try {

        const query = `
            SELECT
                CD."CompanyDesignationId",
                CD."CompanyId",
                C."CompanyName",
                CD."DesignationName",
                CD."DesignationCode",
                CD."IsDisabled",
                CD."CreatedAt",
                CD."CreatedByUserName",
                CD."UpdateByUserName",
                CD."UpdatedAt"
            FROM "LKP"."CompanyDesignation" CD
            INNER JOIN "LKP"."Company" C
                ON CD."CompanyId" = C."CompanyId"
            WHERE CD."CompanyDesignationId" = $1;
        `;


        const values = [CompanyDesignationId];


        const result = await pool.query(query, values);


        return result.rows;

    } catch (error) {

        console.error("Error fetching designation by ID:", error);

        throw error;
    }
};



// ======================================================
// CHECK DUPLICATE DESIGNATION FOR UPDATE
// ======================================================

export const checkDesignationExistsForUpdate = async (CompanyDesignationId, CompanyId, DesignationCode, DesignationName) => {

    try {

        const query = `
            SELECT
                "CompanyDesignationId",
                "CompanyId",
                "DesignationCode",
                "DesignationName"
            FROM "LKP"."CompanyDesignation"
            WHERE "CompanyId" = $1
            AND "CompanyDesignationId" <> $2
            AND (
                LOWER(TRIM("DesignationCode")) =
                    LOWER(TRIM($3))
                OR
                LOWER(TRIM("DesignationName")) =
                    LOWER(TRIM($4))
            );
        `;


        const values = [
            CompanyId,
            CompanyDesignationId,
            DesignationCode,
            DesignationName
        ];


        const result = await pool.query(query, values);


        return result.rows;

    } catch (error) {

        console.error("Error checking designation for update:", error);

        throw error;
    }
};



// ==========================================
// EDIT DESIGNATION
// ==========================================

export const editDesignation = async (designationData) => {

    try {

        const query = `
            UPDATE "LKP"."CompanyDesignation"
            SET
                "CompanyId" = $1,
                "DesignationName" = $2,
                "DesignationCode" = $3,
                "IsDisabled" = $4,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdateByUserName" = $5
            WHERE "CompanyDesignationId" = $6;
        `;


        const values = [
            designationData.CompanyId,
            designationData.DesignationName,
            designationData.DesignationCode,
            designationData.IsDisabled,
            designationData.UpdateByUserName,
            designationData.CompanyDesignationId
        ];


        const result = await pool.query(query, values);


        return result.rowCount;

    } catch (error) {

        console.error("Error updating designation:", error);

        throw error;
    }
};



// ==========================================
// DELETE DESIGNATION
// ==========================================

export const deleteDesignation = async (CompanyDesignationId) => {

    try {
        const query = `
            DELETE FROM "LKP"."CompanyDesignation"
            WHERE "CompanyDesignationId" = $1;
        `;


        const values = [
            CompanyDesignationId
        ];


        const result = await pool.query(query, values);


        return result.rowCount;

    } catch (error) {

        console.error("Error deleting designation:", error);

        throw error;
    }
};