import { pool } from "../Config/db.js";

// GET MAIL STATUS IDs


export const getMailStatusIds = async () => {

    const query = `
        SELECT
            "MailStatusId",
            "StatusCode",
            "StatusName"
        FROM "LKP"."MailStatus"
        WHERE "IsDisabled" = false
          AND "StatusCode" IN (
              'PENDING',
              'SENT',
              'FAILED',
              'RETRY'
          )
        ORDER BY "MailStatusId";
    `;

    const result = await pool.query(query);

    return result.rows;
};


// GET TODAY'S BIRTHDAY USERS

export const getTodaysBirthdayUsers = async () => {

    const query = `
        SELECT
            u."UserId",
            u."EmployeeId",
            u."FirstName",
            u."MiddleName",
            u."LastName",
            u."DateOfBirth",
            u."DateOfJoining",
            u."Email",

            CASE
                WHEN u."DateOfJoining" IS NOT NULL
                THEN EXTRACT(
                    YEAR FROM AGE(
                        CURRENT_DATE,
                        u."DateOfJoining"
                    )
                )::INTEGER
                ELSE NULL
            END AS "YearsServed",

            b."BirthdayMailLogId",
            b."MailSentAt",
            b."MailStatusId",
            b."RecipientEmail",
            b."Subject",
            b."ErrorMessage",
            b."LogCreatedAt",
            b."LogUpdatedAt"

        FROM "DATA"."User" u

        LEFT JOIN LATERAL
        (
            SELECT
                bl."BirthdayMailLogId",
                bl."MailSentAt",
                bl."MailStatusId",
                bl."RecipientEmail",
                bl."Subject",
                bl."ErrorMessage",
                bl."CreatedAt" AS "LogCreatedAt",
                bl."UpdatedAt" AS "LogUpdatedAt"

            FROM "DATA"."BirthdayMailLog" bl

            WHERE bl."UserId" = u."UserId"
              AND bl."BirthdayDate" = CURRENT_DATE

            ORDER BY
                bl."CreatedAt" DESC,
                bl."BirthdayMailLogId" DESC

            LIMIT 1

        ) b ON true

        WHERE
            u."DateOfBirth" IS NOT NULL

            AND EXTRACT(
                MONTH FROM u."DateOfBirth"
            ) = EXTRACT(
                MONTH FROM CURRENT_DATE
            )

            AND EXTRACT(
                DAY FROM u."DateOfBirth"
            ) = EXTRACT(
                DAY FROM CURRENT_DATE
            )

            AND u."IsDisabled" = false

            AND u."IsBlocked" = false

            AND u."IsTempBlocked" = false

        ORDER BY
            u."UserId";
    `;

    const result = await pool.query(query);

    return result.rows;
};


// CREATE BIRTHDAY MAIL LOG

export const createBirthdayMailLog = async ({
    UserId,
    BirthdayDate,
    MailStatusId,
    RecipientEmail,
    Subject,
    ErrorMessage = null
}) => {

    const query = `
        INSERT INTO "DATA"."BirthdayMailLog"
        (
            "UserId",
            "BirthdayDate",
            "MailSentAt",
            "MailStatusId",
            "RecipientEmail",
            "Subject",
            "ErrorMessage",
            "CreatedAt",
            "UpdatedAt"
        )
        VALUES
        (
            $1,
            $2,
            NULL,
            $3,
            $4,
            $5,
            $6,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING
            "BirthdayMailLogId",
            "UserId",
            "BirthdayDate",
            "MailSentAt",
            "MailStatusId",
            "RecipientEmail",
            "Subject",
            "ErrorMessage",
            "CreatedAt",
            "UpdatedAt";
    `;

    const values = [
        UserId,
        BirthdayDate,
        MailStatusId,
        RecipientEmail,
        Subject,
        ErrorMessage
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0];
};


// UPDATE BIRTHDAY MAIL LOG - BEFORE SENDING

export const updateBirthdayMailLogBeforeSending = async ({
    BirthdayMailLogId,
    MailStatusId,
    RecipientEmail,
    Subject
}) => {

    const query = `
        UPDATE "DATA"."BirthdayMailLog"

        SET
            "MailSentAt" = NULL,
            "MailStatusId" = $1,
            "RecipientEmail" = $2,
            "Subject" = $3,
            "ErrorMessage" = NULL,
            "UpdatedAt" = CURRENT_TIMESTAMP

        WHERE
            "BirthdayMailLogId" = $4

        RETURNING
            "BirthdayMailLogId",
            "UserId",
            "BirthdayDate",
            "MailSentAt",
            "MailStatusId",
            "RecipientEmail",
            "Subject",
            "ErrorMessage",
            "CreatedAt",
            "UpdatedAt";
    `;

    const values = [
        MailStatusId,
        RecipientEmail,
        Subject,
        BirthdayMailLogId
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0] || null;
};


