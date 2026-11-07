import { pool } from "../../Config/db.js";


// GET ALL DEPARTMENTS

export const getAllDepartments = async () => {
    const query = `
        SELECT
            "DepartmentId",
            "DepartmentName",
            "DepartmentCode",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName"
        FROM "LKP"."Department"
        ORDER BY "DepartmentId";
    `;

    const result = await pool.query(query);
    return result.rows;
};
// CHECK DEPARTMENT CODE FOR ADD
export const checkDepartmentCodeExists = async (DepartmentCode) => {

    const query = `
        SELECT
            "DepartmentId",
            "DepartmentCode"
        FROM "LKP"."Department"
        WHERE LOWER("DepartmentCode") = LOWER($1);
    `;

    const result = await pool.query(query, [DepartmentCode]);

    return result.rows;
};
// ADD DEPARTMENT
export const addDepartmentModel = async (departmentData) => {

    const query = `
        INSERT INTO "LKP"."Department"
        (
            "DepartmentName",
            "DepartmentCode",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName"
        )
        VALUES
        (
            $1,
            $2,
            false,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            $3
        )
        RETURNING
            "DepartmentId",
            "DepartmentName",
            "DepartmentCode",
            "IsDisabled",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName";
    `;

    const values = [
        departmentData.DepartmentName,
        departmentData.DepartmentCode,
        departmentData.CreatedByUserName
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// CHECK DEPARTMENT CODE FOR UPDATE
// EXCLUDES CURRENT DEPARTMENT

export const checkDepartmentCodeExistsForUpdate = async (
    DepartmentCode,
    DepartmentId
) => {

    const query = `
        SELECT
            "DepartmentId",
            "DepartmentCode"
        FROM "LKP"."Department"
        WHERE
            LOWER("DepartmentCode") = LOWER($1)
            AND "DepartmentId" <> $2;
    `;

    const values = [
        DepartmentCode,
        DepartmentId
    ];

    const result = await pool.query(query, values);

    return result.rows;
};


// UPDATE DEPARTMENT

export const updateDepartmentModel = async (departmentData) => {

    const query = `
        UPDATE "LKP"."Department"
        SET
            "DepartmentName" = $1,
            "DepartmentCode" = $2,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $3
        WHERE "DepartmentId" = $4;
    `;

    const values = [
        departmentData.DepartmentName,
        departmentData.DepartmentCode,
        departmentData.UpdatedByUserName,
        departmentData.DepartmentId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};

// TOGGLE DEPARTMENT STATUS

export const toggleDepartmentStatusModel = async (departmentData) => {

    try {

        const query = `
            UPDATE "LKP"."Department"
            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2
            WHERE "DepartmentId" = $3
            RETURNING
                "DepartmentId",
                "DepartmentName",
                "DepartmentCode",
                "IsDisabled",
                "UpdatedAt",
                "UpdatedByUserName";
        `;

        const values = [
            departmentData.IsDisabled,
            departmentData.UpdatedByUserName,
            departmentData.DepartmentId
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {
        throw error;
    }
};


export const fetchcompany = async () => {
    try {
        const result = await pool.query(`
            SELECT
                "CompanyId",
                "CompanyName"
            FROM "LKP"."Company"
            WHERE "IsDisabled" = FALSE
            ORDER BY "CompanyName";
        `);

        return result.rows;

    } catch (error) {
        throw error;
    }
};


// FETCH DEPARTMENT DROPDOWN

export const fetchDepartmentDown = async () => {
    try {
        const result = await pool.query(`
            SELECT
                "DepartmentId",
                "DepartmentName",
                "DepartmentCode"
            FROM "LKP"."Department"
            WHERE "IsDisabled" = FALSE
            ORDER BY "DepartmentName";
        `);

        return result.rows;

    } catch (error) {
        throw error;
    }
};

// INSERT COMPANY DEPARTMENT

export const InsertCompanyDepartments = async (departmentData) => {

    try {

        const query = `
            INSERT INTO "DATA"."ComapnyDepartment"
            (
                "CompanyId",
                "DepartmentId",
                "IsDsiabled",
                "CreateAt",
                "UpdatedAt",
                "CreatedByUserName"
            )

            VALUES
            (
                $1,
                $2,
                false,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                $3
            )

            RETURNING
                "ComapnyDepartmentId",
                "CompanyId",
                "DepartmentId",
                "IsDsiabled",
                "CreateAt",
                "UpdatedAt",
                "CreatedByUserName";
        `;

        const values = [
            departmentData.CompanyId,
            departmentData.DepartmentId,
            departmentData.CreatedByUserName
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {
        throw error;
    }
};


// CHECK COMPANY EXISTS

export const checkCompanyExists = async (CompanyId) => {

    try {

        const query = `
            SELECT
                "CompanyId"
            FROM "LKP"."Company"
            WHERE
                "CompanyId" = $1
                AND COALESCE("IsDisabled", false) = false;
        `;

        const result = await pool.query(query, [CompanyId]);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};


// CHECK DEPARTMENT EXISTS

export const checkDepartmentExists = async (DepartmentId) => {

    try {

        const query = `
            SELECT
                "DepartmentId",
                "DepartmentName",
                "DepartmentCode"
            FROM "LKP"."Department"
            WHERE
                "DepartmentId" = $1
                AND COALESCE("IsDisabled", false) = false;
        `;

        const result = await pool.query(query, [DepartmentId]);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};


// CHECK DUPLICATE COMPANY DEPARTMENT

export const checkCompanyDepartmentExists = async (
    CompanyId,
    DepartmentId
) => {

    try {

        const query = `
            SELECT
                "ComapnyDepartmentId",
                "CompanyId",
                "DepartmentId"
            FROM "DATA"."ComapnyDepartment"
            WHERE
                "CompanyId" = $1
                AND "DepartmentId" = $2;
        `;

        const result = await pool.query(query, [
            CompanyId,
            DepartmentId
        ]);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};


// VIEW COMPANY DEPARTMENTS

export const fetchCompanyDepartmentView = async (CompanyId) => {

    try {

        const query = `
            SELECT

                CD."ComapnyDepartmentId",

                CD."CompanyId",
                C."CompanyName",
                C."CompanyCode",

                CD."DepartmentId",
                D."DepartmentName",
                D."DepartmentCode",

                CD."IsDsiabled",

                CD."CreateAt",
                CD."CreatedByUserName",

                CD."UpdatedAt",
                CD."UpdatedByUserName"

            FROM "DATA"."ComapnyDepartment" CD

            LEFT JOIN "LKP"."Company" C
                ON C."CompanyId" = CD."CompanyId"

            LEFT JOIN "LKP"."Department" D
                ON D."DepartmentId" = CD."DepartmentId"

           WHERE
    (
        $1::SMALLINT IS NULL
        OR CD."CompanyId" = $1::SMALLINT
    )

            ORDER BY
                CD."ComapnyDepartmentId" DESC;
        `;

        const result = await pool.query(query, [CompanyId]);

        return result.rows;

    } catch (error) {

        throw error;

    }
};


// GET EXISTING COMPANY DEPARTMENT BY ID

export const getCompanyDepartmentById = async (ComapnyDepartmentId) => {

    try {

        const query = `
            SELECT *
            FROM "DATA"."ComapnyDepartment"
            WHERE "ComapnyDepartmentId" = $1;
        `;

        const result = await pool.query(query, [ComapnyDepartmentId]);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};


// CHECK DUPLICATE COMPANY DEPARTMENT DURING UPDATE

export const checkCompanyDepartmentExistsForUpdate = async (
    CompanyId,
    DepartmentId,
    ComapnyDepartmentId
) => {

    try {

        const query = `
            SELECT
                "ComapnyDepartmentId"
            FROM "DATA"."ComapnyDepartment"
            WHERE
                "ComapnyDepartmentId" <> $3
                AND "CompanyId" = $1
                AND "DepartmentId" = $2;
        `;

        const result = await pool.query(query, [
            CompanyId,
            DepartmentId,
            ComapnyDepartmentId
        ]);

        return result.rows.length > 0;

    } catch (error) {
        throw error;
    }
};


// UPDATE COMPANY DEPARTMENT

export const updateCompanyDepartment = async (
    ComapnyDepartmentId,
    updateData
) => {

    try {

        const columnMapping = {

            CompanyId: '"CompanyId"',
            DepartmentId: '"DepartmentId"',
            UpdatedByUserName: '"UpdatedByUserName"'

        };

        const fields = Object.keys(updateData).filter(
            field => columnMapping[field]
        );

        if (fields.length === 0) {
            return null;
        }

        const values = [];
        const setClauses = [];

        fields.forEach((field, index) => {

            values.push(updateData[field]);

            setClauses.push(
                `${columnMapping[field]} = $${index + 1}`
            );

        });

        setClauses.push('"UpdatedAt" = CURRENT_TIMESTAMP');

        values.push(ComapnyDepartmentId);

        const query = `
            UPDATE "DATA"."ComapnyDepartment"

            SET ${setClauses.join(", ")}

            WHERE "ComapnyDepartmentId" = $${values.length}

            RETURNING
                "ComapnyDepartmentId",
                "CompanyId",
                "DepartmentId",
                "IsDsiabled",
                "CreateAt",
                "UpdatedAt",
                "CreatedByUserName",
                "UpdatedByUserName";
        `;

        const result = await pool.query(query, values);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};


// TOGGLE COMPANY DEPARTMENT STATUS

export const toggleCompanyDepartmentStatus = async (
    ComapnyDepartmentId,
    IsDisabled,
    UpdatedByUserName
) => {

    try {

        const query = `
            UPDATE "DATA"."ComapnyDepartment"

            SET
                "IsDsiabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2

            WHERE "ComapnyDepartmentId" = $3

            RETURNING
                "ComapnyDepartmentId",
                "CompanyId",
                "DepartmentId",
                "IsDsiabled",
                "UpdatedAt",
                "UpdatedByUserName";
        `;

        const result = await pool.query(query, [
            IsDisabled,
            UpdatedByUserName,
            ComapnyDepartmentId
        ]);

        return result.rows[0] || null;

    } catch (error) {
        throw error;
    }
};
