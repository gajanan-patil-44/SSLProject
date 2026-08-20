import { pool } from "../Config/db.js";


// ==========================================
// GET ALL ACTIVE PRODUCTS
// ==========================================

export const getAllProducts = async () => {

    try {

        const result = await pool.query(`
            SELECT
                "ProductId" AS "ProductId",
                "ProductCode" AS "ProductCode",
                "ProductName" AS "ProductName",
                "ProductDescription" AS "Description",
                "CreatedByUserName" AS "RequestUserName",
                "CreatedAt" AS "CreatedOn",
                "UpdatedAt" AS "UpdatedOn",
                "UpdatedByUserName" AS "UpdatedByUserName",
                "IsDisabled" AS "IsDisabled"

            FROM "LKP"."Product"

            WHERE "IsDisabled" = false

            ORDER BY "ProductId"
        `);

        return result.rows;

    } catch (error) {

        console.error("Error fetching products:", error);

        throw error;
    }
};


export const checkProductExists = async (ProductName, ProductCode) => {

    try {

        const query = `
            SELECT
                "ProductId",
                "ProductName",
                "ProductCode"
            FROM "LKP"."Product"
            WHERE "ProductName" = $1
               OR "ProductCode" = $2
        `;

        const values = [
            ProductName,
            ProductCode
        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        console.error("Error checking product existence:", error);

        throw error;
    }
};


// ==========================================
// ADD PRODUCT
// ==========================================

export const addProduct = async (productData) => {

    try {

        const query = `
            INSERT INTO "LKP"."Product"
            (
                "ProductCode",
                "ProductName",
                "ProductDescription",
                "IsDisabled",
                "CreatedAt",
                "UpdatedAt",
                "CreatedByUserName",
                "UpdatedByUserName"
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

    } catch (error) {

        console.error("Error adding product:", error);

        throw error;
    }
};



export const checkProductExistsForUpdate = async (
    ProductName,
    ProductCode,
    ProductId
) => {

    try {

        const query = `
            SELECT
                "ProductId",
                "ProductName",
                "ProductCode"
            FROM "LKP"."Product"
            WHERE
                (
                    "ProductName" = $1
                    OR "ProductCode" = $2
                )
                AND "ProductId" <> $3
        `;

        const values = [
            ProductName,
            ProductCode,
            ProductId
        ];

        const result = await pool.query(query, values);

        return result.rows;

    } catch (error) {

        console.error("Error checking product existence for update:", error);

        throw error;
    }
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProducts = async (productData) => {

    try {

        const query = `
            UPDATE "LKP"."Product"
            SET
                "ProductCode" = $1,
                "ProductName" = $2,
                "ProductDescription" = $3,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $4,
               

            WHERE "ProductId" = $5
        `;

        const values = [
            productData.ProductCode,
            productData.ProductName,
            productData.ProductDescription,
            productData.UpdatedByUserName,
            productData.ProductId
        ];

        const result = await pool.query(query, values);

        return result.rowCount;

    } catch (error) {

        console.error("Error updating product:", error);

        throw error;
    }
};



// ==========================================
// TOGGLE PRODUCT STATUS
// ==========================================

export const toggleProductStatuses = async (productData) => {

    try {

        const query = `
            UPDATE "LKP"."Product"
            SET
                "IsDisabled" = NOT "IsDisabled",
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $1
            WHERE "ProductId" = $2
            RETURNING *;
        `;

        const values = [
            productData.UpdatedByUserName,
            productData.ProductId
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        console.error("Error toggling product status:", error);

        throw error;
    }
};



// ==========================================
// DELETE / DISABLE PRODUCT
// ==========================================

export const deleteProducts = async (productData) => {

    try {

        const query = `
            DELETE FROM "LKP"."Product"
            WHERE "ProductId" = $1
        `;

        const values = [
            productData.ProductId
        ];

        const result = await pool.query(query, values);

        return result.rowCount;

    } catch (error) {

        console.error("Error deleting product:", error);

        throw error;
    }
};