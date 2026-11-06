
import { pool } from "../../Config/db.js";

// ======================================================
// VIEW COMPANY ROLES
// ======================================================

export const getAllCompanyRoles = async (CompanyId) => {
    const query = `
        SELECT
            CR."CompanyRoleId",
            CR."RoleId",
            R."RoleName",
            R."RoleCode",
            R."RoleDescription",
            CR."CompanyId",
            C."CompanyName",
            CR."IsDisabled",
            CR."CreatedAt",
            CR."UpdatedAt",
            CR."CreatedByUserName",
            CR."UpdatedByUserName"
        FROM "DATA"."CompanyRole" CR
        INNER JOIN "LKP"."Role" R
            ON R."RoleId" = CR."RoleId"
        LEFT JOIN "LKP"."Company" C
            ON C."CompanyId" = CR."CompanyId"
        WHERE (
            $1::SMALLINT IS NULL
            OR CR."CompanyId" = $1
        )
        ORDER BY CR."CompanyRoleId" DESC;
    `;

    const result = await pool.query(query, [CompanyId]);
    return result.rows;
};


// ======================================================
// CHECK WHETHER ROLE EXISTS AND IS ACTIVE
// ======================================================

export const checkRoleExists = async (RoleId) => {
    const query = `
        SELECT "RoleId"
        FROM "LKP"."Role"
        WHERE "RoleId" = $1
          AND "IsDisabled" = false;
    `;

    const result = await pool.query(query, [RoleId]);
    return result.rows[0] || null;
};


// ======================================================
// CHECK WHETHER COMPANY EXISTS
// ======================================================

export const checkCompanyExists = async (CompanyId) => {
    const query = `
        SELECT "CompanyId"
        FROM "LKP"."Company"
        WHERE "CompanyId" = $1;
    `;

    const result = await pool.query(query, [CompanyId]);
    return result.rows[0] || null;
};


// ======================================================
// CHECK DUPLICATE COMPANY ROLE
// ======================================================

export const checkCompanyRoleExists = async (
    RoleId,
    CompanyId,
    excludeCompanyRoleId = null
) => {
    const query = `
        SELECT "CompanyRoleId"
        FROM "DATA"."CompanyRole"
        WHERE "RoleId" = $1
          AND "CompanyId" = $2
          AND (
              $3::INTEGER IS NULL
              OR "CompanyRoleId" <> $3
          );
    `;

    const result = await pool.query(query, [
        RoleId,
        CompanyId,
        excludeCompanyRoleId
    ]);

    return result.rows;
};


// ======================================================
// ADD COMPANY ROLE
// ======================================================

export const addCompanyRole = async (data) => {
    const query = `
        INSERT INTO "DATA"."CompanyRole" (
            "RoleId",
            "CompanyId",
            "IsDisabled",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES ($1, $2, false, NOW(), $3)
        RETURNING *;
    `;

    const result = await pool.query(query, [
        data.RoleId,
        data.CompanyId,
        data.CreatedByUserName
    ]);

    return result.rows[0];
};


// ======================================================
// GET COMPANY ROLE BY ID WITH COMPANY ACCESS
// ======================================================

export const getCompanyRoleById = async (
    CompanyRoleId,
    CompanyId
) => {
    const query = `
        SELECT *
        FROM "DATA"."CompanyRole"
        WHERE "CompanyRoleId" = $1
          AND (
              $2::SMALLINT IS NULL
              OR "CompanyId" = $2
          );
    `;

    const result = await pool.query(query, [
        CompanyRoleId,
        CompanyId
    ]);

    return result.rows[0] || null;
};


// ======================================================
// EDIT COMPANY ROLE
// ======================================================

export const updateCompanyRole = async (data) => {
    const query = `
        UPDATE "DATA"."CompanyRole"
        SET
            "RoleId" = $1,
            "CompanyId" = $2,
            "UpdatedAt" = NOW(),
            "UpdatedByUserName" = $3
        WHERE "CompanyRoleId" = $4
        RETURNING *;
    `;

    const result = await pool.query(query, [
        data.RoleId,
        data.CompanyId,
        data.UpdatedByUserName,
        data.CompanyRoleId
    ]);

    return result.rows[0] || null;
};


// ======================================================
// ENABLE / DISABLE COMPANY ROLE
// ======================================================

export const updateCompanyRoleStatus = async (
    CompanyRoleId,
    IsDisabled
) => {
    const query = `
        UPDATE "DATA"."CompanyRole"
        SET
            "IsDisabled" = $1,
            "UpdatedAt" = NOW()
        WHERE "CompanyRoleId" = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [
        IsDisabled,
        CompanyRoleId
    ]);

    return result.rows[0] || null;
};



// ======================================================
// COMPANY DROPDOWN
// NULL = ALL COMPANIES
// COMPANY ID = ONLY THAT COMPANY
// ======================================================

export const getCompanyDropdown = async (CompanyId) => {
    const query = `
        SELECT
            "CompanyId",
            "CompanyName"
        FROM "LKP"."Company"
        WHERE (
            $1::SMALLINT IS NULL
            OR "CompanyId" = $1
        )
        ORDER BY "CompanyName" ASC;
    `;

    const result = await pool.query(query, [CompanyId]);

    return result.rows;
};


// ======================================================
// ROLE DROPDOWN
// FETCH ONLY ACTIVE ROLES
// ======================================================

export const getRoleDropdown = async () => {
    const query = `
        SELECT
            "RoleId",
            "RoleName",
            "RoleCode",
            "RoleDescription"
        FROM "LKP"."Role"
        WHERE "IsDisabled" = false
        ORDER BY "RoleName" ASC;
    `;

    const result = await pool.query(query);

    return result.rows;
};
