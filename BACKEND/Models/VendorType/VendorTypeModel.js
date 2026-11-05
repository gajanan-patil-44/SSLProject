import { pool } from "../../Config/db.js";


// FLAG ID 1 - VIEW ALL VENDOR TYPES
// (CompanyId is optional - if sent, filters by company)

export const getAllVendorTypes = async (CompanyId) => {
    const query = `
        SELECT
            "VendorTypeId",
            "VendorTypeName",
            "VendorCode",
            "CompanyId",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName"
        FROM "LKP"."VendorType"
        WHERE ($1::smallint IS NULL OR "CompanyId" = $1)
        ORDER BY "VendorTypeId" ASC
    `;
    const result = await pool.query(query, [CompanyId ?? null]);
    return result.rows;
};


// CHECK DUPLICATE (ADD) - same company, same name OR code

export const checkVendorTypeExists = async (VendorTypeName, VendorCode, CompanyId) => {
    const query = `
        SELECT "VendorTypeId", "VendorTypeName", "VendorCode"
        FROM "LKP"."VendorType"
        WHERE "CompanyId" = $3
          AND (
                LOWER("VendorTypeName") = LOWER($1)
             OR LOWER("VendorCode")     = LOWER($2)
          )
    `;
    const result = await pool.query(query, [VendorTypeName, VendorCode, CompanyId]);
    return result.rows;
};


// CHECK DUPLICATE (EDIT) - ignores the row being edited

export const checkVendorTypeExistsForUpdate = async (
    VendorTypeName, VendorCode, CompanyId, VendorTypeId
) => {
    const query = `
        SELECT "VendorTypeId", "VendorTypeName", "VendorCode"
        FROM "LKP"."VendorType"
        WHERE "CompanyId" = $3
          AND "VendorTypeId" <> $4
          AND (
                LOWER("VendorTypeName") = LOWER($1)
             OR LOWER("VendorCode")     = LOWER($2)
          )
    `;
    const result = await pool.query(query, [VendorTypeName, VendorCode, CompanyId, VendorTypeId]);
    return result.rows;
};


// FLAG ID 2 - ADD VENDOR TYPE
// VendorTypeId = auto, CreatedAt = NOW(), IsDisabled = false

export const addVendorType = async (data) => {
    const query = `
        INSERT INTO "LKP"."VendorType"
        (
            "VendorTypeName",
            "VendorCode",
            "CompanyId",
            "IsDisabled",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES ($1, $2, $3, false, NOW(), $4)
        RETURNING
            "VendorTypeId",
            "VendorTypeName",
            "VendorCode",
            "CompanyId",
            "IsDisabled",
            "CreatedAt",
            "CreatedByUserName"
    `;
    const result = await pool.query(query, [
        data.VendorTypeName,
        data.VendorCode,
        data.CompanyId,
        data.CreatedByUserName
    ]);
    return result.rows[0];
};


// FLAG ID 3 - EDIT VENDOR TYPE

export const updateVendorType = async (data) => {
    const query = `
        UPDATE "LKP"."VendorType"
        SET
            "VendorTypeName"    = $1,
            "VendorCode"        = $2,
            "UpdatedAt"         = NOW(),
            "UpdatedByUserName" = $3
        WHERE "VendorTypeId" = $4
        RETURNING
            "VendorTypeId",
            "VendorTypeName",
            "VendorCode",
            "CompanyId",
            "IsDisabled",
            "UpdatedAt",
            "UpdatedByUserName"
    `;
    const result = await pool.query(query, [
        data.VendorTypeName,
        data.VendorCode,
        data.UpdatedByUserName,
        data.VendorTypeId
    ]);
    return result.rows[0];
};


// FLAG ID 4 - TOGGLE STATUS

export const updateVendorTypeStatus = async (VendorTypeId, IsDisabled, UpdatedByUserName) => {
    const query = `
        UPDATE "LKP"."VendorType"
        SET
            "IsDisabled"        = $1,
            "UpdatedAt"         = NOW(),
            "UpdatedByUserName" = $2
        WHERE "VendorTypeId" = $3
        RETURNING
            "VendorTypeId",
            "IsDisabled",
            "UpdatedAt",
            "UpdatedByUserName"
    `;
    const result = await pool.query(query, [IsDisabled, UpdatedByUserName, VendorTypeId]);
    return result.rows[0];
};

// Used by controller to verify company exists before insert
export const checkCompanyExists = async (CompanyId) => {
    const result = await pool.query(
        `SELECT "CompanyId" FROM "LKP"."Company" WHERE "CompanyId" = $1`,
        [CompanyId]
    );
    return result.rows;
};
