import { pool } from "../Config/db.js";


// ==========================================
// GET ALL ACTIVE COMPANIES
// ==========================================

export const getAllCompanies = async () => {

    const result = await pool.query(`
        SELECT
            "CompanyId" AS "CompanyId",
            "CompanyName" AS "CompanyName",
            "CompanyCode" AS "CompanyCode",
            "createdByUserName" AS "RequestUserName",
            "CreatedAt" AS "CreatedOn",
            "UpdatedAt" AS "UpdatedOn",
            "updatedByUserName" AS "UpdatedByUserName",
            "isDisabled" AS "IsDisabled"

        FROM "LKP"."Company"

        WHERE "isDisabled" = false

        ORDER BY "CompanyId"
    `);

    return result.rows;
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
            "createdByUserName",
            "updatedByUserName",
            "isDisabled"
        )
        VALUES
        (
            $1,
            $2,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            $3,
            $3,
            false
        )
        RETURNING *;
    `;

    const values = [
        companyData.CompanyName,
        companyData.CompanyCode,
        companyData.RequestUserName
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
            "updatedByUserName" = $3,
            "isDisabled" = $4

        WHERE "CompanyId" = $5
    `;

    const values = [
        companyData.CompanyName,
        companyData.CompanyCode,
        companyData.UpdatedByUserName,
        companyData.IsDisabled,
        companyData.CompanyId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};


// ==========================================
// DELETE / DISABLE COMPANY
// ==========================================

export const deleteCompanies = async (companyData) => {

    const query = `
        UPDATE "LKP"."Company"
        SET
            "isDisabled" = true,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "updatedByUserName" = $1

        WHERE "CompanyId" = $2
    `;

    const values = [
        companyData.UpdatedByUserName,
        companyData.CompanyId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};