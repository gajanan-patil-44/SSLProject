import { pool } from "../Config/db.js";


// GET ALL DESIGNATIONS


export const getAllDesignations = async (CompanyId) => {

    try {

        const query = `
            SELECT
                CD."CompanyDesignationId",
                CD."CompanyId",
                C."CompanyName",
                C."CompanyCode",

                D."DesignationId",
                D."DesignationName",
                D."DesignationCode",

                CD."IsDisabled",
                CD."CreatedAt",
                CD."CreatedByUserName",
                CD."UpdateByUserName",
                CD."UpdatedAt",
                CD."DesignationLevel",
                CD."CanBeReportingManager"

            FROM "LKP"."Designation" D

            INNER JOIN "DATA"."CompanyDesignation" CD
                ON D."DesignationId" = CD."DesignationId"

            LEFT JOIN "LKP"."Company" C
                ON C."CompanyId" = CD."CompanyId"

            WHERE
                ($1::SMALLINT IS NULL OR CD."CompanyId" = $1)

            ORDER BY CD."CompanyDesignationId" ASC;
        `;

        const result = await pool.query(query, [CompanyId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// GET COMPANIES FOR DROPDOWN

export const getCompaniesForDropdown = async (CompanyId) => {

    const query = `
        SELECT
            "CompanyId",
            "CompanyName"
        FROM "LKP"."Company"
        WHERE "IsDisabled" = false
        AND ($1::SMALLINT IS NULL OR "CompanyId" = $1)
        ORDER BY "CompanyName";
    `;

    const result = await pool.query(query, [CompanyId]);

    return result.rows;
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

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==========================================
        // 1. CHECK EXISTING DESIGNATION
        // ==========================================

        const existingQuery = `
            SELECT
                "DesignationId",
                "DesignationName",
                "DesignationCode"
            FROM "LKP"."Designation"
            WHERE LOWER(TRIM("DesignationName")) =
                  LOWER(TRIM($1))
            LIMIT 1;
        `;

        const existingResult = await client.query(
            existingQuery,
            [designationData.DesignationName]
        );

        let designationId;

        // ==========================================
        // 2. INSERT OR REUSE LKP.DESIGNATION
        // ==========================================

        if (existingResult.rowCount > 0) {

            designationId = existingResult.rows[0].DesignationId;

        } else {

            const designationQuery = `
                INSERT INTO "LKP"."Designation"
                (
                    "DesignationName",
                    "DesignationCode",
                    "IsDisabled",
                    "CreatedAt",
                    "CreatedByUserName"
                )
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
                RETURNING "DesignationId", "DesignationName",
                          "DesignationCode";
            `;

            const designationValues = [
                designationData.DesignationName,
                designationData.DesignationCode,
                designationData.IsDisabled ?? false,
                designationData.CreatedByUserName
            ];

            const designationResult = await client.query(
                designationQuery,
                designationValues
            );

            designationId = designationResult.rows[0].DesignationId;
        }

        // ==========================================
        // 3. CHECK COMPANY DESIGNATION DUPLICATE
        // ==========================================

        const duplicateQuery = `
            SELECT "CompanyDesignationId"
            FROM "DATA"."CompanyDesignation"
            WHERE
                "DesignationId" = $1
                AND "CompanyId" IS NOT DISTINCT FROM $2::SMALLINT;
        `;

        const duplicateResult = await client.query(
            duplicateQuery,
            [
                designationId,
                designationData.CompanyId ?? null
            ]
        );

        if (duplicateResult.rowCount > 0) {
            throw new Error(
                "This designation is already assigned to this company"
            );
        }

        // ==========================================
        // 4. INSERT DATA.COMPANYDESIGNATION
        // ==========================================

        const companyDesignationQuery = `
            INSERT INTO "DATA"."CompanyDesignation"
            (
                "CompanyId",
                "DesignationId",
                "DesignationLevel",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "CanBeReportingManager"
            )
            VALUES
            (
                $1, $2, $3, $4,
                CURRENT_TIMESTAMP, $5, $6
            )
            RETURNING *;
        `;

        const companyDesignationValues = [
            designationData.CompanyId ?? null,
            designationId,
            designationData.DesignationLevel ?? null,
            designationData.IsDisabled ?? false,
            designationData.CreatedByUserName,
            designationData.CanBeReportingManager ?? false
        ];

        const companyDesignationResult = await client.query(
            companyDesignationQuery,
            companyDesignationValues
        );

        await client.query("COMMIT");

        return {
            DesignationId: designationId,
            CompanyDesignation: companyDesignationResult.rows[0]
        };

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();
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
                CD."CompanyDesignationId",
                CD."CompanyId",
                D."DesignationId",
                D."DesignationName",
                D."DesignationCode"

            FROM "DATA"."CompanyDesignation" CD

            INNER JOIN "LKP"."Designation" D
                ON D."DesignationId" = CD."DesignationId"

            WHERE
                CD."CompanyId" IS NOT DISTINCT FROM $1::SMALLINT

                AND CD."CompanyDesignationId" <> $4

                AND (
                    LOWER(TRIM(D."DesignationName")) =
                        LOWER(TRIM($2))

                    OR

                    D."DesignationCode" = $3::SMALLINT
                );
        `;

        const values = [
            CompanyId,
            DesignationName,
            DesignationCode,
            CompanyDesignationId
        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// EDIT DESIGNATION



export const editDesignation = async (designationData) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==========================================
        // 1. GET DESIGNATION ID
        // ==========================================

        const getDesignationQuery = `
            SELECT "DesignationId"
            FROM "DATA"."CompanyDesignation"
            WHERE "CompanyDesignationId" = $1;
        `;

        const getDesignationResult = await client.query(
            getDesignationQuery,
            [designationData.CompanyDesignationId]
        );

        if (getDesignationResult.rowCount === 0) {
            throw new Error("Company designation not found");
        }

        const designationId = getDesignationResult.rows[0].DesignationId;

        // ==========================================
        // 2. UPDATE LKP.DESIGNATION
        // ==========================================

        const designationQuery = `
            UPDATE "LKP"."Designation"
            SET
                "DesignationName" = $1,
                "DesignationCode" = $2,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $3
            WHERE "DesignationId" = $4;
        `;

        const designationValues = [
            designationData.DesignationName,
            designationData.DesignationCode,
            designationData.UpdateByUserName,
            designationId
        ];

        await client.query(designationQuery, designationValues);

        // ==========================================
        // 3. UPDATE DATA.COMPANYDESIGNATION
        // ==========================================

        const companyDesignationQuery = `
            UPDATE "DATA"."CompanyDesignation"
            SET
                "CompanyId" = $1,
                "DesignationLevel" = $2,
                "IsDisabled" = $3,
                "UpdateByUserName" = $4,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "CanBeReportingManager" = $5
            WHERE "CompanyDesignationId" = $6;
        `;

        const companyDesignationValues = [
            designationData.CompanyId ?? null,
            designationData.DesignationLevel ?? null,
            designationData.IsDisabled ?? false,
            designationData.UpdateByUserName,
            designationData.CanBeReportingManager ?? false,
            designationData.CompanyDesignationId
        ];

        const result = await client.query(
            companyDesignationQuery,
            companyDesignationValues
        );

        await client.query("COMMIT");

        return result.rowCount;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();
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
