import { pool } from "../Config/db.js";


// ==========================================
// GET ALL ACTIVE COMPANIES
// ==========================================

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
        WHERE "IsDisabled" = false
        ORDER BY "CompanyName"
    `);

        return result.rows;
    } catch (error) {
        throw error
    }

};


// ==========================================
// ADD COMPANY
// ==========================================

export const addCompany = async (companyData) => {

    const query = `
        INSERT INTO "LKP"."Company"
        (
            "CompanyName",
            "CompanyCode",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName",
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
            CURRENT_TIMESTAMP,
            $3,
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
        companyData.RequestUserName,
        companyData.Email,
        companyData.PhoneNumber,
        companyData.Address
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


// ==========================================
// UPDATE COMPANY
// ==========================================

export const updateCompanies = async (companyData) => {

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
};


// ==========================================
// TOGGLE COMPANY STATUS
// ==========================================

export const toggleCompanyStatuses = async (companyData) => {

    const query = `
        UPDATE "LKP"."Company"
        SET
            "IsDisabled" = NOT "IsDisabled",
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $1
        WHERE "CompanyId" = $2
        RETURNING *;
    `;

    const values = [
        companyData.UpdatedByUserName,
        companyData.CompanyId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};




// ==========================================
// DELETE / DISABLE COMPANY
// ==========================================

export const deleteCompanies = async (companyData) => {

    const query = `
        DELETE FROM "LKP"."Company"
        WHERE "CompanyId" = $1
    `;

    const values = [
        companyData.CompanyId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};