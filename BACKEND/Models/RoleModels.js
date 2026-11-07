
import { pool } from "../Config/db.js";

// ==========================================
// GET ALL ROLES
// ==========================================

export const getAllRoles = async () => {

    const query = `
        SELECT
            "RoleId",
            "RoleName",
            "RoleCode",
            "RoleDescription",
            "IsDisabled",
            "CreatedByUserName",
            "CreatedAt",
            "UpdatedAt",
            "UpdatedByUserName"
        FROM "LKP"."Role"
        ORDER BY "RoleId" DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};

// ==========================================
// CHECK ROLE NAME / ROLE CODE
// ADD ROLE
// ==========================================

export const checkRoleExists = async (RoleName, RoleCode) => {
    const query = `
        SELECT
            "RoleId",
            "RoleName",
            "RoleCode",
            "RoleDescription"
        FROM "LKP"."Role"
        WHERE
            LOWER(TRIM("RoleName")) = LOWER(TRIM($1))
            OR
            LOWER(TRIM("RoleCode")) = LOWER(TRIM($2));
    `;

    const result = await pool.query(query, [RoleName, RoleCode]);
    return result.rows;
};


// ==========================================
// ADD ROLE
// INSERT INTO BOTH TABLES
// ==========================================

export const addRole = async (roleData) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Insert into LKP.Role
        const roleResult = await client.query(
            `
            INSERT INTO "LKP"."Role"
            (
                "RoleName",
                "RoleCode",
                "RoleDescription",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName"
            )
            VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP, $4)
            RETURNING *;
            `,
            [
                roleData.RoleName,
                roleData.Role_Code,
                roleData.RoleDescription ?? null,
                roleData.CreatedByUserName
            ]
        );

        const roleId = roleResult.rows[0].RoleId;

        let companyRole = null;

        // 2. Insert into DATA.CompanyRole only if CompanyId is provided
        if (
            roleData.CompanyId !== null &&
            roleData.CompanyId !== undefined &&
            roleData.CompanyId !== ""
        ) {
            const companyRoleResult = await client.query(
                `
                INSERT INTO "DATA"."CompanyRole"
                (
                    "RoleId",
                    "CompanyId",
                    "IsDisabled",
                    "CreatedAt",
                    "CreatedByUserName"
                )
                VALUES ($1, $2, false, CURRENT_TIMESTAMP, $3)
                RETURNING *;
                `,
                [
                    roleId,
                    roleData.CompanyId,
                    roleData.CreatedByUserName
                ]
            );

            companyRole = companyRoleResult.rows[0];
        }

        await client.query("COMMIT");

        return {
            Role: roleResult.rows[0],
            CompanyRole: companyRole
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


// ==========================================
// GET ROLE COUNT
// ==========================================

export const getRoleCount = async () => {
    const query = `
        SELECT COUNT(*)::int AS "totalRoles"
        FROM "LKP"."Role";
    `;

    const result = await pool.query(query);
    return result.rows[0].totalRoles;
};


// ==========================================
// CHECK ROLE EXISTS FOR UPDATE
// ==========================================

export const checkRoleExistsForUpdate = async (
    RoleName,
    RoleCode,
    RoleId
) => {
    const query = `
        SELECT
            "RoleId",
            "RoleName",
            "RoleCode",
            "RoleDescription"
        FROM "LKP"."Role"
        WHERE
            (
                LOWER(TRIM("RoleName")) = LOWER(TRIM($1))
                OR
                LOWER(TRIM("RoleCode")) = LOWER(TRIM($2))
            )
            AND "RoleId" <> $3;
    `;

    const result = await pool.query(query, [
        RoleName,
        RoleCode,
        RoleId
    ]);

    return result.rows;
};


// ==========================================
// UPDATE ROLE
// ==========================================

export const updateRoles = async (userRole) => {
    const query = `
        UPDATE "LKP"."Role"
        SET
            "RoleName" = $1,
            "RoleCode" = $2,
            "RoleDescription" = $3,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $4
        WHERE "RoleId" = $5;
    `;

    const result = await pool.query(query, [
        userRole.RoleName,
        userRole.Role_Code,
        userRole.RoleDescription ?? null,
        userRole.UpdatedByUserName,
        userRole.RoleId
    ]);

    return result.rowCount;
};


// ==========================================
// UPDATE ROLE STATUS
// UPDATE BOTH TABLES
// ==========================================
export const updateRoleStatus = async (RoleId, IsDisabled) => {
    try {

        const query = `
            UPDATE "LKP"."Role"
            SET "IsDisabled" = $1
            WHERE "RoleId" = $2
            RETURNING "RoleId", "IsDisabled";
        `;

        const result = await pool.query(query, [
            IsDisabled,
            RoleId
        ]);

        return result.rowCount > 0 ? result.rows[0] : 0;

    } catch (error) {
        console.error("Update Role Status Model Error:", error);
        throw error;
    }
};