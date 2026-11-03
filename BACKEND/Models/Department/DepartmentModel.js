import { pool } from "../../Config/db.js";


// GET ALL DEPARTMENTS

export const getAllDepartments = async () => {

    try {

        const query = `
            SELECT
                "DepartmentId",
                "CompanyId",
                "DepartmentName",
                "DepartmentCode",
                "IsDisabled",
                "CreatedAt",
                "UpdatedAt",
                "CreatedByUserName",
                "UpdatedByUserName"

            FROM "LKP"."Department"

            ORDER BY "DepartmentId"
        `;

        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// CHECK COMPANY EXISTS

export const checkDepartmentCompanyExists = async (CompanyId) => {

    try {

        const query = `
            SELECT
                "CompanyId"

            FROM "LKP"."Company"

            WHERE "CompanyId" = $1
        `;

        const values = [CompanyId];

        const result = await pool.query(
            query,
            values
        );

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// CHECK DEPARTMENT CODE FOR ADD

export const checkDepartmentCodeExists = async (DepartmentCode) => {

    try {

        const query = `
            SELECT
                "DepartmentId",
                "DepartmentCode"

            FROM "LKP"."Department"

            WHERE "DepartmentCode" = $1
        `;

        const values = [DepartmentCode];

        const result = await pool.query(
            query,
            values
        );

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ADD DEPARTMENT

export const addDepartmentModel = async (departmentData) => {

    try {

        const query = `
            INSERT INTO "LKP"."Department"
            (
                "CompanyId",
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
                $3,
                false,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                $4
            )

            RETURNING
                "DepartmentId",
                "CompanyId",
                "DepartmentName",
                "DepartmentCode",
                "IsDisabled",
                "CreatedAt",
                "UpdatedAt",
                "CreatedByUserName";
        `;

        const values = [
            departmentData.CompanyId,
            departmentData.DepartmentName,
            departmentData.DepartmentCode,
            departmentData.CreatedByUserName || null
        ];

        const result = await pool.query(
            query,
            values
        );

        return result.rows[0];

    } catch (error) {

        throw error;
    }
};


// CHECK DEPARTMENT CODE FOR UPDATE
// EXCLUDES CURRENT DEPARTMENT

export const checkDepartmentCodeExistsForUpdate = async (
    DepartmentCode,
    DepartmentId
) => {

    try {

        const query = `
            SELECT
                "DepartmentId",
                "DepartmentCode"

            FROM "LKP"."Department"

            WHERE
                "DepartmentCode" = $1
                AND "DepartmentId" <> $2
        `;

        const values = [
            DepartmentCode,
            DepartmentId
        ];

        const result = await pool.query(
            query,
            values
        );

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// UPDATE DEPARTMENT

export const updateDepartmentModel = async (departmentData) => {

    try {

        const query = `
            UPDATE "LKP"."Department"

            SET
                "CompanyId" = $1,
                "DepartmentName" = $2,
                "DepartmentCode" = $3,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $4

            WHERE "DepartmentId" = $5
        `;

        const values = [
            departmentData.CompanyId,
            departmentData.DepartmentName,
            departmentData.DepartmentCode,
            departmentData.UpdatedByUserName || null,
            departmentData.DepartmentId
        ];

        const result = await pool.query(
            query,
            values
        );

        return result.rowCount;

    } catch (error) {

        throw error;
    }
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
                "CompanyId",
                "DepartmentName",
                "DepartmentCode",
                "IsDisabled",
                "UpdatedAt",
                "UpdatedByUserName";
        `;

        const values = [
            departmentData.IsDisabled,
            departmentData.UpdatedByUserName || null,
            departmentData.DepartmentId
        ];

        const result = await pool.query(
            query,
            values
        );

        return result.rows[0];

    } catch (error) {

        throw error;
    }
};