// UPDATE BIRTHDAY MAIL LOG - SUCCESS

export const updateBirthdayMailLogSuccess = async ({
    BirthdayMailLogId,
    MailStatusId,
    RecipientEmail,
    Subject
}) => {

    const query = `
        UPDATE "DATA"."BirthdayMailLog"

        SET
            "MailSentAt" = CURRENT_TIMESTAMP,
            "MailStatusId" = $1,
            "RecipientEmail" = $2,
            "Subject" = $3,
            "ErrorMessage" = NULL,
            "UpdatedAt" = CURRENT_TIMESTAMP

        WHERE
            "BirthdayMailLogId" = $4

        RETURNING
            "BirthdayMailLogId",
            "UserId",
            "BirthdayDate",
            "MailSentAt",
            "MailStatusId",
            "RecipientEmail",
            "Subject",
            "ErrorMessage",
            "CreatedAt",
            "UpdatedAt";
    `;

    const values = [
        MailStatusId,
        RecipientEmail,
        Subject,
        BirthdayMailLogId
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0] || null;
};


// UPDATE BIRTHDAY MAIL LOG - FAILED

export const updateBirthdayMailLogFailed = async ({
    BirthdayMailLogId,
    MailStatusId,
    RecipientEmail,
    Subject,
    ErrorMessage
}) => {

    const query = `
        UPDATE "DATA"."BirthdayMailLog"

        SET
            "MailSentAt" = NULL,
            "MailStatusId" = $1,
            "RecipientEmail" = $2,
            "Subject" = $3,
            "ErrorMessage" = $4,
            "UpdatedAt" = CURRENT_TIMESTAMP

        WHERE
            "BirthdayMailLogId" = $5

        RETURNING
            "BirthdayMailLogId",
            "UserId",
            "BirthdayDate",
            "MailSentAt",
            "MailStatusId",
            "RecipientEmail",
            "Subject",
            "ErrorMessage",
            "CreatedAt",
            "UpdatedAt";
    `;

    const values = [
        MailStatusId,
        RecipientEmail,
        Subject,
        ErrorMessage,
        BirthdayMailLogId
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows[0] || null;
};


// GET ALL BIRTHDAY MAIL LOGS

export const getBirthdayMailLogs = async () => {

    const query = `
        SELECT
            bl."BirthdayMailLogId",
            bl."UserId",
            bl."BirthdayDate",
            bl."MailSentAt",
            bl."MailStatusId",

            ms."StatusCode",
            ms."StatusName",

            bl."RecipientEmail",
            bl."Subject",
            bl."ErrorMessage",
            bl."CreatedAt",
            bl."UpdatedAt",

            u."EmployeeId",
            u."FirstName",
            u."MiddleName",
            u."LastName"

        FROM "DATA"."BirthdayMailLog" bl

        INNER JOIN "LKP"."MailStatus" ms
            ON ms."MailStatusId" = bl."MailStatusId"

        INNER JOIN "DATA"."User" u
            ON u."UserId" = bl."UserId"

        ORDER BY
            bl."CreatedAt" DESC,
            bl."BirthdayMailLogId" DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};


// GET SINGLE BIRTHDAY MAIL LOG

export const getBirthdayMailLogById = async (BirthdayMailLogId) => {

    const query = `
        SELECT
            bl."BirthdayMailLogId",
            bl."UserId",
            bl."BirthdayDate",
            bl."MailSentAt",
            bl."MailStatusId",

            ms."StatusCode",
            ms."StatusName",

            bl."RecipientEmail",
            bl."Subject",
            bl."ErrorMessage",
            bl."CreatedAt",
            bl."UpdatedAt",

            u."EmployeeId",
            u."FirstName",
            u."MiddleName",
            u."LastName",
            u."Email",
            u."DateOfBirth",
            u."DateOfJoining"

        FROM "DATA"."BirthdayMailLog" bl

        INNER JOIN "LKP"."MailStatus" ms
            ON ms."MailStatusId" = bl."MailStatusId"

        INNER JOIN "DATA"."User" u
            ON u."UserId" = bl."UserId"

        WHERE
            bl."BirthdayMailLogId" = $1;
    `;

    const result = await pool.query(
        query,
        [BirthdayMailLogId]
    );

    return result.rows[0] || null;
};