import { pool } from "../../Config/db.js";

// =====================================================
// FLAG ID 1 - VIEW ALL MATERIALS
// =====================================================
export const getAllMaterials = async () => {
    const query = `
        SELECT
            m."MaterialId",
            m."MaterialName",
            m."MaterialCode",
            m."MaterialCategoryTypeId",
            c."MaterialCategoryTypeName",
            m."MaterialSubCategoryTypeId",
            sc."MaterialSubCategoryTypeName",
            m."MaterialBrandName",
            m."ModelNo",
            m."UOMId",
            u."UOMName",
            m."GSTTypeId",
            gt."GSTTypeName",
            m."GSTRateId",
            gr."GSTPercentage",
            m."HSNSAC",
            m."WarrantyYears",
            m."IsDisabled",
            m."DescriptionSpecification",
            m."CreatedAt",
            m."UpdatedAt",
            m."CreatedByUserId",
            m."UpdatedByUserId",
            COALESCE(
                json_agg(
                    json_build_object(
                        'MaterialFileId', mf."MaterialFileId",
                        'FileTypeId', mf."FileTypeId",
                        'FilePatch', mf."FilePatch"
                    )
                ) FILTER (
                    WHERE mf."MaterialFileId" IS NOT NULL
                ),
                '[]'::json
            ) AS "Files"
        FROM "DATA"."Material" m
        LEFT JOIN "LKP"."MaterialCategoryType" c
            ON c."MaterialCategoryTypeId" =
               m."MaterialCategoryTypeId"
        LEFT JOIN "LKP"."MaterialSubCategoryType" sc
            ON sc."MaterialSubCategoryTypeId" =
               m."MaterialSubCategoryTypeId"
        LEFT JOIN "LKP"."UOM" u
            ON u."UOMId" = m."UOMId"
        LEFT JOIN "LKP"."GSTType" gt
            ON gt."GSTTypeId" = m."GSTTypeId"
        LEFT JOIN "LKP"."GSTRate" gr
            ON gr."GSTRateId" = m."GSTRateId"
        LEFT JOIN "DATA"."MaterialFile" mf
            ON mf."MaterialId" = m."MaterialId"
        GROUP BY
            m."MaterialId",
            c."MaterialCategoryTypeName",
            sc."MaterialSubCategoryTypeName",
            u."UOMName",
            gt."GSTTypeName",
            gr."GSTPercentage"
        ORDER BY m."MaterialId" DESC
    `;

    const result = await pool.query(query);
    return result.rows;
};
// =====================================================
// FLAG ID 2 - MATERIAL CATEGORY DROPDOWN
// =====================================================
export const getMaterialCategoryDropdown = async () => {
    const query = `
        SELECT
            "MaterialCategoryTypeId",
            "MaterialCategoryTypeName",
            "MaterialCategoryTypeCode"
        FROM "LKP"."MaterialCategoryType"
        WHERE "IsDisabled" = false
        ORDER BY "MaterialCategoryTypeName" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};
// =====================================================
// FLAG ID 3 - MATERIAL SUB-CATEGORY DROPDOWN
// =====================================================
export const getMaterialSubCategoryDropdown = async () => {
    const query = `
        SELECT
            s."MaterialSubCategoryTypeId",
            s."MaterialCategoryTypeId",
            c."MaterialCategoryTypeName",
            s."MaterialSubCategoryTypeName",
            s."MaterialSubCategoryTypeCode"
        FROM "LKP"."MaterialSubCategoryType" s
        INNER JOIN "LKP"."MaterialCategoryType" c
            ON c."MaterialCategoryTypeId" =
               s."MaterialCategoryTypeId"
        WHERE s."IsDisabled" = false
          AND c."IsDisabled" = false
        ORDER BY s."MaterialSubCategoryTypeName" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};
// =====================================================
// FLAG ID 4 - UOM DROPDOWN
// =====================================================
export const getUOMDropdown = async () => {
    const query = `
        SELECT
            "UOMId",
            "UOMName",
            "UOMCode"
        FROM "LKP"."UOM"
        WHERE "IsDisabled" = false
        ORDER BY "UOMName" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};
// =====================================================
// FLAG ID 5 - GST TYPE DROPDOWN
// =====================================================
export const getGSTTypeDropdown = async () => {
    const query = `
        SELECT
            "GSTTypeId",
            "GSTTypeName",
            "GSTTypeFullName"
        FROM "LKP"."GSTType"
        WHERE "IsDisabled" = false
        ORDER BY "GSTTypeName" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};
// =====================================================
// FLAG ID 6 - GST RATE DROPDOWN
// =====================================================

export const getGSTRateDropdown = async (GSTTypeId) => {
    const query = `
        SELECT
            r."GSTRateId",
            r."GSTTypeId",
            r."GSTPercentage"
        FROM "LKP"."GSTRate" r
        INNER JOIN "LKP"."GSTType" t
            ON r."GSTTypeId" = t."GSTTypeId"
        WHERE r."GSTTypeId" = $1
          AND r."IsDisabled" = false
          AND t."IsDisabled" = false
        ORDER BY r."GSTPercentage" ASC
    `;

    const result = await pool.query(query, [GSTTypeId]);
    return result.rows;
};

