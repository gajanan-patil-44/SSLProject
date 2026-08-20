import { pool } from "../Config/db.js";

export const getAllRoles = async () => {
    const result = await pool.query(`
        SELECT 
            "RoleId",
            "RoleName",
            "RoleCode",
            "RoleDescription",
            "CreatedByUserName",
            "CreatedAt" ,
            "UpdatedAt" ,
            "UpdatedByUserName"

        FROM "LKP"."Role"
        where "IsDisabled" = false
    `);

    return result.rows;
};

export const checkRoleExists = async (RoleName, RoleCode) => {

    const query = `
        SELECT "RoleId","RoleName","RoleCode"
        FROM "LKP"."Role"
        WHERE "RoleName" = $1 OR "RoleCode" = $2
    `;

    const values = [
        RoleName,
        RoleCode
    ];

    const result = await pool.query(query, values);

    return result.rows;
};

export const addRole = async (userRole) => {

    const query = `
        INSERT INTO "LKP"."Role"
        (
            "RoleName","RoleCode", "RoleDescription","CreatedByUserName","CreatedAt","UpdatedAt"
        )
        VALUES
        (
            $1,$2,$3,$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
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
export const checkRoleExistsForUpdate = async (
    RoleName,
    RoleCode,
    RoleId
) => {

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
        WHERE "RoleId" = $6

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