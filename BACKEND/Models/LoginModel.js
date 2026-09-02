import { pool } from "../Config/db.js";


// ==========================================================
// FIND USER FOR LOGIN
// ==========================================================

export const findUserForLogin = async (username) => {

    // ==========================================================
    // 1. GET LOGIN FIELDS DYNAMICALLY
    // ==========================================================

    const loginFieldsResult = await pool.query(`
        SELECT
            "LoginFieldName"
        FROM "DATA"."LoginField"
        WHERE
            "IsDisabled" = FALSE
            AND "LoginFieldName" IS NOT NULL
            AND TRIM("LoginFieldName") <> ''
    `);

    const loginFields = loginFieldsResult.rows;

    if (loginFields.length === 0) {
        return null;
    }


    // ==========================================================
    // CREATE DYNAMIC LOGIN CONDITION
    // ==========================================================

    const loginConditions = loginFields
        .map(field => {

            const fieldName =
                String(field.LoginFieldName).trim();

            return `
                LOWER(
                    TRIM(
                        CAST(u."${fieldName}" AS TEXT)
                    )
                )
                =
                LOWER(
                    TRIM($1)
                )
            `;

        })
        .join(" OR ");


    // ==========================================================
    // 2. FIND USER
    // ==========================================================

    const userQuery = `
        SELECT

            u."UserId",
            u."EmployeeId",

            u."FirstName",
            u."MiddleName",
            u."LastName",

            u."PhoneNumber",
            u."Email",

            u."Password",
            u."LoginName",

            u."Photo",

            u."DesignationId",

            u."IsForcePasswordChange",
            u."IsDisabled",

            u."AttemptCount",
            u."IsTempBlocked",
            u."TempBlockedOn",

            u."IsBlocked",
            u."BlockedOn",

            u."CreatedAt",
            u."UpdatedAt",

            d."CompanyDesignationId",
            d."DesignationCode",
            d."DesignationName",
            d."DesignationLevel",

            d."CompanyId" AS "DesignationCompanyId"

        FROM "DATA"."User" u

        LEFT JOIN "LKP"."CompanyDesignation" d
            ON d."CompanyDesignationId" =
               u."DesignationId"

        WHERE

            (
                ${loginConditions}
            )

            AND u."IsDisabled" = FALSE

        LIMIT 1
    `;


    const userResult = await pool.query(
        userQuery,
        [username]
    );


    if (userResult.rows.length === 0) {
        return null;
    }


    const user = userResult.rows[0];


    // ==========================================================
    // 3. COMPANY
    // ==========================================================

    const companyQuery = `
    SELECT
        uc."CompanyId",
        c."CompanyName"
    FROM "DATA"."UserCompany" uc
    LEFT JOIN "LKP"."Company" c
        ON c."CompanyId" = uc."CompanyId"
    WHERE
        uc."UserId" = $1
    ORDER BY uc."CompanyId"
`;

const companyResult = await pool.query(companyQuery, [user.UserId]);

    // ==========================================================
    // 4. PRODUCT
    // ==========================================================

    const productQuery = `
        SELECT DISTINCT

            up."CompanyProductId",

            cp."CompanyId",

            cp."ProductId",

            p."ProductName"

        FROM "DATA"."UserProduct" up

        INNER JOIN "LKP"."CompanyProduct" cp
            ON cp."CompanyProductId" =
               up."CompanyProductId"

        INNER JOIN "LKP"."Product" p
            ON p."ProductId" =
               cp."ProductId"

        WHERE

            up."UserId" = $1

            AND p."IsDisabled" = FALSE

        ORDER BY
            cp."CompanyId",
            up."CompanyProductId"
    `;


    const productResult =
        await pool.query(
            productQuery,
            [user.UserId]
        );


    // ==========================================================
    // 5. PROJECT
    // ==========================================================

    const projectQuery = `
        SELECT DISTINCT

            upj."ProjectId",

            pr."ProjectName",

            pr."CompanyProductId"

        FROM "DATA"."UserProject" upj

        INNER JOIN "LKP"."Project" pr
            ON pr."ProjectId" =
               upj."ProjectId"

        WHERE

            upj."UserId" = $1

            AND pr."IsDisabled" = FALSE

        ORDER BY
            upj."ProjectId"
    `;


    const projectResult =
        await pool.query(
            projectQuery,
            [user.UserId]
        );


    // ==========================================================
    // 6. ROLE
    // ==========================================================

    const roleQuery = `
        SELECT DISTINCT

            ur."RoleId",

            r."RoleName"

        FROM "DATA"."UserRole" ur

        INNER JOIN "LKP"."Role" r
            ON r."RoleId" =
               ur."RoleId"

        WHERE

            ur."UserId" = $1

            AND r."IsDisabled" = FALSE

        ORDER BY
            ur."RoleId"
    `;


    const roleResult =
        await pool.query(
            roleQuery,
            [user.UserId]
        );


    // ==========================================================
    // 7. REPORTING MANAGER
    // ==========================================================

    const reportingManagerQuery = `
        SELECT

            urm."UserReportingManagerId",

            urm."UserId",

            urm."ReportingManagerUserId",

            manager."EmployeeId"
                AS "ReportingManagerEmployeeId",

            CONCAT_WS(
                ' ',
                manager."FirstName",
                manager."MiddleName",
                manager."LastName"
            )
                AS "ReportingManagerName",

            manager."Email"
                AS "ReportingManagerEmail",

            manager."PhoneNumber"
                AS "ReportingManagerPhoneNumber",

            manager."DesignationId"
                AS "ReportingManagerDesignationId",

            d."DesignationCode"
                AS "ReportingManagerDesignationCode",

            d."DesignationName"
                AS "ReportingManagerDesignationName",

            d."DesignationLevel"
                AS "ReportingManagerDesignationLevel"

        FROM "DATA"."UserReportingManager" urm

        INNER JOIN "DATA"."User" manager
            ON manager."UserId" =
               urm."ReportingManagerUserId"

        LEFT JOIN "LKP"."CompanyDesignation" d
            ON d."CompanyDesignationId" =
               manager."DesignationId"

        WHERE

            urm."UserId" = $1

            AND manager."IsDisabled" = FALSE

            AND manager."IsBlocked" = FALSE

        ORDER BY
            d."DesignationLevel" ASC
    `;


    const reportingManagerResult =
        await pool.query(
            reportingManagerQuery,
            [user.UserId]
        );


    // ==========================================================
    // RETURN EVERYTHING
    // ==========================================================

    return {

        user: user,

        companies:
            companyResult.rows,

        products:
            productResult.rows,

        projects:
            projectResult.rows,

        roles:
            roleResult.rows,

        reportingManager:
            reportingManagerResult.rows

    };

};


