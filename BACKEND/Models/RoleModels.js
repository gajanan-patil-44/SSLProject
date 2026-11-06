import { pool } from "../Config/db.js";


// ==========================================
// GET ALL ROLES
// ==========================================


export const getAllRoles = async (CompanyId) => {

    const query = `
        SELECT
            R."RoleId",
            CR."CompanyId",
            C."CompanyName",
            R."RoleName",
            R."RoleCode",
            R."IsDisabled",
            R."CreatedByUserName",
            R."CreatedAt",
            R."UpdatedAt",
            R."UpdatedByUserName"
        FROM "LKP"."Role" R

        LEFT JOIN "DATA"."CompanyRole" CR
            ON R."RoleId" = CR."RoleId"

        LEFT JOIN "LKP"."Company" C
            ON CR."CompanyId" = C."CompanyId"

        ${CompanyId !== null
            ? `WHERE CR."CompanyId" = $1`
            : `WHERE CR."CompanyId" IS NULL OR CR."CompanyId" IS NOT NULL`
        }

        ORDER BY R."RoleId" DESC;
    `;

    const values = CompanyId !== null ? [CompanyId] : [];

    const result = await pool.query(query, values);

    return result.rows;
};

// ==========================================
// CHECK ROLE NAME / ROLE CODE
// ADD ROLE
// ==========================================


export const checkRoleExists = async (
    RoleName,
    RoleCode,
    CompanyId
) => {

    try {

        const query = `
            SELECT
                R."RoleId",
                R."RoleName",
                R."RoleCode",
                CR."CompanyId"

            FROM "LKP"."Role" R

            LEFT JOIN "DATA"."CompanyRole" CR
                ON R."RoleId" = CR."RoleId"

            WHERE
                LOWER(TRIM(R."RoleName")) = LOWER(TRIM($1))
                OR
                LOWER(TRIM(R."RoleCode")) = LOWER(TRIM($2));
        `;

        const values = [
            RoleName,
            RoleCode
        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        throw error;
    }
};

// ==========================================
// CHECK COMPANY EXISTS
// ==========================================
export const checkCompanyExists = async (CompanyId) => {

    const query = `
        SELECT
            "CompanyId",
            "CompanyName"
        FROM "LKP"."Company"
        WHERE "CompanyId" = $1
        AND "IsDisabled" = false
    `;

    const values = [
        CompanyId
    ];

    const result = await pool.query(query, values);

    return result.rows;
};
// ==========================================
// ADD ROLE
// ==========================================

export const addRole = async (userRole) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==========================================
        // 1. INSERT INTO LKP.ROLE
        // ==========================================

        const roleQuery = `
            INSERT INTO "LKP"."Role"
            (
                "RoleName",
                "RoleCode",
                "CreatedByUserName",
                "CreatedAt"
            )
            VALUES
            (
                $1,
                $2,
                $3,
                CURRENT_TIMESTAMP
            )
            RETURNING "RoleId", "RoleName", "RoleCode";
        `;

        const roleValues = [
            userRole.RoleName,
            userRole.Role_Code,
            userRole.CreatedByUserName
        ];

        const roleResult = await client.query(roleQuery, roleValues);

        const roleId = roleResult.rows[0].RoleId;

        // ==========================================
        // 2. INSERT INTO DATA.COMPANYROLE
        // ==========================================

        const companyRoleQuery = `
            INSERT INTO "DATA"."CompanyRole"
            (
                "RoleId",
                "CompanyId",
                "CreatedByUserName",
                "CreatedAt"
            )
            VALUES
            (
                $1,
                $2,
                $3,
                CURRENT_TIMESTAMP
            )
            RETURNING *;
        `;

        const companyRoleValues = [
            roleId,
            userRole.CompanyId,
            userRole.CreatedByUserName
        ];

        const companyRoleResult = await client.query(
            companyRoleQuery,
            companyRoleValues
        );

        await client.query("COMMIT");

        return {
            ...roleResult.rows[0],
            CompanyRole: companyRoleResult.rows[0]
        };

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }
};


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

