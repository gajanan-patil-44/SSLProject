
import { pool } from "../../Config/db.js";

// =====================================================
// FLAG ID 1 - VIEW ALL VENDORS
// =====================================================
export const getAllVendors = async (CompanyId) => {
    const query = `
        SELECT
            v."VendorId",
            v."CompanyId",
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
        WHERE
            ($1::SMALLINT IS NULL OR v."CompanyId" = $1::SMALLINT)
        ORDER BY v."VendorId" DESC
    `;

    const result = await pool.query(query, [CompanyId]);
    return result.rows;
};
// =====================================================
// FLAG ID 2 - VENDOR TYPE DROPDOWN
// =====================================================
export const getVendorTypeDropdown = async (CompanyId) => {
    const query = `
        SELECT
            "VendorTypeId",
            "VendorTypeName",
            "VendorCode"
        FROM "LKP"."VendorType"
        WHERE "IsDisabled" = false
          AND (
              $1::smallint IS NULL
              OR "CompanyId" = $1
          )
        ORDER BY "VendorTypeName" ASC;
    `;

    const result = await pool.query(query, [CompanyId]);
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
        // =========================================
        // VALIDATE COMPULSORY FILE TYPES
        // =========================================
        const uploadedFileTypeIds = files.map(file =>
            Number(file.VendorFileTypeId)
        );

        if (!uploadedFileTypeIds.includes(1)) {
            throw new Error("VendorFileTypeIds: Vendor File Type 1 is required");
        }

        if (!uploadedFileTypeIds.includes(2)) {
            throw new Error("VendorFileTypeIds: Vendor File Type 2 is required");
        }

        await client.query("BEGIN");

        // =========================================
        // INSERT VENDOR
        // =========================================
        const query = `
            INSERT INTO "DATA"."Vendor"
            (
                "CompanyId",
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
                $8, $9, $10, $11, false, $12, $13,
                $14, $15, NOW(), $16
            )
            RETURNING *
        `;

        const values = [
            data.CompanyId,
            data.VendorName.trim(),
            data.VendorCode.trim(),
            data.ContactPerson.trim(),
            data.MobileNumber.trim(),
            data.Email.trim(),
            data.GSTINUINNumber.trim(),
            data.City.trim(),

            // Optional fields
            data.BankName?.trim() || null,
            data.AccountHolderName?.trim() || null,
            data.IFSCCode?.trim() || null,

            data.VendorAddress1.trim(),
            data.VendorAddress2?.trim() || null,
            data.Remarks?.trim() || null,

            Number(data.VendorTypeId),
            Number(data.CreatedByUserId)
        ];

        const result = await client.query(query, values);
        const vendor = result.rows[0];

        // =========================================
        // INSERT VENDOR FILES
        // =========================================
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
                    Number(file.VendorFileTypeId),
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


export const updateVendor = async (data, files = []) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const query = `
            UPDATE "DATA"."Vendor"
            SET
                "CompanyId" = $1,
                "VendorName" = $2,
                "VendorCode" = $3,
                "ContactPerson" = $4,
                "MobileNumber" = $5,
                "Email" = $6,
                "GSTINUINNumber" = $7,
                "City" = $8,
                "BankName" = $9,
                "AccountHolderName" = $10,
                "IFSCCode" = $11,
                "VendorAddress1" = $12,
                "VendorAddress2" = $13,
                "Remarks" = $14,
                "VendorTypeId" = $15,
                "UpdatedAt" = NOW(),
                "UpdatedByUserId" = $16
            WHERE "VendorId" = $17
            RETURNING *
        `;

        const values = [
            data.CompanyId ? Number(data.CompanyId) : null,
            data.VendorName.trim(),
            data.VendorCode.trim(),
            data.ContactPerson.trim(),
            data.MobileNumber.trim(),
            data.Email.trim(),
            data.GSTINUINNumber.trim(),
            data.City.trim(),
            data.BankName?.trim() || null,
            data.AccountHolderName?.trim() || null,
            data.IFSCCode?.trim() || null,
            data.VendorAddress1.trim(),
            data.VendorAddress2?.trim() || null,
            data.Remarks?.trim() || null,
            Number(data.VendorTypeId),
            Number(data.UpdatedByUserId),
            Number(data.VendorId)
        ];

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        // Insert new files if uploaded
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