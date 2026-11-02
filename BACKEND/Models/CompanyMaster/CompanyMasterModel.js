import { pool } from "../../Config/db.js";


// GET ALL COMPANY MASTER RECORDS


export const getAllCompanyMasters = async () => {

    try {

        const query = `

            SELECT

                "CompanyMasterId" AS "CompanyMasterId",
                "CompanyName" AS "CompanyName",
                "CompanyCode" AS "CompanyCode",
                "ContactNumber" AS "ContactNumber",
                "EmailId" AS "EmailId",
                "GSTNo" AS "GSTNo",
                "PanNo" AS "PanNo",
                "Address" AS "Address",
                "CreatedAt" AS "CreatedAt",
                "UpdatedAt" AS "UpdatedAt",
                "CreatedByUserName" AS "CreatedByUserName",
                "UpdatedByUserName" AS "UpdatedByUserName",
                "IsDisabled" AS "IsDisabled"

            FROM "LKP"."CompanyMaster"
            ORDER BY "CompanyName";

        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE COMPANY NAME AND COMPANY CODE


export const checkCompanyMasterExists = async (
    CompanyName,
    CompanyCode
) => {

    try {

        const query = `

            SELECT
                "CompanyMasterId",
                "CompanyName",
                "CompanyCode"

            FROM "LKP"."CompanyMaster"
            WHERE

                LOWER("CompanyName") = LOWER($1)
                OR UPPER("CompanyCode") = UPPER($2);

        `;


        const values = [
            CompanyName,
            CompanyCode

        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE CONTACT NUMBER


export const checkCompanyMasterContactExists = async (ContactNumber) => {

    try {

        const query = `

            SELECT
                "CompanyMasterId"

            FROM "LKP"."CompanyMaster"
            WHERE "ContactNumber" = $1;

        `;

        const result = await pool.query(query, [ContactNumber]);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE EMAIL


export const checkCompanyMasterEmailExists = async (EmailId) => {

    try {

        const query = `

            SELECT
                "CompanyMasterId"

            FROM "LKP"."CompanyMaster"
            WHERE LOWER("EmailId") = LOWER($1);

        `;

        const result = await pool.query(query, [EmailId]);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// ADD COMPANY MASTER


export const addCompanyMaster = async (companyData) => {

    try {

        const query = `

            INSERT INTO "LKP"."CompanyMaster"
            (
                "CompanyName",
                "CompanyCode",
                "ContactNumber",
                "EmailId",
                "GSTNo",
                "PanNo",
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
                CURRENT_TIMESTAMP,
                $8,
                false
            )

            RETURNING *;

        `;


        const values = [
            companyData.CompanyName.trim(),
            companyData.CompanyCode.trim(),
            companyData.ContactNumber?.trim() || null,
            companyData.EmailId?.trim() || null,
            companyData.GSTNo?.trim().toUpperCase() || null,
            companyData.PanNo?.trim().toUpperCase() || null,
            companyData.Address?.trim() || null,
            companyData.CreatedByUserName || null

        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE COMPANY NAME AND CODE DURING UPDATE


export const checkCompanyMasterExistsForUpdate = async (
    CompanyName,
    CompanyCode,
    CompanyMasterId
) => {

    try {

        const query = `

            SELECT
                "CompanyMasterId",
                "CompanyName",
                "CompanyCode"

            FROM "LKP"."CompanyMaster"

            WHERE

                (
                    LOWER("CompanyName") = LOWER($1)
                    OR UPPER("CompanyCode") = UPPER($2)
                )
                AND "CompanyMasterId" != $3;

        `;


        const values = [
            CompanyName,
            CompanyCode,
            CompanyMasterId

        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE CONTACT NUMBER DURING UPDATE


export const checkCompanyMasterContactExistsForUpdate = async (
    ContactNumber,
    CompanyMasterId
) => {

    try {

        const query = `

            SELECT
                "CompanyMasterId"
            FROM "LKP"."CompanyMaster"

            WHERE
                "ContactNumber" = $1
                AND "CompanyMasterId" != $2;

        `;


        const result = await pool.query(query, [
            ContactNumber,
            CompanyMasterId
        ]);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// CHECK DUPLICATE EMAIL DURING UPDATE


export const checkCompanyMasterEmailExistsForUpdate = async (

    EmailId,

    CompanyMasterId

) => {

    try {

        const query = `

            SELECT
                "CompanyMasterId"

            FROM "LKP"."CompanyMaster"

            WHERE
                LOWER("EmailId") = LOWER($1)
                AND "CompanyMasterId" != $2;

        `;


        const result = await pool.query(query, [
            EmailId,
            CompanyMasterId
        ]);

        return result.rows;

    } catch (error) {

        throw error;

    }

};


// UPDATE COMPANY MASTER


export const updateCompanyMasters = async (companyData) => {

    try {

        const query = `

            UPDATE "LKP"."CompanyMaster"

            SET
                "CompanyName" = $1,
                "CompanyCode" = $2,
                "ContactNumber" = $3,
                "EmailId" = $4,
                "GSTNo" = $5,
                "PanNo" = $6,
                "Address" = $7,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $8

            WHERE "CompanyMasterId" = $9

            RETURNING *;

        `;


        const values = [
            companyData.CompanyName.trim(),
            companyData.CompanyCode.trim(),
            companyData.ContactNumber?.trim() || null,
            companyData.EmailId?.trim() || null,
            companyData.GSTNo?.trim().toUpperCase() || null,
            companyData.PanNo?.trim().toUpperCase() || null,
            companyData.Address?.trim() || null,
            companyData.UpdatedByUserName || null,
            companyData.CompanyMasterId

        ];


        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        throw error;

    }

};


// TOGGLE COMPANY MASTER STATUS


export const toggleCompanyMasterStatuses = async (companyData) => {

    try {

        const query = `

            UPDATE "LKP"."CompanyMaster"

            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2

            WHERE "CompanyMasterId" = $3

            RETURNING *;

        `;


        const values = [
            companyData.IsDisabled,
            companyData.UpdatedByUserName || null,
            companyData.CompanyMasterId

        ];


        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        throw error;

    }

};


// DELETE COMPANY MASTER


export const deleteCompanyMasters = async (companyData) => {

    try {

        const query = `
            DELETE FROM "LKP"."CompanyMaster"
            WHERE "CompanyMasterId" = $1
            RETURNING *;

        `;

        const values = [companyData.CompanyMasterId];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        throw error;

    }

};