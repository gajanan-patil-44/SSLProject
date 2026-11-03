import {pool} from "../../Config/db.js";

// =====================================================
// FLAG ID 1 - GET ALL MATERIAL SUB CATEGORY TYPES
// =====================================================

export const getAllMaterialSubCategoryTypes = async () => {

    const query = `
        SELECT
            msct."MaterialSubCategoryTypeId",
            msct."MaterialCategoryTypeId",
            mct."MaterialCategoryTypeName",
            msct."MaterialSubCategoryTypeName",
            msct."MaterialSubCategoryTypeCode",
            msct."IsDisabled",
            msct."CreatedAt",
            msct."UpdatedAt",
            msct."CreatedByUserName",
            msct."UpdatedByUserName"

        FROM "LKP"."MaterialSubCategoryType" msct

        INNER JOIN "LKP"."MaterialCategoryType" mct
            ON msct."MaterialCategoryTypeId" =mct."MaterialCategoryTypeId"
               

        ORDER BY msct."MaterialSubCategoryTypeId" ASC
    `;

    const result = await pool.query(query);

    return result.rows;
};


// =====================================================
// CHECK DUPLICATE SUB CATEGORY
// =====================================================

export const checkMaterialSubCategoryExists = async (
    MaterialSubCategoryTypeName,
    MaterialSubCategoryTypeCode
) => {

    const query = `
        SELECT
            "MaterialSubCategoryTypeId",
            "MaterialSubCategoryTypeName",
            "MaterialSubCategoryTypeCode"

        FROM "LKP"."MaterialSubCategoryType"

        WHERE
            "MaterialSubCategoryTypeName" = $1
            OR "MaterialSubCategoryTypeCode" = $2
    `;

    const result = await pool.query(query, [
        MaterialSubCategoryTypeName,
        MaterialSubCategoryTypeCode
    ]);

    return result.rows;
};


// =====================================================
// CHECK DUPLICATE FOR UPDATE
// =====================================================

export const checkMaterialSubCategoryExistsForUpdate = async (
    MaterialSubCategoryTypeName,
    MaterialSubCategoryTypeCode,
    MaterialSubCategoryTypeId
) => {

    const query = `
        SELECT
            "MaterialSubCategoryTypeId",
            "MaterialSubCategoryTypeName",
            "MaterialSubCategoryTypeCode"

        FROM "LKP"."MaterialSubCategoryType"

        WHERE
            (
                "MaterialSubCategoryTypeName" = $1
                OR "MaterialSubCategoryTypeCode" = $2
            )
            AND "MaterialSubCategoryTypeId" <> $3
    `;

    const result = await pool.query(query, [
        MaterialSubCategoryTypeName,
        MaterialSubCategoryTypeCode,
        MaterialSubCategoryTypeId
    ]);

    return result.rows;
};


// =====================================================
// CHECK CATEGORY EXISTS
// =====================================================

export const checkMaterialCategoryExists = async (
    MaterialCategoryTypeId
) => {

    const query = `
        SELECT
            "MaterialCategoryTypeId"

        FROM "LKP"."MaterialCategoryType"

        WHERE
            "MaterialCategoryTypeId" = $1
            AND "IsDisabled" = false
    `;

    const result = await pool.query(query, [
        MaterialCategoryTypeId
    ]);

    return result.rows;
};


// =====================================================
// FLAG ID 2 - ADD SUB CATEGORY
// =====================================================

export const addMaterialSubCategoryType = async (data) => {

    const query = `
        INSERT INTO "LKP"."MaterialSubCategoryType"
        (
            "CompanyId",
            "MaterialCategoryTypeId",
            "MaterialSubCategoryTypeName",
            "MaterialSubCategoryTypeCode",
            "IsDisabled",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            false,
            NOW(),
            $5
        )
        RETURNING
            "MaterialSubCategoryTypeId",
            "MaterialCategoryTypeId",
            "MaterialSubCategoryTypeName",
            "MaterialSubCategoryTypeCode",
            "IsDisabled",
            "CreatedAt",
            "CreatedByUserName"
    `;

    const result = await pool.query(query, [
        data.CompanyId,
        data.MaterialCategoryTypeId,
        data.MaterialSubCategoryTypeName,
        data.MaterialSubCategoryTypeCode,
        data.CreatedByUserName
    ]);

    return result.rows[0];
};


// =====================================================
// FLAG ID 3 - CATEGORY DROPDOWN
// =====================================================

export const getMaterialCategoryDropdown = async () => {

    const query = `
        SELECT
            "MaterialCategoryTypeId",
            "MaterialCategoryTypeName"

        FROM "LKP"."MaterialCategoryType"

        WHERE "IsDisabled" = false

        ORDER BY "MaterialCategoryTypeName" ASC
    `;

    const result = await pool.query(query);

    return result.rows;
};


// =====================================================
// FLAG ID 4 - EDIT SUB CATEGORY
// =====================================================

export const updateMaterialSubCategoryType = async (data) => {

    const query = `
        UPDATE "LKP"."MaterialSubCategoryType"

        SET
            "MaterialCategoryTypeId" = $1,
            "MaterialSubCategoryTypeName" = $2,
            "MaterialSubCategoryTypeCode" = $3,
            "UpdatedAt" = NOW(),
            "UpdatedByUserName" = $4

        WHERE
            "MaterialSubCategoryTypeId" = $5

        RETURNING
            "MaterialSubCategoryTypeId",
            "MaterialCategoryTypeId",
            "MaterialSubCategoryTypeName",
            "MaterialSubCategoryTypeCode",
            "IsDisabled",
            "UpdatedAt",
            "UpdatedByUserName"
    `;

    const result = await pool.query(query, [
        data.MaterialCategoryTypeId,
        data.MaterialSubCategoryTypeName,
        data.MaterialSubCategoryTypeCode,
        data.UpdatedByUserName,
        data.MaterialSubCategoryTypeId
    ]);

    return result.rows[0];
};


// =====================================================
// FLAG ID 5 - TOGGLE STATUS
// =====================================================

export const updateMaterialSubCategoryTypeStatus = async (
    MaterialSubCategoryTypeId,
    IsDisabled
) => {

    const query = `
        UPDATE "LKP"."MaterialSubCategoryType"

        SET
            "IsDisabled" = $1,
            "UpdatedAt" = NOW()

        WHERE
            "MaterialSubCategoryTypeId" = $2

        RETURNING
            "MaterialSubCategoryTypeId",
            "IsDisabled",
            "UpdatedAt"
    `;

    const result = await pool.query(query, [
        IsDisabled,
        MaterialSubCategoryTypeId
    ]);

    return result.rows[0];
};


