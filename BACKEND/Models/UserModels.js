import { pool } from "../Config/db.js";


// ==========================================================
// USER DROPDOWNS
// ==========================================================


// ==========================================================
// FLAG ID 1 - GET GENDER
// ==========================================================

export const getGenderDropdown = async () => {

    const query = `
        SELECT
            "GenderId",
            "GenderName"
        FROM "LKP"."Gender"
        WHERE "IsDisabled" = false
        ORDER BY "GenderName";
    `;

    const result = await pool.query(query);

    return result.rows;
};


// ==========================================================
// FLAG ID 2 - GET MARITAL STATUS
// ==========================================================

export const getMaritalStatusDropdown = async () => {

    const query = `
        SELECT
            "MaritalStatusId",
            "MaritalStatusName"
        FROM "LKP"."MaritalStatus"
        WHERE "IsDisabled" = false
        ORDER BY "MaritalStatusName";
    `;

    const result = await pool.query(query);

    return result.rows;
};


// ==========================================================
// FLAG ID 3 - GET DESIGNATION
// ==========================================================

export const getDesignationDropdown = async () => {

    const query = `
        SELECT
            "CompanyDesignationId",
            "DesignationName"
        FROM "LKP"."CompanyDesignation"
        WHERE "IsDisabled" = false
        ORDER BY "DesignationName";
    `;

    const result = await pool.query(query);

    return result.rows;
};



// ==========================================================
// VALIDATE GENDER
// ==========================================================

export const checkGenderExists = async (GenderId) => {

    const query = `
        SELECT
            "GenderId",
            "GenderName"
        FROM "LKP"."Gender"
        WHERE "GenderId" = $1
        AND "IsDisabled" = false;
    `;

    const result = await pool.query(
        query,
        [GenderId]
    );

    return result.rows;
};



// ==========================================================
// VALIDATE MARITAL STATUS
// ==========================================================

export const checkMaritalStatusExists = async (MaritalStatusId) => {

    const query = `
        SELECT
            "MaritalStatusId",
            "MaritalStatusName"
        FROM "LKP"."MaritalStatus"
        WHERE "MaritalStatusId" = $1
        AND "IsDisabled" = false;
    `;

    const result = await pool.query(
        query,
        [MaritalStatusId]
    );

    return result.rows;
};



// ==========================================================
// VALIDATE DESIGNATION
// ==========================================================

export const checkDesignationExists = async (DesignationId) => {

    const query = `
        SELECT
            "CompanyDesignationId",
            "DesignationName"
        FROM "LKP"."CompanyDesignation"
        WHERE "CompanyDesignationId" = $1
        AND "IsDisabled" = false;
    `;

    const result = await pool.query(
        query,
        [DesignationId]
    );

    return result.rows;
};



// ==========================================================
// CHECK LOGIN NAME
// ==========================================================

export const checkLoginNameExists = async (LoginName) => {

    const query = `
        SELECT
            "UserId",
            "LoginName"
        FROM "DATA"."User"
        WHERE "LoginName" = $1;
    `;

    const result = await pool.query(
        query,
        [LoginName]
    );

    return result.rows;
};



// ==========================================================
// CHECK EMAIL
// ==========================================================

export const checkEmailExists = async (Email) => {

    const query = `
        SELECT
            "UserId",
            "Email"
        FROM "DATA"."User"
        WHERE "Email" = $1;
    `;

    const result = await pool.query(
        query,
        [Email]
    );

    return result.rows;
};



// ==========================================================
// CHECK PHONE NUMBER
// ==========================================================

export const checkPhoneNumberExists = async (PhoneNumber) => {

    const query = `
        SELECT
            "UserId",
            "PhoneNumber"
        FROM "DATA"."User"
        WHERE "PhoneNumber" = $1;
    `;

    const result = await pool.query(
        query,
        [PhoneNumber]
    );

    return result.rows;
};



// ==========================================================
// CHECK EMPLOYEE ID
// ==========================================================

export const checkEmployeeIdExists = async (EmployeeId) => {

    const query = `
        SELECT
            "UserId",
            "EmployeeId"
        FROM "DATA"."User"
        WHERE "EmployeeId" = $1;
    `;

    const result = await pool.query(
        query,
        [EmployeeId]
    );

    return result.rows;
};


// ==========================================================
// CREATE USER
// ==========================================================

export const createUser = async (userData) => {

    const query = `
        INSERT INTO "DATA"."User"
        (
            "EmployeeId",
            "FirstName",
            "MiddleName",
            "LastName",
            "PhoneNumber",
            "AltPhoneNumber",
            "DateOfBirth",
            "GenderId",
            "MaritalStatusId",
            "DesignationId",
            "Email",
            "Password",
            "LoginName",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            CURRENT_TIMESTAMP,
            $14
        )
        RETURNING
            "UserId",
            "EmployeeId",
            "FirstName",
            "MiddleName",
            "LastName",
            "PhoneNumber",
            "AltPhoneNumber",
            "DateOfBirth",
            "GenderId",
            "MaritalStatusId",
            "DesignationId",
            "Email",
            "LoginName",
            "CreatedAt",
            "CreatedByUserName";
    `;

    const values = [
        userData.EmployeeId,
        userData.FirstName,
        userData.MiddleName || null,
        userData.LastName || null,
        userData.PhoneNumber,
        userData.AltPhoneNumber || null,
        userData.DateOfBirth,
        userData.GenderId,
        userData.MaritalStatusId,
        userData.DesignationId,
        userData.Email,
        userData.Password,
        userData.LoginName,
        userData.CreatedByUserName
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};
