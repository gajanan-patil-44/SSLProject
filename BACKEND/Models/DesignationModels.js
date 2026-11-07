import { pool } from "../Config/db.js";


// GET ALL DESIGNATIONS


export const getAllDesignations = async () => {

    try {

        const query = `
            SELECT
                "DesignationId",
                "DesignationName",
                "DesignationCode",
                "DesignationDescription",
                "CreatedAt",
                "UpdatedAt",
                "IsDisabled"
            FROM "LKP"."Designation"
            ORDER BY "DesignationId" ASC;
                    `;

        const result = await pool.query(query);

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









// ADD DESIGNATION



export const addDesignation = async (designationData) => {

    try {
        const result = await pool.query(`
        INSERT INTO "LKP"."Designation"
            (
                "DesignationName",
                "DesignationCode",
                "DesignationDescription",
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
                "DesignationId",
                "DesignationName",
                "DesignationCode",
                "DesignationDescription",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName";
                
            
            `,[
            designationData.DesignationName,
            designationData.DesignationCode,
            designationData.DesignationDescription,
            designationData.IsDisabled,
            designationData.CreatedByUserName])
        return result.rows
    } catch (error) {
        throw error
    }

}


// CHECK DESIGNATION FOR UPDATE


export const checkDesignationExistsForUpdate = async (
    DesignationName,
    DesignationCode,
    DesignationId
) => {

    try {

        const query = `
            SELECT
                "DesignationId",
                "DesignationName",
                "DesignationCode"

            FROM "LKP"."Designation"

            WHERE
                "DesignationId" <> $3

                AND (
                    LOWER(TRIM("DesignationName")) =
                        LOWER(TRIM($1))

                    OR

                    LOWER(TRIM("DesignationCode")) =
                        LOWER(TRIM($2))
                );
        `;


        const values = [
            DesignationName,
            DesignationCode,
            DesignationId
        ];


        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        throw error;
    }
};
// EDIT DESIGNATION


export const editDesignation = async (designationData) => {

    try {

        const query = `
            UPDATE "LKP"."Designation"

            SET
                "DesignationName" = $1,
                "DesignationCode" = $2,
                "DesignationDescription" = $3,
                "IsDisabled" = $4,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $5

            WHERE
                "DesignationId" = $6

            RETURNING
                "DesignationId",
                "DesignationName",
                "DesignationCode",
                "DesignationDescription",
                "IsDisabled",
                "UpdatedAt",
                "UpdatedByUserName";
        `;


        const values = [

            designationData.DesignationName,
            designationData.DesignationCode,
            designationData.DesignationDescription,
            designationData.IsDisabled,
            designationData.UpdatedByUserName,
            designationData.DesignationId

        ];


        const result = await pool.query(query, values);

        return result.rows[0] || null;

    } catch (error) {

        throw error;
    }
};




// TOGGLE DESIGNATION STATUS

export const toggleDesignationStatuses = async (designationData) => {

    try {

        const query = `
            UPDATE "LKP"."Designation"

            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2

            WHERE "DesignationId" = $3

            RETURNING
                "DesignationId",
                "DesignationName",
                "DesignationCode",
                "IsDisabled",
                "UpdatedAt",
                "UpdatedByUserName";
        `;


        const values = [
            designationData.IsDisabled,
            designationData.UpdatedByUserName,
            designationData.DesignationId
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


export const fetchcompany = async()=>{
    try {
        const result = await pool.query(`
            
            SELECT "CompanyId","CompanyName" FROM "LKP"."Company" WHERE "IsDisabled" = FALSE 

            
            `)
        return result.rows
    } catch (error) {
        throw error
    }
}

export const fetchDeisgnationDpwn = async()=>{
    try {
        const result = await pool.query(`
            
        SELECT "DesignationId","DesignationName" FROM "LKP"."Designation" WHERE "IsDisabled" = FALSE 

            
            `)
        return result.rows
    } catch (error) {
        throw error
    }
}


export const InsertCompanyDesignations = async (designationData) => {

    try {

        const query = `
            INSERT INTO "DATA"."CompanyDesignation"
            (
                "CompanyId",
                "DesignationId",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "DesignationLevel",
                "CanBeReportingManager"
            )

            VALUES
            (
                $1,
                $2,
                false,
                CURRENT_TIMESTAMP,
                $3,
                $4,
                $5
            )

            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationId",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "DesignationLevel",
                "CanBeReportingManager";
        `;

        const values = [

            designationData.CompanyId,
            designationData.DesignationId,
            designationData.CreatedByUserName,
            designationData.DesignationLevel,
            designationData.CanBeReportingManager

        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        throw error;
    }
};

export const checkCompanyExists = async (CompanyId) => {

    try {

        const query = `
            SELECT
                "CompanyId"
            FROM "LKP"."Company"
            WHERE
                "CompanyId" = $1
                AND COALESCE("IsDisabled", false) = false;
        `;

        const result = await pool.query(query, [CompanyId]);

        return result.rows[0] || null;

    } catch (error) {

        throw error;
    }
};



export const checkDesignationExists = async (DesignationId) => {

    try {

        const query = `
            SELECT
                "DesignationId",
                "DesignationName",
                "DesignationCode"
            FROM "LKP"."Designation"
            WHERE
                "DesignationId" = $1
                AND COALESCE("IsDisabled", false) = false;
        `;

        const result = await pool.query(query, [DesignationId]);

        return result.rows[0] || null;

    } catch (error) {

        throw error;
    }
};


export const checkCompanyDesignationExists = async (
    CompanyId,
    DesignationId
) => {

    try {

        const query = `
            SELECT
                "CompanyDesignationId",
                "CompanyId",
                "DesignationId"
            FROM "DATA"."CompanyDesignation"
            WHERE
                "CompanyId" = $1
                AND "DesignationId" = $2;
        `;

        const values = [
            CompanyId,
            DesignationId
        ];

        const result = await pool.query(query, values);

        return result.rows[0] || null;

    } catch (error) {

        throw error;
    }
};

export const fecthCompanyDesignatioView = async (CompanyId = null) => {

    try {

        const query = `
            SELECT

                CD."CompanyDesignationId",
                CD."CompanyId",
                C."CompanyName",
                C."CompanyCode",

                CD."DesignationId",
                D."DesignationName",
                D."DesignationCode",
                D."DesignationDescription",

                CD."DesignationLevel",
                CD."CanBeReportingManager",

                CD."IsDisabled",

                CD."CreatedAt",
                CD."CreatedByUserName",

                CD."UpdatedAt",
                CD."UpdateByUserName"


            FROM "DATA"."CompanyDesignation" CD


            LEFT JOIN "LKP"."Company" C
                ON C."CompanyId" = CD."CompanyId"


            INNER JOIN "LKP"."Designation" D
                ON D."DesignationId" = CD."DesignationId"


            WHERE
                (
                    $1::SMALLINT IS NULL
                    OR CD."CompanyId" = $1::SMALLINT
                )


            ORDER BY
                CD."CompanyDesignationId" DESC;
        `;


        const values = [CompanyId];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        throw error;
    }
};





// GET EXISTING COMPANY DESIGNATION
export const getCompanyDesignationById = async (CompanyDesignationId) => {
    try {
        const query = `
            SELECT *
            FROM "DATA"."CompanyDesignation"
            WHERE "CompanyDesignationId" = $1;
        `;

        const result = await pool.query(query, [CompanyDesignationId]);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};


// CHECK DUPLICATE COMPANY DESIGNATION DURING EDIT
export const checkCompanyDesignationExistsForUpdate = async (
    CompanyId,
    DesignationId,
    CompanyDesignationId
) => {
    try {
        const query = `
            SELECT "CompanyDesignationId"
            FROM "DATA"."CompanyDesignation"
            WHERE "CompanyDesignationId" <> $3
              AND "CompanyId" IS NOT DISTINCT FROM $1::SMALLINT
              AND "DesignationId" = $2;
        `;

        const result = await pool.query(query, [
            CompanyId,
            DesignationId,
            CompanyDesignationId
        ]);

        return result.rows.length > 0;

    } catch (error) {
        throw error;
    }
};


// UPDATE COMPANY DESIGNATION
export const updateCompanyDesignation = async (
    CompanyDesignationId,
    updateData
) => {
    try {

        const columnMapping = {
            CompanyId: '"CompanyId"',
            DesignationId: '"DesignationId"',
            DesignationLevel: '"DesignationLevel"',
            CanBeReportingManager: '"CanBeReportingManager"',
            IsDisabled: '"IsDisabled"',
            UpdateByUserName: '"UpdateByUserName"'
        };

        const fields = Object.keys(updateData).filter(
            field => columnMapping[field]
        );

        if (fields.length === 0) {
            return null;
        }

        const values = [];
        const setClauses = [];

        fields.forEach((field, index) => {
            values.push(updateData[field]);

            setClauses.push(
                `${columnMapping[field]} = $${index + 1}`
            );
        });

        // Automatically update UpdatedAt
        setClauses.push('"UpdatedAt" = CURRENT_TIMESTAMP');

        values.push(CompanyDesignationId);

        const query = `
            UPDATE "DATA"."CompanyDesignation"
            SET ${setClauses.join(", ")}
            WHERE "CompanyDesignationId" = $${values.length}
            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationId",
                "DesignationLevel",
                "CanBeReportingManager",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName",
                "UpdatedAt",
                "UpdateByUserName";
        `;

        const result = await pool.query(query, values);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};




export const toggleCompanyDesignationStatus = async (
    CompanyDesignationId,
    IsDisabled,
    UpdateByUserName
) => {
    try {

        const query = `
            UPDATE "DATA"."CompanyDesignation"
            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdateByUserName" = $2
            WHERE "CompanyDesignationId" = $3
            RETURNING
                "CompanyDesignationId",
                "CompanyId",
                "DesignationId",
                "DesignationLevel",
                "CanBeReportingManager",
                "IsDisabled",
                "UpdatedAt",
                "UpdateByUserName";
        `;

        const result = await pool.query(query, [
            IsDisabled,
            UpdateByUserName,
            CompanyDesignationId
        ]);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};