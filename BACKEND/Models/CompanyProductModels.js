import {pool} from "../Config/db.js";


// ==========================================
// GET ALL COMPANY PRODUCTS
// ==========================================

export const getAllCompanyProducts = async () => {

    const query = `
        SELECT
            C."CompanyName",
            P."ProductName",
            CP."IsDisabled",
            CP."CreatedAt" 
        FROM "LKP"."CompanyProduct" CP
        INNER JOIN "LKP"."Company" C
            ON CP."CompanyId" = C."CompanyId"
        INNER JOIN "LKP"."Product" P
            ON CP."ProductId" = P."ProductId"
        ORDER BY CP."CreatedAt" DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};

export const getCompaniesForDropdown = async () => {

    const query = `
        SELECT
            "CompanyId",
            "CompanyName"
        FROM "LKP"."Company"
        WHERE "IsDisabled" = false
        ORDER BY "CompanyName";
    `;

    const result = await pool.query(query);

    return result.rows;
};


export const getProductsForDropdown = async () => {

    const query = `
        SELECT
            "ProductId",
            "ProductName"
        FROM "LKP"."Product"
        WHERE "IsDisabled" = false
        ORDER BY "ProductName";
    `;

    const result = await pool.query(query);

    return result.rows;
};


export const addCompanyProduct = async (companyProductData) => {

    const query = `
        INSERT INTO "LKP"."CompanyProduct"
        (
            "CompanyId",
            "ProductId",
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
            "CompanyProductId",
            "CompanyId",
            "ProductId",
            "IsDisabled",
            "CreatedAt",
            "CreatedByUserName";
    `;

    const values = [
        companyProductData.CompanyId,
        companyProductData.ProductId,
        companyProductData.CreatedByUserName
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


export const checkCompanyProductData = async (CompanyId, ProductId) => {

    const query = `
        SELECT
            C."CompanyId",
            P."ProductId"
        FROM "LKP"."Company" C
        CROSS JOIN "LKP"."Product" P
        WHERE C."CompanyId" = $1
        AND P."ProductId" = $2
    `;

    const values = [
        CompanyId,
        ProductId
    ];

    const result = await pool.query(query, values);

    return result.rows;
};