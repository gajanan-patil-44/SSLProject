
import { pool } from "../../Config/db.js";

// =====================================================
// FLAG ID 1 - VIEW ALL VENDORS
// =====================================================

export const getAllVendors = async () => {
    const query = `
        SELECT
            v."VendorId",
            v."VendorName",
            v."VendorCode",
            v."ContactPerson",
            v."MobileNumber",
            v."Email",
            v."GSTINUINNumber",
            v."City",
            v."BankName",
            v."AccountHolderName",
            v."IFSCCode",
            v."VendorAddress1",
            v."VendorAddress2",
            v."Remarks",
            v."VendorTypeId",
            vt."VendorTypeName",
            v."IsDisabled",
            v."CreatedAt",
            v."UpdatedAt",
            v."CreatedByUserId",
            v."UpdatedByUserId",
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'VendorFileId', vf."VendorFileId",
                            'VendorFileTypeId', vf."VendorFileTypeId",
                            'VendorFileTypeName', vft."VendorFileTypeName",
                            'VendorFilePath', vf."VendorFilePath"
                        )
                    )
                    FROM "DATA"."VendorFile" vf
                    LEFT JOIN "LKP"."VendorFileType" vft
                        ON vft."VendorFileTypeId" = vf."VendorFileTypeId"
                    WHERE vf."VendorId" = v."VendorId"
                      AND vf."IsDisabled" = false
                ),
                '[]'::json
            ) AS "Files"
        FROM "DATA"."Vendor" v
        INNER JOIN "LKP"."VendorType" vt
            ON vt."VendorTypeId" = v."VendorTypeId"
        ORDER BY v."VendorId" DESC
    `;

    const result = await pool.query(query);
    return result.rows;
};

// =====================================================
// FLAG ID 2 - VENDOR TYPE DROPDOWN
// =====================================================

export const getVendorTypeDropdown = async () => {
    const query = `
        SELECT
            "VendorTypeId",
            "VendorTypeName",
            "VendorCode"
        FROM "LKP"."VendorType"
        WHERE "IsDisabled" = false
        ORDER BY "VendorTypeName" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};

// =====================================================
// FLAG ID 2 - VENDOR FILE TYPE DROPDOWN
// =====================================================

export const getVendorFileTypeDropdown = async () => {
    const query = `
        SELECT
            "VendorFileTypeId",
            "VendorFileTypeName"
        FROM "LKP"."VendorFileType"
        WHERE "IsDisabled" = false
        ORDER BY "VendorFileTypeName" ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};

// =====================================================
// FLAG ID 3 - ADD VENDOR
// =====================================================

export const addVendor = async (data, files) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const query = `
            INSERT INTO "DATA"."Vendor"
            (
                "VendorName",
                "VendorCode",
                "ContactPerson",
                "MobileNumber",
                "Email",
                "GSTINUINNumber",
                "City",
                "BankName",
                "AccountHolderName",
                "IFSCCode",
                "IsDisabled",
                "VendorAddress1",
                "VendorAddress2",
                "Remarks",
                "VendorTypeId",
                "CreatedAt",
                "CreatedByUserId"
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, false, $11, $12,
                $13, $14, NOW(), $15
            )
            RETURNING *
        `;

        const values = [
            data.VendorName.trim(),
            data.VendorCode.trim(),
            data.ContactPerson || null,
            data.MobileNumber.trim(),
            data.Email || null,
            data.GSTINUINNumber.trim(),
            data.City || null,
            data.BankName || null,
            data.AccountHolderName || null,
            data.IFSCCode || null,
            data.VendorAddress1 || null,
            data.VendorAddress2 || null,
            data.Remarks || null,
            Number(data.VendorTypeId),
            data.CreatedByUserId || null
        ];

        const result = await client.query(query, values);
        const vendor = result.rows[0];

        for (const file of files) {
            await client.query(
                `
                INSERT INTO "DATA"."VendorFile"
                (
                    "VendorId",
                    "VendorFileTypeId",
                    "VendorFilePath",
                    "IsDisabled"
                )
                VALUES ($1, $2, $3, false)
                `,
                [
                    vendor.VendorId,
                    file.VendorFileTypeId,
                    file.VendorFilePath
                ]
            );
        }

        await client.query("COMMIT");
        return vendor;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// =====================================================
// FLAG ID 4 - EDIT VENDOR
// Appends any newly uploaded files
// =====================================================

export const updateVendor = async (data, files) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const query = `
            UPDATE "DATA"."Vendor"
            SET
                "VendorName" = $1,
                "VendorCode" = $2,
                "ContactPerson" = $3,
                "MobileNumber" = $4,
                "Email" = $5,
                "GSTINUINNumber" = $6,
                "City" = $7,
                "BankName" = $8,
                "AccountHolderName" = $9,
                "IFSCCode" = $10,
                "VendorAddress1" = $11,
                "VendorAddress2" = $12,
                "Remarks" = $13,
                "VendorTypeId" = $14,
                "UpdatedAt" = NOW(),
                "UpdatedByUserId" = $15
            WHERE "VendorId" = $16
            RETURNING *
        `;

        const values = [
            data.VendorName.trim(),
            data.VendorCode.trim(),
            data.ContactPerson || null,
            data.MobileNumber.trim(),
            data.Email || null,
            data.GSTINUINNumber.trim(),
            data.City || null,
            data.BankName || null,
            data.AccountHolderName || null,
            data.IFSCCode || null,
            data.VendorAddress1 || null,
            data.VendorAddress2 || null,
            data.Remarks || null,
            Number(data.VendorTypeId),
            data.UpdatedByUserId || null,
            Number(data.VendorId)
        ];

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        for (const file of files) {
            await client.query(
                `
                INSERT INTO "DATA"."VendorFile"
                (
                    "VendorId",
                    "VendorFileTypeId",
                    "VendorFilePath",
                    "IsDisabled"
                )
                VALUES ($1, $2, $3, false)
                `,
                [
                    Number(data.VendorId),
                    file.VendorFileTypeId,
                    file.VendorFilePath
                ]
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
// FLAG ID 5 - ENABLE / DISABLE VENDOR
// =====================================================

export const updateVendorStatus = async (
    VendorId,
    IsDisabled
) => {
    const query = `
        UPDATE "DATA"."Vendor"
        SET
            "IsDisabled" = $1,
            "UpdatedAt" = NOW()
        WHERE "VendorId" = $2
        RETURNING
            "VendorId",
            "IsDisabled",
            "UpdatedAt"
    `;

    const result = await pool.query(query, [
        IsDisabled,
        VendorId
    ]);

    return result.rows[0] || null;
};

export const fetchVendorFilePath = async (VendorFileId) => {
    const query = `
        SELECT
            "VendorFileId",
            "VendorId",
            "VendorFileTypeId",
            "VendorFilePath"
        FROM "DATA"."VendorFile"
        WHERE "VendorFileId" = $1
          AND "IsDisabled" = false
    `;

    const result = await pool.query(query, [VendorFileId]);

    return result.rows;
};