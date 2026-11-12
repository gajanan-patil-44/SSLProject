
import { pool } from "../../Config/db.js";

// FLAG ID 1 - VIEW ALL CUSTOMER TYPES

export const getAllCustomerTypes = async () => {
    const query = `
        SELECT
            "CustomerTypeId",
            "CustomerTypeName",
            "CustomerTypeCode",
            "GstApplicable",
            "IsDisabled",
            "Description",
            "CreatedAt",
            "UpdatedAt",
            "CreatedByUserName",
            "UpdatedByUserName"
        FROM "LKP"."CustomerType"
        ORDER BY "CustomerTypeId" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};


// CHECK DUPLICATE (ADD) - same CustomerTypeCode

export const checkCustomerTypeExists = async (CustomerTypeCode) => {
    const query = `
        SELECT
            "CustomerTypeId",
            "CustomerTypeName",
            "CustomerTypeCode"
        FROM "LKP"."CustomerType"
        WHERE LOWER("CustomerTypeCode") = LOWER($1)
    `;

    const result = await pool.query(query, [CustomerTypeCode]);
    return result.rows;
};


// CHECK DUPLICATE (EDIT) - ignores the row being edited

export const checkCustomerTypeExistsForUpdate = async (
    CustomerTypeCode,
    CustomerTypeId
) => {
    const query = `
        SELECT
            "CustomerTypeId",
            "CustomerTypeName",
            "CustomerTypeCode"
        FROM "LKP"."CustomerType"
        WHERE LOWER("CustomerTypeCode") = LOWER($1)
          AND "CustomerTypeId" <> $2
    `;

    const result = await pool.query(query, [
        CustomerTypeCode,
        CustomerTypeId
    ]);

    return result.rows;
};


// FLAG ID 2 - ADD CUSTOMER TYPE

export const addCustomerType = async (data) => {
    const query = `
        INSERT INTO "LKP"."CustomerType"
        (
            "CustomerTypeName",
            "CustomerTypeCode",
            "GstApplicable",
            "IsDisabled",
            "Description",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES ($1, $2, $3, false, $4, NOW(), $5)
        RETURNING
            "CustomerTypeId",
            "CustomerTypeName",
            "CustomerTypeCode",
            "GstApplicable",
            "IsDisabled",
            "Description",
            "CreatedAt",
            "CreatedByUserName"
    `;

    const result = await pool.query(query, [
        data.CustomerTypeName,
        data.CustomerTypeCode,
        data.GstApplicable ?? false,
        data.Description ?? null,
        data.CreatedByUserName
    ]);

    return result.rows[0];
};


// FLAG ID 3 - EDIT CUSTOMER TYPE

export const updateCustomerType = async (data) => {
    const query = `
        UPDATE "LKP"."CustomerType"
        SET
            "CustomerTypeName"   = $1,
            "CustomerTypeCode"   = $2,
            "GstApplicable"      = $3,
            "Description"        = $4,
            "UpdatedAt"          = NOW(),
            "UpdatedByUserName"  = $5
        WHERE "CustomerTypeId" = $6
        RETURNING
            "CustomerTypeId",
            "CustomerTypeName",
            "CustomerTypeCode",
            "GstApplicable",
            "IsDisabled",
            "Description",
            "UpdatedAt",
            "UpdatedByUserName"
    `;

    const result = await pool.query(query, [
        data.CustomerTypeName,
        data.CustomerTypeCode,
        data.GstApplicable,
        data.Description ?? null,
        data.UpdatedByUserName,
        data.CustomerTypeId
    ]);

    return result.rows[0];
};


// FLAG ID 4 - TOGGLE STATUS

export const updateCustomerTypeStatus = async (
    CustomerTypeId,
    IsDisabled,
    UpdatedByUserName
) => {
    const query = `
        UPDATE "LKP"."CustomerType"
        SET
            "IsDisabled"        = $1,
            "UpdatedAt"         = NOW(),
            "UpdatedByUserName" = $2
        WHERE "CustomerTypeId" = $3
        RETURNING
            "CustomerTypeId",
            "IsDisabled",
            "UpdatedAt",
            "UpdatedByUserName"
    `;

    const result = await pool.query(query, [
        IsDisabled,
        UpdatedByUserName,
        CustomerTypeId
    ]);

    return result.rows[0];
};
