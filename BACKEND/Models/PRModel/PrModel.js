import { pool } from "../../Config/db.js";

export const getPriorityLevelDrpDwnModel = async () => {
    try {
        let query = `SELECT "PriorityId", "PriorityName" FROM "LKP"."Priority" WHERE "IsDisabled" = false`;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
}


export const getMaterialDrpDwnModel = async (selectedMaterialIds = []) => {
    try {

        const query = `
            SELECT
                "MaterialId",
                "MaterialName"
            FROM "DATA"."Material"
            WHERE
                "IsDisabled" = false
                AND NOT ("MaterialId" = ANY($1::integer[]))
            ORDER BY "MaterialName" ASC
        `;

        const result = await pool.query(query, [
            selectedMaterialIds
        ]);

        return result.rows;

    } catch (error) {
        throw error;
    }
};


export const createPRPOModel = async ({
    header,
    materials,
    files,
    fileTypeIds
}) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==========================================
        // 1. INSERT PRPO HEADER
        // ==========================================

        // Temporary unique number because PRPOHeaderNumber
        // is NOT NULL and UNIQUE.

        const temporaryNumber = `VTPL-${Date.now()}`;

        const headerQuery = `
            INSERT INTO "PRPO"."PRPOHeader"
            (
                "PRPOHeaderNumber",
                "RequestDate",
                "RequiredDate",
                "DesignationId",
                "DepartmentId",
                "ProjectId",
                "PriorityId",
                "PRPOStatusId",
                "ReportingToUserId",
                "CreatedByUserId",
                "CompanyId",
                "PurPose",
                "CreatedAt",
                "IsDisabled"
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6, $7,
                2, $8, $9, $10, $11,
                CURRENT_TIMESTAMP, false
            )
            RETURNING "PRPOHeaderId"
        `;

        const headerResult = await client.query(headerQuery, [

            temporaryNumber,
            header.RequestDate,
            header.RequiredDate,
            header.DesignationId,
            header.DepartmentId,
            header.ProjectId,
            header.PriorityId,
            header.ReportingToUserId,
            header.CreatedByUserId,
            header.CompanyId,
            header.PurPose

        ]);

        const PRPOHeaderId = headerResult.rows[0].PRPOHeaderId;


        // ==========================================
        // 2. GENERATE PRPO HEADER NUMBER
        // ==========================================

        const PRPOHeaderNumber =
            `PRPO-${String(PRPOHeaderId).padStart(5, "0")}`;

        await client.query(
            `
                UPDATE "PRPO"."PRPOHeader"
                SET "PRPOHeaderNumber" = $1
                WHERE "PRPOHeaderId" = $2
            `,
            [
                PRPOHeaderNumber,
                PRPOHeaderId
            ]
        );


        // ==========================================
        // 3. INSERT PRPO MATERIALS
        // ==========================================

        const materialQuery = `
            INSERT INTO "PRPO"."PRPOMaterial"
            (
                "PRPOHeaderId",
                "LineNumber",
                "MaterialId",
                "MaterialDescription",
                "Quantity",
                "CreatedByUserId",
                "CreatedAt",
                "IsDisabled"
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6,
                CURRENT_TIMESTAMP, false
            )
            RETURNING "PRPOMaterialId"
        `;

        const insertedMaterials = [];

        for (let i = 0; i < materials.length; i++) {

            const material = materials[i];

            const materialResult = await client.query(
                materialQuery,
                [
                    PRPOHeaderId,
                    i + 1,
                    material.MaterialId,
                    material.MaterialDescription || null,
                    material.Quantity,
                    header.CreatedByUserId
                ]
            );

            insertedMaterials.push({
                PRPOMaterialId:
                    materialResult.rows[0].PRPOMaterialId,

                LineNumber: i + 1,

                MaterialId: material.MaterialId
            });
        }


        // ==========================================
        // 4. INSERT PRPO APPROVAL
        // ==========================================

        const approvalQuery = `
            INSERT INTO "PRPO"."PRPOApproval"
            (
                "PRPOHeaderId",
                "ApprovalLevel",
                "AssignmentRound",
                "ApproverUserId",
                "ForwardedToUserId",
                "PRPOStatusId",
                "AssignedAt",
                "IsCurrent",
                "IsDisabled"
            )
            VALUES
            (
                $1, 1, 1, $2, NULL, 2,
                CURRENT_TIMESTAMP, true, false
            )
            RETURNING "PRPOApprovalId"
        `;

        const approvalResult = await client.query(
            approvalQuery,
            [
                PRPOHeaderId,
                header.ReportingToUserId
            ]
        );


        // ==========================================
        // 5. INSERT PRPO ATTACHED FILES
        // ==========================================

        const fileQuery = `
            INSERT INTO "PRPO"."PRPOAttachedFile"
            (
                "PRPOHeaderId",
                "FileTypeId",
                "FileName",
                "FilePath",
                "MimeFileType",
                "FileSizeBytes",
                "CreatedByUserId",
                "CreatedAt",
                "IsDisabled"
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6,
                $7, CURRENT_TIMESTAMP, false
            )
            RETURNING "PRPOAttachedFileId"
        `;

        const insertedFiles = [];

        for (let i = 0; i < files.length; i++) {

            const file = files[i];

            const fileResult = await client.query(
                fileQuery,
                [
                    PRPOHeaderId,
                    fileTypeIds[i],
                    file.originalname,
                    file.path,
                    file.mimetype,
                    file.size,
                    header.CreatedByUserId
                ]
            );

            insertedFiles.push({
                PRPOAttachedFileId:
                    fileResult.rows[0].PRPOAttachedFileId,

                FileName: file.originalname,

                FileTypeId: fileTypeIds[i]
            });
        }


        // ==========================================
        // 6. INSERT PRPO STATUS HISTORY
        // ==========================================

        const historyQuery = `
            INSERT INTO "PRPO"."PRPOStatusHistory"
            (
                "PRPOHeaderId",
                "FromPRPOStatusId",
                "ToPRPOStatusId",
                "ActionByUserId",
                "ActionForUserId",
                "ActionAt",
                "Comments",
                "IsDisabled"
            )
            VALUES
            (
                $1, 2, 2, $2, $3,
                CURRENT_TIMESTAMP, $4, false
            )
            RETURNING "PRPOStatusHistoryId"
        `;

        const historyResult = await client.query(
            historyQuery,
            [
                PRPOHeaderId,
                header.CreatedByUserId,
                header.ReportingToUserId,
                "PRPO submitted successfully"
            ]
        );


        // ==========================================
        // 7. COMMIT TRANSACTION
        // ==========================================

        await client.query("COMMIT");

        return {

            PRPOHeaderId,

            PRPOHeaderNumber,

            PRPOStatusId: 2,

            PRPOApprovalId:
                approvalResult.rows[0].PRPOApprovalId,

            PRPOStatusHistoryId:
                historyResult.rows[0].PRPOStatusHistoryId,

            Materials: insertedMaterials,

            Files: insertedFiles

        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
};

export const updateActionPRPOStatusModel = async ({
    PRPOHeaderId,
    PRPOStatusId,
    ActionByUserId,
    ActionForUserId,
    Comments
}) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==========================================
        // 1. FETCH PRPO HEADER AND LOCK ROW
        // ==========================================

        const headerQuery = `
            SELECT
                "PRPOHeaderId",
                "PRPOHeaderNumber",
                "PRPOStatusId"
            FROM "PRPO"."PRPOHeader"
            WHERE
                "PRPOHeaderId" = $1
                AND "IsDisabled" = false
            FOR UPDATE
        `;

        const headerResult = await client.query(
            headerQuery,
            [PRPOHeaderId]
        );

        if (headerResult.rows.length === 0) {

            const error = new Error("PRPO not found.");
            error.statusCode = 404;
            throw error;
        }

        const header = headerResult.rows[0];

        const FromPRPOStatusId = header.PRPOStatusId;


        // ==========================================
        // 2. FETCH CURRENT APPROVER AND LOCK ROW
        // ==========================================

        const approvalQuery = `
            SELECT
                "PRPOApprovalId",
                "ApprovalLevel",
                "AssignmentRound",
                "ApproverUserId",
                "ForwardedToUserId",
                "PRPOStatusId"
            FROM "PRPO"."PRPOApproval"
            WHERE
                "PRPOHeaderId" = $1
                AND "IsCurrent" = true
                AND "IsDisabled" = false
            FOR UPDATE
        `;

        const approvalResult = await client.query(
            approvalQuery,
            [PRPOHeaderId]
        );

        if (approvalResult.rows.length === 0) {

            const error = new Error(
                "No current approver found for this PRPO."
            );

            error.statusCode = 400;
            throw error;
        }

        const currentApproval = approvalResult.rows[0];


        // ==========================================
        // 3. VALIDATE LOGGED-IN APPROVER
        // ==========================================

        if (
            Number(currentApproval.ApproverUserId) !==
            Number(ActionByUserId)
        ) {

            const error = new Error(
                "You are not authorized to perform this PRPO action."
            );

            error.statusCode = 403;
            throw error;
        }


        // ==========================================
        // 4. VALIDATE ACTION
        // ==========================================

        if (![3, 4, 5].includes(PRPOStatusId)) {

            const error = new Error("Invalid PRPO status.");

            error.statusCode = 400;
            throw error;
        }

        if (![2, 3].includes(FromPRPOStatusId)) {

            const error = new Error(
                "This PRPO is already approved or rejected."
            );

            error.statusCode = 400;
            throw error;
        }

        if (![2, 3].includes(currentApproval.PRPOStatusId)) {

            const error = new Error(
                "Current approval is already completed."
            );

            error.statusCode = 400;
            throw error;
        }

        // Forward requires a different next approver.
        if (
            PRPOStatusId === 3 &&
            (
                !ActionForUserId ||
                Number(ActionForUserId) === Number(ActionByUserId)
            )
        ) {

            const error = new Error(
                "A valid next approver is required for forwarding."
            );

            error.statusCode = 400;
            throw error;
        }


        // ==========================================
        // 5. UPDATE CURRENT APPROVAL RECORD
        // ==========================================

        const updateApprovalQuery = `
            UPDATE "PRPO"."PRPOApproval"
            SET
                "PRPOStatusId" = $1,
                "ForwardedToUserId" = $2,
                "IsCurrent" = false
            WHERE
                "PRPOApprovalId" = $3
            RETURNING "PRPOApprovalId"
        `;

        await client.query(
            updateApprovalQuery,
            [
                PRPOStatusId,
                PRPOStatusId === 3
                    ? ActionForUserId
                    : null,
                currentApproval.PRPOApprovalId
            ]
        );


        // ==========================================
        // 6. IF FORWARDED, CREATE NEXT APPROVAL
        // ==========================================

        let newApprovalId = null;

        if (PRPOStatusId === 3) {

            const nextApprovalQuery = `
                INSERT INTO "PRPO"."PRPOApproval"
                (
                    "PRPOHeaderId",
                    "ApprovalLevel",
                    "AssignmentRound",
                    "ApproverUserId",
                    "ForwardedToUserId",
                    "PRPOStatusId",
                    "AssignedAt",
                    "IsCurrent",
                    "IsDisabled"
                )
                VALUES
                (
                    $1, $2, $3, $4, NULL, 2,
                    CURRENT_TIMESTAMP, true, false
                )
                RETURNING "PRPOApprovalId"
            `;

            const nextApprovalResult = await client.query(
                nextApprovalQuery,
                [
                    PRPOHeaderId,

                    Number(currentApproval.ApprovalLevel) + 1,

                    currentApproval.AssignmentRound,

                    ActionForUserId
                ]
            );

            newApprovalId =
                nextApprovalResult.rows[0].PRPOApprovalId;
        }


        // ==========================================
        // 7. UPDATE PRPO HEADER STATUS
        // ==========================================

        const updateHeaderQuery = `
            UPDATE "PRPO"."PRPOHeader"
            SET
                "PRPOStatusId" = $1
            WHERE
                "PRPOHeaderId" = $2
            RETURNING
                "PRPOHeaderId",
                "PRPOHeaderNumber",
                "PRPOStatusId"
        `;

        const updateHeaderResult = await client.query(
            updateHeaderQuery,
            [
                PRPOStatusId,
                PRPOHeaderId
            ]
        );


        // ==========================================
        // 8. INSERT PRPO STATUS HISTORY
        // ==========================================

        const historyQuery = `
            INSERT INTO "PRPO"."PRPOStatusHistory"
            (
                "PRPOHeaderId",
                "FromPRPOStatusId",
                "ToPRPOStatusId",
                "ActionByUserId",
                "ActionForUserId",
                "ActionAt",
                "Comments",
                "IsDisabled"
            )
            VALUES
            (
                $1, $2, $3, $4, $5,
                CURRENT_TIMESTAMP, $6, false
            )
            RETURNING "PRPOStatusHistoryId"
        `;

        const historyResult = await client.query(
            historyQuery,
            [
                PRPOHeaderId,

                FromPRPOStatusId,

                PRPOStatusId,

                ActionByUserId,

                PRPOStatusId === 3
                    ? ActionForUserId
                    : ActionByUserId,

                Comments
            ]
        );


        // ==========================================
        // 9. COMMIT TRANSACTION
        // ==========================================

        await client.query("COMMIT");


        const messages = {
            3: "PRPO forwarded successfully.",
            4: "PRPO approved successfully.",
            5: "PRPO rejected successfully."
        };

        return {

            message: messages[PRPOStatusId],

            data: {

                ...updateHeaderResult.rows[0],

                ActionByUserId,

                ActionForUserId:
                    PRPOStatusId === 3
                        ? ActionForUserId
                        : ActionByUserId,

                PRPOApprovalId:
                    currentApproval.PRPOApprovalId,

                NewPRPOApprovalId: newApprovalId,

                PRPOStatusHistoryId:
                    historyResult.rows[0].PRPOStatusHistoryId

            }

        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

};


