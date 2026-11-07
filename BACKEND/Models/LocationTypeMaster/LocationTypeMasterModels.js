
import { pool } from "../../Config/db.js";
// ==========================================
// FLAG ID 1 - GET ALL LOCATION TYPES
// ==========================================

export const getAllLocationTypes = async () => {
    const query = `
        SELECT
            L."LocationTypeMasterId",
            L."LocationTypeMasterName",
            L."ParentTypeId",
            P."LocationTypeMasterName" AS "ParentLocationTypeName",
            L."CreatedAt",
            L."UpdatedAt",
            L."CreatedByUserName",
            L."UpdatedByUserName"
        FROM "LKP"."LocationTypeMaster" L
        LEFT JOIN "LKP"."LocationTypeMaster" P
            ON L."ParentTypeId" = P."LocationTypeMasterId"
        ORDER BY L."LocationTypeMasterId";
    `;

    const result = await pool.query(query);
    return result.rows;
};

// ==========================================
// CHECK WHETHER ANY LOCATION TYPE EXISTS
// ==========================================

export const getLocationTypeCount = async () => {
    const query = `
        SELECT COUNT(*)::int AS "totalCount"
        FROM "LKP"."LocationTypeMaster";
    `;

    const result = await pool.query(query);
    return result.rows[0].totalCount;
};

// ==========================================
// GET LOCATION TYPE BY ID
// ==========================================

export const getLocationTypeById = async (LocationTypeMasterId) => {
    const query = `
        SELECT
            "LocationTypeMasterId",
            "LocationTypeMasterName",
            "ParentTypeId"
        FROM "LKP"."LocationTypeMaster"
        WHERE "LocationTypeMasterId" = $1;
    `;

    const result = await pool.query(query, [LocationTypeMasterId]);
    return result.rows[0] || null;
};

// ==========================================
// CHECK DUPLICATE LOCATION TYPE NAME
// ==========================================

export const checkLocationTypeExists = async (
    LocationTypeMasterName,
    LocationTypeMasterId = null
) => {
    const query = `
        SELECT "LocationTypeMasterId",
               "LocationTypeMasterName"
        FROM "LKP"."LocationTypeMaster"
        WHERE LOWER("LocationTypeMasterName") = LOWER($1)
        AND (
            $2::integer IS NULL
            OR "LocationTypeMasterId" <> $2
        );
    `;

    const result = await pool.query(query, [
        LocationTypeMasterName,
        LocationTypeMasterId
    ]);

    return result.rows;
};

// ==========================================
// CHECK PARENT LOCATION EXISTS
// ==========================================

export const checkParentLocationExists = async (ParentTypeId) => {
    const query = `
        SELECT "LocationTypeMasterId",
               "LocationTypeMasterName"
        FROM "LKP"."LocationTypeMaster"
        WHERE "LocationTypeMasterId" = $1;
    `;

    const result = await pool.query(query, [ParentTypeId]);
    return result.rows[0] || null;
};

// ==========================================
// FLAG ID 2 - ADD LOCATION TYPE
// ==========================================

export const addLocationType = async (data) => {
    const query = `
        INSERT INTO "LKP"."LocationTypeMaster"
        (
            "LocationTypeMasterName",
            "ParentTypeId",
            "CreatedByUserName",
            "CreatedAt"
        )
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *;
    `;

    const values = [
        data.LocationTypeMasterName,
        data.ParentTypeId,
        data.CreatedByUserName
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// ==========================================
// FLAG ID 3 - PARENT LOCATION DROPDOWN
// ==========================================

export const getParentLocationDropdown = async () => {
    const query = `
        SELECT
            "LocationTypeMasterId",
            "LocationTypeMasterName"
        FROM "LKP"."LocationTypeMaster"
        ORDER BY "LocationTypeMasterId" DESC
        LIMIT 1;
    `;

    const result = await pool.query(query);
    return result.rows;
};

// ==========================================
// FLAG ID 4 - EDIT LOCATION TYPE
// ==========================================

export const updateLocationType = async (data) => {
    const query = `
        UPDATE "LKP"."LocationTypeMaster"
        SET
            "LocationTypeMasterName" = $1,
            "ParentTypeId" = $2,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $3
        WHERE "LocationTypeMasterId" = $4
        RETURNING *;
    `;

    const values = [
        data.LocationTypeMasterName,
        data.ParentTypeId,
        data.UpdatedByUserName,
        data.LocationTypeMasterId
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};
