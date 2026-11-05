
import { pool } from "../../Config/db.js";

// ======================================================
// FLAG ID 1 - GET GST TYPE DROPDOWN
// ======================================================
export const getGSTTypeDropdown = async () => {
    const query = `
        SELECT
            "GSTTypeId",
            "GSTTypeName",
            "GSTTypeFullName"
        FROM "LKP"."GSTType"
        WHERE "IsDisabled" = false
        ORDER BY "GSTTypeName";
    `;

    const result = await pool.query(query);
    return result.rows;
};

// ======================================================
// CHECK GST TYPE EXISTS
// ======================================================
export const checkGSTTypeExists = async (GSTTypeId) => {
    const query = `
        SELECT 1
        FROM "LKP"."GSTType"
        WHERE "GSTTypeId" = $1
          AND "IsDisabled" = false;
    `;

    const result = await pool.query(query, [GSTTypeId]);
    return result.rowCount > 0;
};

// ======================================================
// CHECK COMPANY EXISTS
// ======================================================
export const checkCompanyExists = async (CompanyId) => {
    const query = `
        SELECT 1
        FROM "LKP"."Company"
        WHERE "CompanyId" = $1;
    `;

    const result = await pool.query(query, [CompanyId]);
    return result.rowCount > 0;
};

// ======================================================
// CHECK DUPLICATE GST RATE
// CompanyId NULL = check only global records
// ======================================================
export const checkGSTRateExists = async (
    CompanyId,
    GSTTypeId,
    GSTPercentage
) => {
    let query;
    let values;

    if (CompanyId === null) {
        query = `
            SELECT 1
            FROM "LKP"."GSTRate"
            WHERE "CompanyId" IS NULL
              AND "GSTTypeId" = $1
              AND "GSTPercentage" = $2;
        `;

        values = [GSTTypeId, GSTPercentage];
    } else {
        query = `
            SELECT 1
            FROM "LKP"."GSTRate"
            WHERE "CompanyId" = $1
              AND "GSTTypeId" = $2
              AND "GSTPercentage" = $3;
        `;

        values = [CompanyId, GSTTypeId, GSTPercentage];
    }

    const result = await pool.query(query, values);
    return result.rowCount > 0;
};

// ======================================================
// FLAG ID 2 - ADD GST RATE
// ======================================================
export const addGSTRate = async (data) => {
    const {
        CompanyId,
        GSTTypeId,
        GSTPercentage,
        CreatedByUserName
    } = data;

    const query = `
        INSERT INTO "LKP"."GSTRate"
        (
            "CompanyId",
            "GSTTypeId",
            "GSTPercentage",
            "CreatedByUserName",
            "CreatedAt",
            "IsDisabled"
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, false)
        RETURNING *;
    `;

    const values = [
        CompanyId,
        GSTTypeId,
        GSTPercentage,
        CreatedByUserName
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// ======================================================
// FLAG ID 3 - VIEW GST RATES
// CompanyId NULL = view all companies
// ======================================================
export const getAllGSTRates = async (CompanyId) => {
    const query = `
        SELECT
            GR."GSTRateId",
            GR."CompanyId",
            GR."GSTTypeId",
            GT."GSTTypeName",
            GT."GSTTypeFullName",
            GR."GSTPercentage",
            GR."IsDisabled",
            GR."CreatedByUserName",
            GR."CreatedAt",
            GR."UpdatedByUserName",
            GR."UpdatedAt"
        FROM "LKP"."GSTRate" GR
        INNER JOIN "LKP"."GSTType" GT
            ON GT."GSTTypeId" = GR."GSTTypeId"
        WHERE (
            $1::smallint IS NULL
            OR GR."CompanyId" = $1
        )
        ORDER BY GR."GSTRateId" DESC;
    `;

    const result = await pool.query(query, [CompanyId]);
    return result.rows;
};

// ======================================================
// FLAG ID 4 - ENABLE / DISABLE GST RATE
// CompanyId NULL = update across all companies
// ======================================================
export const updateGSTRateStatus = async (
    GSTRateId,
    CompanyId,
    IsDisabled,
    UpdatedByUserName
) => {
    const query = `
        UPDATE "LKP"."GSTRate"
        SET
            "IsDisabled" = $1,
            "UpdatedByUserName" = $2,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "GSTRateId" = $3
          AND (
              $4::smallint IS NULL
              OR "CompanyId" = $4
          )
        RETURNING *;
    `;

    const values = [
        IsDisabled,
        UpdatedByUserName,
        GSTRateId,
        CompanyId
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};
