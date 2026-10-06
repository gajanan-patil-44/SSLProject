import { pool } from "../../Config/db.js";


// GET ALL ITEM CATEGORIES

export const getAllMaterialCategoryTypes = async () => {

    try {

        const query = `
            SELECT
                "MaterialCategoryTypeId",
                "MaterialCategoryTypeName",
                "MaterialCategoryTypeCode",
                "IsDisabled",
                "CreatedAt",
                "UpdatedAt",
                "CreatedByUserName",
                "UpdatedByUserName"

            FROM "LKP"."MaterialCategoryType"

            ORDER BY "MaterialCategoryTypeName"
        `;


        const result = await pool.query(query);


        return result.rows;

    } catch (error) {

        throw error;
    }
};


// CHECK CATEGORY CODE FOR ADD

export const checkMaterialCategoryTypeCodeExists = async (MaterialCategoryTypeCode) => {

    try {

        const query = `
            SELECT
                "MaterialCategoryTypeId",
                "MaterialCategoryTypeCode"

            FROM "LKP"."MaterialCategoryType"

            WHERE "MaterialCategoryTypeCode" = $1
        `;


        const values = [MaterialCategoryTypeCode];


        const result = await pool.query(
            query,
            values
        );


        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ADD ITEM CATEGORY

export const addMaterialCategoryTypeModel = async (categoryData) => {

    try {

        const query = `
            INSERT INTO "LKP"."MaterialCategoryType"
            (
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
                false,
                CURRENT_TIMESTAMP,
                $3
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
    MaterialCategoryTypeCode,
    MaterialCategoryTypeId
) => {

    try {

        const query = `
            SELECT
                "MaterialCategoryTypeId",
                "MaterialCategoryTypeCode"

            FROM "LKP"."MaterialCategoryType"

            WHERE
                "MaterialCategoryTypeCode" = $1
                AND "MaterialCategoryTypeId" <> $2
        `;


        const values = [
            MaterialCategoryTypeCode,
            MaterialCategoryTypeId
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


// UPDATE ITEM CATEGORY

export const updateMaterialCategoryTypeModel = async (categoryData) => {

    try {

        const query = `
            UPDATE "LKP"."MaterialCategoryType"

            SET
                "MaterialCategoryTypeName" = $1,
                "MaterialCategoryTypeCode" = $2,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $3

            WHERE "MaterialCategoryTypeId" = $4
        `;


        const values = [
            categoryData.MaterialCategoryTypeName,
            categoryData.MaterialCategoryTypeCode,
            categoryData.UpdatedByUserName || null,
            categoryData.MaterialCategoryTypeId
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


