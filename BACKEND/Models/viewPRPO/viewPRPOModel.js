
import { pool } from "../../Config/db.js";


export const getAllPRPOHeaders = async (UserId) => {

    try {

        const query = `
            SELECT

                PH."PRPOHeaderId",

                PH."PRPOHeaderNumber",

                PH."ProjectId",
                P."ProjectName",

                PH."PriorityId",
                PR."PriorityName",

                PH."RequiredDate",

                PH."CreatedByUserId" AS "RequestedId",

                CONCAT_WS(
                    ' ',
                    U."FirstName",
                    U."LastName"
                ) AS "RequestedBy",

                PH."PRPOStatusId",
                PS."PRPOStatusName",

                PH."ReportingToUserId",

                CONCAT_WS(
                    ' ',
                    RT."FirstName",
                    RT."LastName"
                ) AS "ReportingToUserName"

            FROM "PRPO"."PRPOHeader" PH

            LEFT JOIN "LKP"."Project" P
                ON PH."ProjectId" = P."ProjectId"

            LEFT JOIN "LKP"."Priority" PR
                ON PH."PriorityId" = PR."PriorityId"

            INNER JOIN "LKP"."PRPOStatus" PS
                ON PH."PRPOStatusId" = PS."PRPOStatusId"

            INNER JOIN "DATA"."User" U
                ON PH."CreatedByUserId" = U."UserId"

            LEFT JOIN "DATA"."User" RT
                ON PH."ReportingToUserId" = RT."UserId"

            WHERE
                PH."CreatedByUserId" = $1
                AND PH."IsDisabled" = false

            ORDER BY PH."PRPOHeaderId" DESC
        `;

        const result = await pool.query(query, [UserId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};



// GET COMPLETE PRPO DETAILS BY PRPOHeaderId

export const getPRPODetailsById = async (PRPOHeaderId) => {

    try {

        const query = `
            SELECT

                H."PRPOHeaderId",

                -- 1. MATERIAL INFORMATION

                (
                    SELECT COALESCE(
                        JSONB_AGG(
                            JSONB_BUILD_OBJECT(

                                'PRPOMaterialId', PM."PRPOMaterialId",

                                'MaterialId', M."MaterialId",

                                'MaterialName', M."MaterialName",

                                'MaterialCode', M."MaterialCode",

                                'MaterialBrandName', M."MaterialBrandName",

                                'ModelNo', M."ModelNo",

                                'Quantity', PM."Quantity",

                                'MaterialDescription', PM."MaterialDescription",

                                'DescriptionSpecification', M."DescriptionSpecification"

                            )
                            ORDER BY PM."LineNumber"
                        ),
                        '[]'::JSONB
                    )

                    FROM "PRPO"."PRPOMaterial" PM

                    INNER JOIN "DATA"."Material" M
                        ON M."MaterialId" = PM."MaterialId"

                    WHERE
                        PM."PRPOHeaderId" = H."PRPOHeaderId"
                        AND PM."IsDisabled" = false

                ) AS "Materials",


                -- 2. ATTACHED FILES

                (
                    SELECT COALESCE(
                        JSONB_AGG(
                            JSONB_BUILD_OBJECT(

                                'PRPOAttachedFileId', AF."PRPOAttachedFileId",

                                'FileTypeId', AF."FileTypeId",

                                'FileName', AF."FileName",

                                'CreatedByUserId', AF."CreatedByUserId",

                                'CreatedAt', AF."CreatedAt"

                            )
                            ORDER BY AF."PRPOAttachedFileId"
                        ),
                        '[]'::JSONB
                    )

                    FROM "PRPO"."PRPOAttachedFile" AF

                    WHERE
                        AF."PRPOHeaderId" = H."PRPOHeaderId"
                        AND AF."IsDisabled" = false

                ) AS "AttachedFiles",


                -- 3. COMPLETE STATUS HISTORY

                (
                    SELECT COALESCE(
                        JSONB_AGG(
                            JSONB_BUILD_OBJECT(

                                'PRPOStatusHistoryId', SH."PRPOStatusHistoryId",

                                'FromPRPOStatusId', SH."FromPRPOStatusId",

                                'FromStatusName', FS."PRPOStatusName",

                                'ToPRPOStatusId', SH."ToPRPOStatusId",

                                'ToStatusName', TS."PRPOStatusName",

                                'ActionByUserId', SH."ActionByUserId",

                                'ActionByUserName',
                                    CONCAT_WS(
                                        ' ',
                                        AB."FirstName",
                                        AB."MiddleName",
                                        AB."LastName"
                                    ),

                                'ActionForUserId', SH."ActionForUserId",

                                'ActionForUserName',
                                    CONCAT_WS(
                                        ' ',
                                        AFU."FirstName",
                                        AFU."MiddleName",
                                        AFU."LastName"
                                    ),

                                'ActionAt', SH."ActionAt",

                                'Comments', SH."Comments"

                            )
                            ORDER BY
                                SH."ActionAt",
                                SH."PRPOStatusHistoryId"
                        ),
                        '[]'::JSONB
                    )

                    FROM "PRPO"."PRPOStatusHistory" SH

                    LEFT JOIN "LKP"."PRPOStatus" FS
                        ON FS."PRPOStatusId" = SH."FromPRPOStatusId"

                    LEFT JOIN "LKP"."PRPOStatus" TS
                        ON TS."PRPOStatusId" = SH."ToPRPOStatusId"

                    LEFT JOIN "DATA"."User" AB
                        ON AB."UserId" = SH."ActionByUserId"

                    LEFT JOIN "DATA"."User" AFU
                        ON AFU."UserId" = SH."ActionForUserId"

                    WHERE
                        SH."PRPOHeaderId" = H."PRPOHeaderId"
                        AND SH."IsDisabled" = false

                ) AS "StatusHistory"


            FROM "PRPO"."PRPOHeader" H

            WHERE
                H."PRPOHeaderId" = $1
                AND H."IsDisabled" = false
        `;

        const result = await pool.query(query, [PRPOHeaderId]);

        return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {

        throw error;
    }
};