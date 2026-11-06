import { pool } from "../../Config/db.js";

// 1. Get Location Type dropdown

export const getLocationTypes = async () => {
    try {

        const result = await pool.query(`
            SELECT
                "LocationTypeMasterId",
                "LocationTypeMasterName",
                "ParentTypeId"

            FROM "LKP"."LocationTypeMaster"

            WHERE "IsDisabled" = false
            ORDER BY "LocationTypeMasterId";
        `);

        return result.rows;

    } catch (error) {

        throw error;

    }
};


// 2. Get Parent Location Type based on selected Location Type
export const getParentLocationTypes = async (LocationTypeMasterId) => {
    try {
        const result = await pool.query(
            `
            SELECT
                Parent."LocationTypeMasterId",
                Parent."LocationTypeMasterName"
            FROM "LKP"."LocationTypeMaster" Selected

            INNER JOIN "LKP"."LocationTypeMaster" Parent
                ON Parent."LocationTypeMasterId" = Selected."ParentTypeId"

            WHERE Selected."LocationTypeMasterId" = $1
              AND Selected."IsDisabled" = false
              AND Parent."IsDisabled" = false;
            `,
            [LocationTypeMasterId]
        );

        return result.rows;

    } catch (error) {

        throw error;

    }
};


// 3. Get Parent Location Master based on selected Location Type and Parent Location Type

export const getParentLocationMasters = async (ParentLocationTypeMasterId) => {
    try {
        const result = await pool.query(
            `
            SELECT
                "LocationId",
                "LocationName",
                "LocationTypeMasterId"
            FROM "LKP"."LocationMaster"

            WHERE "LocationTypeMasterId" = $1
              AND "IsDisabled" = false

            ORDER BY "LocationName";
            `,
            [ParentLocationTypeMasterId]
        );

        return result.rows;

    } catch (error) {

        throw error;

    }
};



// 4. Check whether Company Master exists
export const checkCompanyMasterExists = async (CompanyMasterId) => {
    try {

        const result = await pool.query(
            `
            SELECT "CompanyMasterId"

            FROM "LKP"."CompanyMaster"

            WHERE "CompanyMasterId" = $1

              AND "IsDisabled" = false;
            `,
            [CompanyMasterId]
        );

        return result.rows.length > 0;

    } catch (error) {

        throw error;

    }
};


// 5. Check whether Location Type exists
export const checkLocationTypeExists = async (LocationTypeMasterId) => {
    try {
        const result = await pool.query(
            `
            SELECT
                "LocationTypeMasterId",
                "ParentTypeId"

            FROM "LKP"."LocationTypeMaster"

            WHERE "LocationTypeMasterId" = $1

              AND "IsDisabled" = false;
            `,
            [LocationTypeMasterId]
        );

        return result.rows[0] || null;

    } catch (error) {

        throw error;

    }
};


// 6. Check whether Parent Location exists and belongs to the same company
export const checkParentLocationExists = async (
    LocationTypeMasterId,
    ParentLocationTypeMasterId,
    ParentLocationMasterId,
    CompanyMasterId
) => {
    try {

        const result = await pool.query(
            `
            SELECT LM."LocationId"

            FROM "LKP"."LocationMaster" LM

            INNER JOIN "LKP"."LocationTypeMaster" LT
                ON LT."LocationTypeMasterId" = $1

            WHERE LM."LocationId" = $2
              AND LM."LocationTypeMasterId" = $3
              AND LM."CompanyMasterId" = $4
              AND LM."IsDisabled" = false
              AND LT."IsDisabled" = false
              AND LT."ParentTypeId" = LM."LocationTypeMasterId";
            `,
            [
                LocationTypeMasterId,
                ParentLocationMasterId,
                ParentLocationTypeMasterId,
                CompanyMasterId
            ]
        );

        return result.rows.length > 0;

    } catch (error) {

        throw error;

    }
};


// 7. Add Location Details and Contact Channels
export const addLocation = async (locationData) => {

    try {

        const {
            CompanyMasterId,
            LocationTypeMasterId,
            ParentLocationMasterId,
            LocationName,
            ContactPerson,
            ContactNumber,
            EmailId,
            Address,
            CreatedByUserName
        } = locationData;

        const result = await pool.query(
            `
            INSERT INTO "LKP"."LocationMaster"
            (
                "CompanyMasterId",
                "LocationTypeMasterId",
                "ParentLocationMasterId",
                "LocationName",
                "ContactPerson",
                "ContactNumber",
                "EmailId",
                "Address",
                "CreatedByUserName",
                "CreatedAt",
                "IsDisabled"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, false)
            RETURNING *;
            `,
            [
                CompanyMasterId,
                LocationTypeMasterId,
                ParentLocationMasterId,
                LocationName,
                ContactPerson || null,
                ContactNumber || null,
                EmailId || null,
                Address || null,
                CreatedByUserName
            ]
        );

        return result.rows[0];

    } catch (error) {

        throw error;

    }
};


// Check whether EmailId already exists for this company
export const checkLocationEmailExists = async (
    EmailId,
    CompanyMasterId
) => {

    try {

        const result = await pool.query(
            `
            SELECT "LocationId"
            FROM "LKP"."LocationMaster"
            WHERE LOWER(TRIM("EmailId")) = LOWER(TRIM($1))
              AND "CompanyMasterId" = $2;
            `,
            [EmailId, CompanyMasterId]
        );

        return result.rows.length > 0;

    } catch (error) {
        throw error;
    }
};


// Check whether ContactNumber already exists for this company
export const checkLocationContactExists = async (
    ContactNumber,
    CompanyMasterId
) => {

    try {
        
        const result = await pool.query(
            `
            SELECT "LocationId"
            FROM "LKP"."LocationMaster"
            WHERE TRIM("ContactNumber") = TRIM($1)
              AND "CompanyMasterId" = $2;
            `,
            [ContactNumber, CompanyMasterId]
        );

        return result.rows.length > 0;

    } catch (error) {

        throw error;

    }
};