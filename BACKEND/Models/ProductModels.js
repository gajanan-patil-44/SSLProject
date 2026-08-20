import { pool } from "../Config/db.js";


// ==========================================
// GET ALL ACTIVE PRODUCTS
// ==========================================

export const getAllProducts = async () => {

    const result = await pool.query(`
        SELECT
            "ProductId" AS "ProductId",
            "ProductCode" AS "ProductCode",
            "ProductName" AS "ProductName",
            "ProductDescription" AS "Description",
            "createdByUserName" AS "RequestUserName",
            "CreatedAt" AS "CreatedOn",
            "UpdatedAt" AS "UpdatedOn",
            "updatedByUserName" AS "UpdatedByUserName",
            "isDisabled" AS "IsDisabled"

        FROM "LKP"."Product"

        WHERE "isDisabled" = false

        ORDER BY "ProductId"
    `);

    return result.rows;
};


// ==========================================
// ADD PRODUCT
// ==========================================

export const addProduct = async (productData) => {

    const query = `
        INSERT INTO "LKP"."Product"
        (
            "ProductCode",
            "ProductName",
            "ProductDescription",
            "isDisabled",
            "CreatedAt",
            "UpdatedAt",
            "createdByUserName",
            "updatedByUserName"
        )
        VALUES
        (
            $1,
            $2,
            $3,
            false,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            $4,
            $4
        )
        RETURNING *;
    `;

    const values = [
        productData.ProductCode,
        productData.ProductName,
        productData.ProductDescription,
        productData.RequestUserName
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProducts = async (productData) => {

    const query = `
        UPDATE "LKP"."Product"
        SET
            "ProductCode" = $1,
            "ProductName" = $2,
            "ProductDescription" = $3,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "updatedByUserName" = $4,
            "isDisabled" = $5

        WHERE "ProductId" = $6
    `;

    const values = [
        productData.ProductCode,
        productData.ProductName,
        productData.ProductDescription,
        productData.UpdatedByUserName,
        productData.IsDisabled,
        productData.ProductId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};


// ==========================================
// DELETE / DISABLE PRODUCT
// ==========================================

export const deleteProducts = async (productData) => {

    const query = `
        UPDATE "LKP"."Product"
        SET
            "isDisabled" = true,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "updatedByUserName" = $1

        WHERE "ProductId" = $2
    `;

    const values = [
        productData.UpdatedByUserName,
        productData.ProductId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};