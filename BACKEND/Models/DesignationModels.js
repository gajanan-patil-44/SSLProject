import { pool } from "../Config/db.js";


// GET ALL DESIGNATIONS

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
                cd."UpdatedAt",
                cd."DesignationLevel",
                cd."CanBeReportingManager"
            
            FROM "LKP"."CompanyDesignation" cd
            INNER JOIN "LKP"."Company" c
                ON c."CompanyId" = cd."CompanyId"
            ORDER BY cd."CompanyDesignationId" ASC
        `;


        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        // console.error("Error fetching all designations:", error);

        throw error;
    }
};



// GET COMPANIES FOR DROPDOWN

export const getCompaniesForDropdown = async () => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName"
            FROM "LKP"."Company"
            
            ORDER BY "CompanyName";
        `;


        const result = await pool.query(query);


        return result.rows;

    } catch (error) {

        // console.error("Error fetching companies for designation dropdown:", error);

        throw error;
    }
};



// CHECK COMPANY EXISTS AND ACTIVE

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

        const result = await pool.query(
            query,
            values
        );


        return result.rows;

    } catch (error) {

        // console.error("Error checking company:", error);

        throw error;
    }
};


// CHECK DESIGNATION FOR ADD

export const checkDesignationExists = async (
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
                "DesignationCode"
            FROM "LKP"."CompanyDesignation"

            WHERE "CompanyId" = $1

            AND (
                LOWER(TRIM("DesignationName")) =
                    LOWER(TRIM($2))

                OR

                LOWER(TRIM("DesignationCode")) =
                    LOWER(TRIM($3))
            );
        `;


        const values = [
            CompanyId,
            DesignationName,
            DesignationCode
        ];


        const result = await pool.query(
            query,
            values
        );


        return result.rows;

    } catch (error) {

        // console.error("Error checking designation:", error);

        throw error;
    }
};



// ADD DESIGNATION

export const addDesignation = async (designationData) => {

    try {

        const query = `
            INSERT INTO "LKP"."CompanyDesignation"
            (
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "DesignationLevel",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "CanBeReportingManager"
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                CURRENT_TIMESTAMP,
                $6,
                true
            )

            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "DesignationLevel",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName";
        `;


        const values = [
            designationData.CompanyId,
            designationData.DesignationName,
            designationData.DesignationCode,
            designationData.DesignationLevel,
            designationData.IsDisabled,
            designationData.CreatedByUserName
        ];


        const result = await pool.query(
            query,
            values
        );


        return result.rows[0];

    } catch (error) {

        throw error;
    }
};


// CHECK DESIGNATION FOR UPDATE

export const checkDesignationExistsForUpdate = async (
    CompanyId,
    DesignationName,
    DesignationCode,
    CompanyDesignationId
) => {

    try {

        const query = `
            SELECT
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode"

            FROM "LKP"."CompanyDesignation"

            WHERE "CompanyId" = $1

            AND "CompanyDesignationId" <> $4

            AND (
                LOWER(TRIM("DesignationName")) =
                    LOWER(TRIM($2))

                OR

                LOWER(TRIM("DesignationCode")) =
                    LOWER(TRIM($3))
            );
        `;


        const values = [
            CompanyId,
            DesignationName,
            DesignationCode,
            CompanyDesignationId
        ];


        const result = await pool.query(
            query,
            values
        );


        return result.rows;

    } catch (error) {

        // console.error("Error checking designation for update:", error);

        throw error;
    }
};


// EDIT DESIGNATION

export const editDesignation = async (designationData) => {

    try {

        const query = `
            UPDATE "LKP"."CompanyDesignation"

            SET
                "CompanyId" = $1,
                "DesignationName" = $2,
                "DesignationCode" = $3,
                "IsDisabled" = $4,
                "UpdateByUserName" = $5,
                "UpdatedAt" = CURRENT_TIMESTAMP
                "CanBeReportingManager = $6

            WHERE
                "CompanyDesignationId" = $7;
        `;


        const values = [
            designationData.CompanyId,
            designationData.DesignationName,
            designationData.DesignationCode,
            designationData.IsDisabled,
            designationData.UpdateByUserName,
            designationData.CompanyDesignationId,
            designationData.CanBeReportingManager
        ];


        const result = await pool.query(
            query,
            values
        );


        return result.rowCount;

    } catch (error) {

        // console.error("Error editing designation:", error);

        throw error;
    }
};



// TOGGLE DESIGNATION STATUS

export const toggleDesignationStatuses = async (designationData) => {

    try {

        const query = `
            UPDATE "LKP"."CompanyDesignation"

            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdateByUserName" = $2

            WHERE "CompanyDesignationId" = $3

            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled",
                "UpdatedAt",
                "UpdateByUserName";
        `;


        const values = [
            designationData.IsDisabled,
            designationData.UpdateByUserName,
            designationData.CompanyDesignationId
        ];


        const result = await pool.query(
            query,
            values
        );


        return result.rows[0];

    } catch (error) {

        // console.error("Error toggling designation status:", error);

        throw error;
    }
};


// DELETE DESIGNATION

export const deleteDesignation = async (CompanyDesignationId) => {

    try {

        const query = `
            DELETE FROM "LKP"."CompanyDesignation"
            WHERE "CompanyDesignationId" = $1;
        `;

        const values = [CompanyDesignationId];


        const result = await pool.query(
            query,
            values
        );


        return result.rowCount;

    } catch (error) {

        // console.error("Error deleting designation:", error);

        throw error;
    }
};



