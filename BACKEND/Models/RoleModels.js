
import { pool } from "../Config/db.js";

// ==========================================
// GET ALL ROLES
// ==========================================

export const getAllRoles = async () => {
    const query = `
        SELECT
            R."RoleId",
            R."RoleName",
            R."RoleCode",
            R."RoleDescription",
            R."IsDisabled" AS "RoleIsDisabled",
            R."CreatedByUserName",
            R."CreatedAt",
            R."UpdatedAt",
            R."UpdatedByUserName",

            CR."CompanyRoleId",
            CR."IsDisabled" AS "CompanyRoleIsDisabled",
            CR."CreatedByUserName" AS "CompanyRoleCreatedByUserName",
            CR."CreatedAt" AS "CompanyRoleCreatedAt",
            CR."UpdatedAt" AS "CompanyRoleUpdatedAt",
            CR."UpdatedByUserName" AS "CompanyRoleUpdatedByUserName"

        FROM "LKP"."Role" R
        LEFT JOIN "DATA"."CompanyRole" CR
            ON CR."RoleId" = R."RoleId"
        ORDER BY R."RoleId" DESC, CR."CompanyRoleId" DESC;
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
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Update LKP.Role
        const roleResult = await client.query(
            `
            UPDATE "LKP"."Role"
            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP
            WHERE "RoleId" = $2;
            `,
            [IsDisabled, RoleId]
        );

        if (roleResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return 0;
        }

        // 2. Update DATA.CompanyRole
        await client.query(
            `
            UPDATE "DATA"."CompanyRole"
            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP
            WHERE "RoleId" = $2;
            `,
            [IsDisabled, RoleId]
        );

        await client.query("COMMIT");

        return roleResult.rowCount;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