// =====================================================
// FLAG ID 7 - FILE TYPE DROPDOWN
// =====================================================
export const getFileTypeDropdown = async () => {
    const query = `
        SELECT
            "FileTypeId",
            "FileTypeName",
            "Description"
        FROM "LKP"."FileType"
        WHERE "IsDisabled" = false
        ORDER BY "FileTypeName" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};
// =====================================================
// FLAG ID 8 - ADD MATERIAL AND FILES
// =====================================================
export const addMaterial = async (data, files) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const materialQuery = `
            INSERT INTO "DATA"."Material"
            (
                "MaterialName",
                "MaterialCode",
                "MaterialCategoryTypeId",
                "MaterialSubCategoryTypeId",
                "MaterialBrandName",
                "ModelNo",
                "UOMId",
                "GSTTypeId",
                "GSTRateId",
                "HSNSAC",
                "WarrantyYears",
                "IsDisabled",
                "DescriptionSpecification",
                "CreatedAt",
                "CreatedByUserId"
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, $11, false, $12, NOW(), $13
            )
            RETURNING *
        `;

        const materialResult = await client.query(materialQuery, [
            data.MaterialName,
            data.MaterialCode,
            data.MaterialCategoryTypeId ?? null,
            data.MaterialSubCategoryTypeId ?? null,
            data.MaterialBrandName || null,
            data.ModelNo || null,
            data.UOMId ?? null,
            data.GSTTypeId ?? null,
            data.GSTRateId ?? null,
            data.HSNSAC || null,
            data.WarrantyYears ?? null,
            data.DescriptionSpecification || null,
            data.CreatedByUserId ?? null
        ]);

        const material = materialResult.rows[0];

        for (const file of files) {
            await client.query(
                `
                    INSERT INTO "DATA"."MaterialFile"
                    (
                        "MaterialId",
                        "FileTypeId",
                        "FilePatch",
                        "CreatedAt"
                    )
                    VALUES ($1, $2, $3, NOW())
                `,
                [
                    material.MaterialId,
                    file.FileTypeId,
                    file.FilePatch
                ]
            );
        }

        await client.query("COMMIT");

        return material;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
// =====================================================
// FLAG ID 9 - EDIT MATERIAL AND APPEND NEW FILES
// =====================================================
export const updateMaterial = async (data, files) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `
            UPDATE "DATA"."Material"
            SET
                "MaterialName" = $1,
                "MaterialCode" = $2,
                "MaterialCategoryTypeId" = $3,
                "MaterialSubCategoryTypeId" = $4,
                "MaterialBrandName" = $5,
                "ModelNo" = $6,
                "UOMId" = $7,
                "GSTTypeId" = $8,
                "GSTRateId" = $9,
                "HSNSAC" = $10,
                "WarrantyYears" = $11,
                "DescriptionSpecification" = $12,
                "UpdatedAt" = NOW(),
                "UpdatedByUserId" = $13
            WHERE "MaterialId" = $14
            RETURNING *
        `;

        const result = await client.query(query, [
            data.MaterialName,
            data.MaterialCode,
            data.MaterialCategoryTypeId ?? null,
            data.MaterialSubCategoryTypeId ?? null,
            data.MaterialBrandName || null,
            data.ModelNo || null,
            data.UOMId ?? null,
            data.GSTTypeId ?? null,
            data.GSTRateId ?? null,
            data.HSNSAC || null,
            data.WarrantyYears ?? null,
            data.DescriptionSpecification || null,
            data.UpdatedByUserId ?? null,
            data.MaterialId
        ]);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        for (const file of files) {
            await client.query(
                `
                    INSERT INTO "DATA"."MaterialFile"
                    (
                        "MaterialId",
                        "FileTypeId",
                        "FilePatch",
                        "CreatedAt"
                    )
                    VALUES ($1, $2, $3, NOW())
                `,
                [data.MaterialId,file.FileTypeId,file.FilePatch]
            );
        }

        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
// =====================================================
// FLAG ID 10 - ENABLE / DISABLE MATERIAL
// =====================================================
export const updateMaterialStatus = async (MaterialId,IsDisabled) => {
    const query = `
        UPDATE "DATA"."Material"
        SET
            "IsDisabled" = $1,
            "UpdatedAt" = NOW()
        WHERE "MaterialId" = $2
        RETURNING
            "MaterialId",
            "IsDisabled",
            "UpdatedAt"
    `;
    const result = await pool.query(query, [IsDisabled,MaterialId]);
    return result.rows[0] || null;
};


// =====================================================
// FLAG ID 11 - FETCH MATERIAL FILE PATH
// =====================================================
export const fetchMaterialFilePath = async (MaterialFileId) => {

    const query = `
        SELECT
            "MaterialFileId",
            "MaterialId",
            "FileTypeId",
            "FilePatch"
        FROM "DATA"."MaterialFile"
        WHERE "MaterialFileId" = $1
    `;

    const result = await pool.query(query, [
        MaterialFileId
    ]);

    return result.rows;
};