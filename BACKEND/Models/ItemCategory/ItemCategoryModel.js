import { pool } from "../../Config/db.js";


// GET ALL ITEM CATEGORIES

export const getAllMaterialCategoryTypes = async (CompanyId) => {

    try {

        const query = `
            SELECT
                "MaterialCategoryTypeId",
                "CompanyId",
                "MaterialCategoryTypeName",
                "MaterialCategoryTypeCode",
                "IsDisabled",
                "CreatedAt",
                "UpdatedAt",
                "CreatedByUserName",
                "UpdatedByUserName"
            FROM "LKP"."MaterialCategoryType"
            WHERE
                ($1::SMALLINT IS NULL OR "CompanyId" = $1)
            ORDER BY "MaterialCategoryTypeName";
        `;

        const result = await pool.query(query, [CompanyId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};

// CHECK CATEGORY CODE FOR ADD
export const checkMaterialCategoryTypeCodeExists = async (
    CompanyId,
    MaterialCategoryTypeCode
) => {

    const query = `
        SELECT "MaterialCategoryTypeId"
        FROM "LKP"."MaterialCategoryType"
        WHERE "CompanyId" = $1
          AND LOWER("MaterialCategoryTypeCode") = LOWER($2)
        LIMIT 1;
    `;

    const result = await pool.query(query, [
        CompanyId,
        MaterialCategoryTypeCode
    ]);

    return result.rows;
};

// ADD ITEM CATEGORY

export const addMaterialCategoryTypeModel = async (categoryData) => {

    try {

        const query = `
            INSERT INTO "LKP"."MaterialCategoryType"
            (
                "CompanyId",
                "MaterialCategoryTypeName",
                "MaterialCategoryTypeCode",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName"
            )
            VALUES
            (
                $1,
                $2,
                $3,
                false,
                CURRENT_TIMESTAMP,
                $4
            )
            RETURNING
                "MaterialCategoryTypeId",
                "MaterialCategoryTypeName",
                "MaterialCategoryTypeCode",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserName";
        `;

        const values = [
            categoryData.CompanyId,
            categoryData.MaterialCategoryTypeName,
            categoryData.MaterialCategoryTypeCode,
            categoryData.CreatedByUserName || null
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        throw error;
    }
};


// CHECK CATEGORY CODE FOR UPDATE
// Excludes current category

export const checkMaterialCategoryTypeCodeExistsForUpdate = async (
    CompanyId,
    MaterialCategoryTypeCode,
    MaterialCategoryTypeId
) => {

    const query = `
        SELECT
            "MaterialCategoryTypeId",
            "MaterialCategoryTypeCode"
        FROM "LKP"."MaterialCategoryType"
        WHERE
            "CompanyId" = $1
            AND LOWER("MaterialCategoryTypeCode") = LOWER($2)
            AND "MaterialCategoryTypeId" <> $3
        LIMIT 1;
    `;

    const values = [
        CompanyId,
        MaterialCategoryTypeCode,
        MaterialCategoryTypeId
    ];

    const result = await pool.query(query, values);

    return result.rows;
};


// UPDATE ITEM CATEGORY

export const updateMaterialCategoryTypeModel = async (categoryData) => {

    const query = `
        UPDATE "LKP"."MaterialCategoryType"
        SET
            "MaterialCategoryTypeName" = $1,
            "MaterialCategoryTypeCode" = $2,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $3
        WHERE
            "MaterialCategoryTypeId" = $4
            AND "CompanyId" = $5
        RETURNING
            "MaterialCategoryTypeId",
            "CompanyId",
            "MaterialCategoryTypeName",
            "MaterialCategoryTypeCode",
            "UpdatedAt",
            "UpdatedByUserName";
    `;

    const values = [
        categoryData.MaterialCategoryTypeName,
        categoryData.MaterialCategoryTypeCode,
        categoryData.UpdatedByUserName,
        categoryData.MaterialCategoryTypeId,
        categoryData.CompanyId
    ];

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};

// TOGGLE ITEM CATEGORY STATUS

export const toggleMaterialCategoryTypeStatusModel = async (categoryData) => {

    try {

        const query = `
            UPDATE "LKP"."MaterialCategoryType"

            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2

            WHERE "MaterialCategoryTypeId" = $3

            RETURNING
                "MaterialCategoryTypeId",
                "MaterialCategoryTypeName",
                "MaterialCategoryTypeCode",
                "IsDisabled",
                "UpdatedAt",
                "UpdatedByUserName";
        `;

        const values = [
            categoryData.IsDisabled,
            categoryData.UpdatedByUserName || null,
            categoryData.MaterialCategoryTypeId
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


export const validateCompanyId = async (CompanyId) => {

    const query = `
        SELECT "CompanyId"
        FROM "LKP"."Company"
        WHERE "CompanyId" = $1
          AND "IsDisabled" = false
        LIMIT 1;
    `;

    const result = await pool.query(query, [CompanyId]);

    if (result.rows.length === 0) {
        return {
            valid: false,
            message: "Company does not exist or is disabled"
        };
    }

    return {
        valid: true,
        CompanyId: result.rows[0].CompanyId
    };
};