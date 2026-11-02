
import { pool } from "../../Config/db.js";


// 1. GET LOCATION TYPE DROPDOWN

export const getLocationTypesForDropdown = async () => {

    try {

        const query = `

            SELECT
                "LocationTypeMasterId",
                "LocationTypeMasterName",
                "ParentTypeId"

            FROM "LKP"."LocationTypeMaster"
            WHERE "IsDisabled" = false
            ORDER BY "LocationTypeMasterId";

        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// 2. GET PARENT LOCATION TYPE DROPDOWN

export const getParentLocationTypeForDropdown = async (LocationTypeMasterId) => {

    try {

        const query = `

            SELECT

                CHILD."LocationTypeMasterId",
                CHILD."LocationTypeMasterName",
                CHILD."ParentTypeId",

                PARENT."LocationTypeMasterId" AS "ParentLocationTypeId",
                PARENT."LocationTypeMasterName" AS "ParentLocationTypeName"

            FROM "LKP"."LocationTypeMaster" CHILD

            LEFT JOIN "LKP"."LocationTypeMaster" PARENT

                ON CHILD."ParentTypeId" = PARENT."LocationTypeMasterId"
                AND PARENT."IsDisabled" = false

            WHERE
                CHILD."LocationTypeMasterId" = $1
                AND CHILD."IsDisabled" = false;

        `;

        const result = await pool.query(query, [LocationTypeMasterId]);

        return result.rows[0] || null;

    } catch (error) {

        throw error;

    }

};


// 3. GET PARENT LOCATION NAME DROPDOWN

export const getParentLocationsForDropdown = async (
    ParentLocationTypeId,
    CompanyMasterId
) => {

    try {

        const query = `

            SELECT

                "LocationId",
                "LocationName",
                "LocationTypeMasterId",
                "ParentLocationMasterId"

            FROM "LKP"."LocationMaster"

            WHERE

                "LocationTypeMasterId" = $1
                AND "CompanyMasterId" = $2
                AND "IsDisabled" = false

            ORDER BY "LocationName";

        `;

        const result = await pool.query(query, [

            ParentLocationTypeId,
            CompanyMasterId

        ]);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// CHECK COMPANY MASTER EXISTS

export const checkCompanyMasterExists = async (CompanyMasterId) => {

    try {

        const query = `

            SELECT
                "CompanyMasterId"

            FROM "LKP"."CompanyMaster"

            WHERE "CompanyMasterId" = $1;

        `;

        const result = await pool.query(query, [CompanyMasterId]);

        return result.rows[0] || null;

    } catch (error) {

        throw error;

    }

};


// CHECK LOCATION TYPE EXISTS

export const checkLocationTypeExists = async (LocationTypeMasterId) => {

    try {

        const query = `

            SELECT

                "LocationTypeMasterId",
                "LocationTypeMasterName",
                "ParentTypeId"

            FROM "LKP"."LocationTypeMaster"

            WHERE

                "LocationTypeMasterId" = $1
                AND "IsDisabled" = false;

        `;

        const result = await pool.query(query, [
            LocationTypeMasterId
        ]);

        return result.rows[0] || null;

    } catch (error) {

        throw error;

    }

};


// CHECK VALID PARENT LOCATION

export const checkValidParentLocation = async (
    ParentLocationMasterId,
    ParentTypeId,
    CompanyMasterId
) => {

    try {

        const query = `

            SELECT

                "LocationId",
                "LocationTypeMasterId",
                "CompanyMasterId"

            FROM "LKP"."LocationMaster"

            WHERE

                "LocationId" = $1
                AND "LocationTypeMasterId" = $2
                AND "CompanyMasterId" = $3
                AND "IsDisabled" = false;

        `;

        const result = await pool.query(query, [

            ParentLocationMasterId,
            ParentTypeId,
            CompanyMasterId

        ]);

        return result.rows[0] || null;

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE CONTACT NUMBER

export const checkLocationContactExists = async (ContactNumber) => {

    try {

        const query = `

            SELECT
                "LocationId"

            FROM "LKP"."LocationMaster"
            WHERE "ContactNumber" = $1;

        `;

        const result = await pool.query(query, [
            ContactNumber
        ]);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE EMAIL

export const checkLocationEmailExists = async (EmailId) => {

    try {

        const query = `

            SELECT
                "LocationId"

            FROM "LKP"."LocationMaster"

            WHERE LOWER("EmailId") = LOWER($1);

        `;

        const result = await pool.query(query, [
            EmailId
        ]);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// INSERT LOCATION MASTER

export const addLocationMasters = async (locationData) => {

    try {

        const query = `

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
                "CreatedAt",
                "CreatedByUserName",
                "IsDisabled"

            )

            VALUES

            (

                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                CURRENT_TIMESTAMP,
                $9,
                false

            )

            RETURNING *;

        `;

        const values = [

            locationData.CompanyMasterId,
            locationData.LocationTypeMasterId,
            locationData.ParentLocationMasterId,
            locationData.LocationName.trim(),
            locationData.ContactPerson.trim(),
            locationData.ContactNumber.trim(),
            locationData.EmailId.trim(),
            locationData.Address.trim(),
            locationData.CreatedByUserName || null

        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        throw error;

    }

};
