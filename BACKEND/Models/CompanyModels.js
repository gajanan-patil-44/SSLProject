import { pool } from "../Config/db.js";


// GET ALL ACTIVE COMPANIES

export const getAllCompanies = async () => {

    try {

        const result = await pool.query(`
            SELECT
                "CompanyId" AS "CompanyId",
                "CompanyName" AS "CompanyName",
                "CompanyCode" AS "CompanyCode",
                "CreatedByUserName" AS "RequestUserName",
                "Email" AS "Email",
                "PhoneNumber" AS "PhoneNumber",
                "Address" AS "Address",
                "CreatedAt" AS "CreatedOn",
                "UpdatedAt" AS "UpdatedOn",
                "UpdatedByUserName" AS "UpdatedByUserName",
                "IsDisabled" AS "IsDisabled"

            FROM "LKP"."Company"
            ORDER BY "CompanyName"
        `);

        return result.rows;

    } catch (error) {

        // console.error("Error fetching companies:", error);

        throw error;
    }
};



export const checkCompanyExists = async (
    CompanyName,
    CompanyCode
) => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName",
                "CompanyCode"
            FROM "LKP"."Company"
            WHERE
                (
                    "CompanyName" = $1
                    OR "CompanyCode" = $2
                )
        `;

        const values = [
            CompanyName,
            CompanyCode
        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        // console.error("Error checking company existence:", error);

        throw error;
    }
};


// ADD COMPANY

export const addCompany = async (companyData) => {

    try {

        const query = `
            INSERT INTO "LKP"."Company"
            (
                "CompanyName",
                "CompanyCode",
                "CreatedAt",
                "CreatedByUserName",
                "IsDisabled",
                "Email",
                "PhoneNumber",
                "Address"
            )
            VALUES
            (
                $1,
                $2,
                CURRENT_TIMESTAMP,
                $3,
                false,
                $4,
                $5,
                $6
            )
            RETURNING *;
        `;

        const values = [
            companyData.CompanyName,
            companyData.CompanyCode,
            companyData.CreatedByUserName,
            companyData.Email,
            companyData.PhoneNumber,
            companyData.Address
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        // console.error("Error adding company:", error);

        throw error;
    }
};


export const checkCompanyExistsForUpdate = async (
    CompanyName,
    CompanyCode
) => {

    try {

        const query = `
            SELECT
                "CompanyId",
                "CompanyName",
                "CompanyCode"
            FROM "LKP"."Company"
            WHERE
                "CompanyName" = $1
                OR "CompanyCode" = $2
        `;

        const values = [
            CompanyName,
            CompanyCode
        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        // console.error("Error checking company for update:", error);

        throw error;
    }
};



export const checkCompanyPhoneExists = async (PhoneNumber) => {

    try {

        const query = `
            SELECT "CompanyId"
            FROM "LKP"."Company"
            WHERE "PhoneNumber" = $1
        `;

        const result = await pool.query(query, [PhoneNumber]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


export const checkCompanyEmailExists = async (Email) => {

    try {

        const query = `
            SELECT "CompanyId"
            FROM "LKP"."Company"
            WHERE LOWER("Email") = LOWER($1)
        `;

        const result = await pool.query(query, [Email]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};



// ==========================================
// UPDATE COMPANY
// ==========================================

export const updateCompanies = async (companyData) => {

    try {

        const query = `
            UPDATE "LKP"."Company"
            SET
                "CompanyName" = $1,
                "CompanyCode" = $2,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $3,
                "Email"=$4,
                "PhoneNumber"=$5,
                "Address"=$6

            WHERE "CompanyId" = $7
        `;

        const values = [
            companyData.CompanyName,
            companyData.CompanyCode,
            companyData.UpdatedByUserName,
            companyData.Email,
            companyData.PhoneNumber,
            companyData.Address,
            companyData.CompanyId
        ];

        const result = await pool.query(query, values);

        return result.rowCount;

    } catch (error) {

        // console.error("Error updating company:", error);

        throw error;
    }
};


// TOGGLE COMPANY STATUS

export const toggleCompanyStatuses = async (companyData) => {

    try {

        const query = `
            UPDATE "LKP"."Company"
            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2
            WHERE "CompanyId" = $3
            RETURNING *;
        `;

        const values = [
            companyData.IsDisabled,
            companyData.UpdatedByUserName,
            companyData.CompanyId
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        // console.error("Error toggling company status:", error);

        throw error;
    }
};



// DELETE / DISABLE COMPANY

export const deleteCompanies = async (companyData) => {

    try {

        const query = `
            DELETE FROM "LKP"."Company"
            WHERE "CompanyId" = $1
        `;

        const values = [
            companyData.CompanyId
        ];

        const result = await pool.query(query, values);

        return result.rowCount;

    } catch (error) {

        // console.error("Error deleting company:", error);

        throw error;
    }
};