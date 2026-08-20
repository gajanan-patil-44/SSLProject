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
        where "IsDisabled" = false
    `);

    return result.rows;
};


export const addRoleName = async (RoleName) => {

    const query = `
        SELECT "RoleId"
        FROM "LKP"."Role"
        WHERE "RoleName" = $1
    `;

    const result = await pool.query(query, [RoleName]);

    return result.rows;
};



export const addRoleCode = async (RoleCode) => {

    const query = `
        SELECT "RoleId"
        FROM "LKP"."Role"
        WHERE "RoleCode" = $1
    `;

    const result = await pool.query(query, [RoleCode]);

    return result.rows;
};


export const addRole = async (userRole) => {

    const query = `
        INSERT INTO "LKP"."Role"
        (
            "RoleName",
            "RoleCode",
            "RoleDescription",
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
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING *;
    `;

    const values = [
        userRole.RoleName,
        userRole.Role_Code,
        userRole.Description,
        userRole.RequestUserName
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};
export const checkRoleName = async (RoleName, RoleId) => {

    const query = `
        SELECT "RoleId"
        FROM "LKP"."Role"
        WHERE "RoleName" = $1
        AND "RoleId" <> $2
    `;

    const values = [
        RoleName,
        RoleId
    ];

    const result = await pool.query(query, values);

    return result.rows;
};


export const checkRoleCode = async (RoleCode, RoleId) => {

    const query = `
        SELECT "RoleId"
        FROM "LKP"."Role"
        WHERE "RoleCode" = $1
        AND "RoleId" <> $2
    `;

    const values = [
        RoleCode,
        RoleId
    ];

    const result = await pool.query(query, values);

    return result.rows;
};


export const updateRoles = async (userRole) => {

    const query = `
        UPDATE "LKP"."Role"
        SET 
            "RoleName" = $1,
            "RoleDescription" = $2,
            "CreatedByUserName" = $3,
            "RoleCode" = $4,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $5
        WHERE "RoleId" = $6,
        IsDisabled = false

    `;

    const values = [
        userRole.RoleName,
        userRole.Description,
        userRole.RequestUserName,
        userRole.Role_Code,
        userRole.UpdatedByUserName,
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




export const updateRoleStatus = async (RoleId, IsDisabled) => {

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