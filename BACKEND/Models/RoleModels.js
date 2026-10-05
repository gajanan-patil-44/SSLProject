import { pool } from "../Config/db.js";


// ==========================================
// GET ALL ROLES
// ==========================================

export const getAllRoles = async () => {

    const query = `
        SELECT
            R."RoleId",
            R."CompanyId",
            C."CompanyName",
            R."RoleName",
            R."RoleCode",
            R."RoleDescription",
            R."IsDisabled",
            R."CreatedByUserName",
            R."CreatedAt",
            R."UpdatedAt",
            R."UpdatedByUserName"

        FROM "LKP"."Role" R

        LEFT JOIN "LKP"."Company" C
            ON R."CompanyId" = C."CompanyId"

        ORDER BY R."RoleId";
    `;

    const result = await pool.query(query);

    return result.rows;
};
// ==========================================
// CHECK ROLE NAME / ROLE CODE
// ADD ROLE
// ==========================================

export const checkRoleExists = async (
    RoleName,
    RoleCode
) => {

    const query = `
        SELECT
            "RoleId",
            "RoleName",
            "RoleCode"
        FROM "LKP"."Role"
        WHERE
            "RoleName" = $1
            OR "RoleCode" = $2
    `;

    const values = [
        RoleName,
        RoleCode
    ];

    const result = await pool.query(query, values);

    return result.rows;
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

    const query = `
        INSERT INTO "LKP"."Role"
        (
            "CompanyId",
            "RoleName",
            "RoleCode",
            "RoleDescription",
            "CreatedByUserName",
            "CreatedAt"
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            CURRENT_TIMESTAMP
        )
        RETURNING *;
    `;

    const values = [
        userRole.CompanyId,
        userRole.RoleName,
        userRole.Role_Code,
        userRole.Description,
        userRole.CreatedByUserName
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
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

export const getCompaniesForRole = async () => {

    const query = `
        SELECT
            "CompanyId",
            "CompanyName"
        FROM "LKP"."Company"
        ORDER BY "CompanyName";
    `;

    const result = await pool.query(query);

    return result.rows;
};

// ==========================================
// UPDATE ROLE
// ==========================================




export const updateRoles = async (userRole) => {

    const query = `
        UPDATE "LKP"."Role"
        SET
            "CompanyId" = $1,
            "RoleName" = $2,
            "RoleDescription" = $3,
            "RoleCode" = $4,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $5
        WHERE "RoleId" = $6
    `;

    const values = [
        userRole.CompanyId,
        userRole.RoleName,
        userRole.Description,
        userRole.Role_Code,
        userRole.UpdatedByUserName,
        userRole.RoleId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
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