// ==========================================================
// FAILED LOGIN ATTEMPT
// ==========================================================

export const updateFailedLogin = async (userId) => {

    const query = `
        UPDATE "DATA"."User"

        SET
            "AttemptCount" =
                COALESCE("AttemptCount", 0) + 1

        WHERE
            "UserId" = $1

        RETURNING
            "AttemptCount"
    `;


    const result =
        await pool.query(
            query,
            [userId]
        );


    return result.rows[0]?.AttemptCount || 0;

};


// ==========================================================
// TEMP BLOCK
// ==========================================================

export const setTempBlock = async (userId) => {

    const query = `
        UPDATE "DATA"."User"

        SET

            "IsTempBlocked" = TRUE,

            "TempBlockedOn" =
                CURRENT_TIMESTAMP

        WHERE
            "UserId" = $1

        RETURNING

            "UserId",
            "IsTempBlocked",
            "TempBlockedOn"
    `;


    const result =
        await pool.query(
            query,
            [userId]
        );


    return result.rows[0] || null;

};


// ==========================================================
// CLEAR TEMP BLOCK
// ==========================================================

export const clearTempBlock = async (userId) => {

    const query = `
        UPDATE "DATA"."User"

        SET

            "IsTempBlocked" = FALSE,

            "TempBlockedOn" = NULL

        WHERE
            "UserId" = $1

        RETURNING

            "UserId",
            "IsTempBlocked",
            "TempBlockedOn"
    `;


    const result =
        await pool.query(
            query,
            [userId]
        );


    return result.rows[0] || null;

};


// ==========================================================
// RESET ATTEMPTS
// ==========================================================

export const resetAttempts = async (userId) => {

    const query = `
        UPDATE "DATA"."User"

        SET

            "AttemptCount" = 0,

            "IsTempBlocked" = FALSE,

            "TempBlockedOn" = NULL

        WHERE
            "UserId" = $1

        RETURNING

            "UserId",
            "AttemptCount",
            "IsTempBlocked"
    `;


    const result =
        await pool.query(
            query,
            [userId]
        );


    return result.rows[0] || null;

};


// ==========================================================
// PERMANENT BLOCK
// ==========================================================

export const setPermanentBlock = async (userId) => {

    const query = `
        UPDATE "DATA"."User"

        SET

            "IsBlocked" = TRUE,

            "BlockedOn" =
                CURRENT_TIMESTAMP

        WHERE
            "UserId" = $1

        RETURNING

            "UserId",
            "IsBlocked",
            "BlockedOn"
    `;


    const result =
        await pool.query(
            query,
            [userId]
        );


    return result.rows[0] || null;

};