export const checkRoleExistsForUpdate = async (RoleName, RoleCode,RoleId) => {
    const query = `
        SELECT
            "RoleId",
            "RoleName",
            "RoleCode"
        FROM "LKP"."Role"
        WHERE
            (
                "RoleName" = $1
                OR "RoleCode" = $2
            )
            AND "RoleId" <> $3
    `;

    const values = [
        RoleName,
        RoleCode,
        RoleId
    ];

    const result = await pool.query(query, values);

    return result.rows;
};



// ==========================================
// GET ALL COMPANIES
// ==========================================

export const getCompaniesForRole = async (CompanyId) => {

const query = `
        SELECT
            "CompanyId",
            "CompanyName"
        FROM "LKP"."Company"
    `;

    const values = [];

    if (CompanyId !== null && CompanyId !== undefined) {
        query += ` WHERE "CompanyId" = $1::SMALLINT`;
        values.push(Number(CompanyId));
    }

    query += ` ORDER BY "CompanyName"`;

    const result = await pool.query(query, values);

    return result.rows;
};
// ==========================================
// UPDATE ROLE
// ==========================================

export const updateRoles = async (userRole, loggedInCompanyId) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==========================================
        // 1. UPDATE LKP.ROLE
        // ==========================================

        let roleQuery = `
            UPDATE "LKP"."Role"
            SET
                "RoleName" = $1,
                "RoleCode" = $2,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $3
            WHERE "RoleId" = $4
        `;

        const roleValues = [
            userRole.RoleName,
            userRole.Role_Code,
            userRole.UpdatedByUserName,
            userRole.RoleId
        ];

        // ==========================================
        // 2. UPDATE DATA.COMPANYROLE
        // ==========================================

        let companyRoleQuery = `
            UPDATE "DATA"."CompanyRole"
            SET
                "CompanyId" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2
            WHERE "RoleId" = $3
        `;

        const companyRoleValues = [
            userRole.CompanyId ?? null,
            userRole.UpdatedByUserName,
            userRole.RoleId
        ];

        // Company users can update only their own company's roles
        if (loggedInCompanyId !== null) {

            companyRoleQuery += ` AND "CompanyId" = $4`;

            companyRoleValues.push(loggedInCompanyId);

            roleQuery += `
                AND EXISTS (
                    SELECT 1
                    FROM "DATA"."CompanyRole" cr
                    WHERE cr."RoleId" = "LKP"."Role"."RoleId"
                    AND cr."CompanyId" = $5
                )
            `;

            roleValues.push(loggedInCompanyId);
        }

        const roleResult = await client.query(roleQuery, roleValues);

        if (roleResult.rowCount === 0) {
            throw new Error("Role not found or you are not authorized to update this role");
        }

        const companyRoleResult = await client.query(
            companyRoleQuery,
            companyRoleValues
        );

        if (companyRoleResult.rowCount === 0) {
            throw new Error("Company role not found or you are not authorized to update this role");
        }

        await client.query("COMMIT");

        return roleResult.rowCount;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }
};


// ==========================================
// DELETE ROLE
// ==========================================

export const deleteRoles = async (userRole) => {

    const query = `
        DELETE FROM "LKP"."Role"
        WHERE "RoleId" = $1
    `;

    const values = [
        userRole.RoleId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};


// ==========================================
// UPDATE ROLE STATUS
// ==========================================

export const updateRoleStatus = async (
    RoleId,
    IsDisabled
) => {

    const query = `
        UPDATE "LKP"."Role"
        SET
            "IsDisabled" = $1,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "RoleId" = $2
    `;

    const values = [
        IsDisabled,
        RoleId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};


export const getCompanyDropdownData = async () => {

    const query = `
        SELECT
            "CompanyId",
            "CompanyName"
        FROM "LKP"."Company"
        WHERE "IsDisabled" = false
        ORDER BY "CompanyName" ASC;
    `;

    const result = await pool.query(query);

    return result.rows;
};