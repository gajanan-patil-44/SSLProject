import { pool } from "../Config/db.js";

export const getAllRoles = async () => {
    const result = await pool.query(`
        SELECT 
            "RoleId" AS "RoleId",
            "RoleName" AS "RoleName",
            "RoleCode" AS "Role_Code",
            "RoleDescription" AS "Description",
            "CreatedByUserName" AS "RequestUserName",
            "CreatedAt" AS "CreatedOn"

        FROM "LKP"."Role"
    `);

    return result.rows;
};


export const addRole = async (userRole) => {

    const query = `
        INSERT INTO "LKP"."Role"
        (
            "RoleName",
            "RoleCode",
            "RoleDescription",
            "IsDisabled",
            "CreatedByUserName",
            "CreatedAt",
            "UpdatedAt"
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING *;
    `;

    const values = [
        userRole.RoleName,
        userRole.Role_Code,
        userRole.Description,
        false,
        userRole.RequestUserName
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


export const updateRoles = async (userRole) => {

    const query = `
        UPDATE "LKP"."Role"
        SET 
            "RoleName" = $1,
            "RoleDescription" = $2,
            "CreatedByUserName" = $3,
            "RoleCode" = $4,
            "IsDisabled" = $5,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "RoleId" = $6
    `;

    const values = [
        userRole.RoleName,
        userRole.Description,
        userRole.RequestUserName,
        userRole.Role_Code,
        userRole.IsDisabled,
        userRole.RoleId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};


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