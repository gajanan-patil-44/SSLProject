import { pool } from "../Config/db.js";


// ==========================================================
// USER DROPDOWNS
// ==========================================================
// ==========================================================
// FLAG ID 1 - GET GENDER
// ==========================================================

export const getGenderDropdown = async () => {

    const query = `
        SELECT
            "GenderId",
            "GenderName"
        FROM "LKP"."Gender"
        WHERE "IsDisabled" = false
        ORDER BY "GenderName";
    `;
    const result = await pool.query(query);
    return result.rows;
};


// ==========================================================
// FLAG ID 2 - GET MARITAL STATUS
// ==========================================================

export const getMaritalStatusDropdown = async () => {

    const query = `
        SELECT
            "MaritalStatusId",
            "MaritalStatusName"
        FROM "LKP"."MaritalStatus"
        WHERE "IsDisabled" = false
        ORDER BY "MaritalStatusName";
    `;
    const result = await pool.query(query);
    return result.rows;
};


// ==========================================================
// FLAG ID 3 - GET DESIGNATION
// ==========================================================

export const getDesignationDropdown = async () => {
    const query = `
        SELECT
            "CompanyDesignationId",
            "DesignationName"
        FROM "LKP"."CompanyDesignation"
        WHERE "IsDisabled" = false
        ORDER BY "DesignationName";
    `;
    const result = await pool.query(query);
    return result.rows;
};

// =====================================================
// GET USER REPORTING MANAGER DROPDOWN
// =====================================================


export const getUserReportingManagerDropdown = async (CompanyId, DesignationId) => {
    const query = `
        SELECT
            u."UserId",
            u."EmployeeId",
            CONCAT_WS(
                ' ',
                u."FirstName",
                u."MiddleName",
                u."LastName"
            ) AS "ReportingManagerName",
            u."DesignationId",
            managerDesignation."DesignationName",
            managerDesignation."DesignationLevel"

        FROM "DATA"."User" u

        INNER JOIN "LKP"."CompanyDesignation" managerDesignation
            ON managerDesignation."CompanyDesignationId" = u."DesignationId"

        WHERE
            -- Manager's designation belongs to selected company
            managerDesignation."CompanyId" = $1

            -- Manager's designation is active
            AND managerDesignation."IsDisabled" = false

            -- Manager is allowed to be a reporting manager
            AND managerDesignation."CanBeReportingManager" = true

            -- Manager must be higher than selected user's designation
            AND managerDesignation."DesignationLevel" > (
                SELECT
                    selectedDesignation."DesignationLevel"

                FROM "LKP"."CompanyDesignation" selectedDesignation

                WHERE
                    selectedDesignation."CompanyDesignationId" = $2
                    AND selectedDesignation."CompanyId" = $1
                    AND selectedDesignation."IsDisabled" = false
            )

            -- Existing user must be active
            AND u."IsDisabled" = false
            AND u."IsBlocked" = false

        ORDER BY
            managerDesignation."DesignationLevel" ASC,
            "ReportingManagerName" ASC;
    `;

    const result = await pool.query(query, [CompanyId, DesignationId]);
    return result.rows;
};
// ==========================================================
// VALIDATE GENDER
// ==========================================================
export const checkGenderExists = async (GenderId) => {
    const query = `
        SELECT
            "GenderId",
            "GenderName"
        FROM "LKP"."Gender"
        WHERE "GenderId" = $1
        AND "IsDisabled" = false;
    `;
    const result = await pool.query(query, [GenderId]);
    return result.rows;
};

// ==========================================================
// VALIDATE MARITAL STATUS
// ==========================================================

export const checkMaritalStatusExists = async (MaritalStatusId) => {
    const query = `
        SELECT
            "MaritalStatusId",
            "MaritalStatusName"
        FROM "LKP"."MaritalStatus"
        WHERE "MaritalStatusId" = $1
        AND "IsDisabled" = false;
    `;
    const result = await pool.query(query, [MaritalStatusId]);
    return result.rows;
};

// ==========================================================
// VALIDATE DESIGNATION
// ==========================================================

export const checkDesignationExists = async (DesignationId) => {
    const query = `
        SELECT
            "CompanyDesignationId",
            "DesignationName"
        FROM "LKP"."CompanyDesignation"
        WHERE "CompanyDesignationId" = $1
        AND "IsDisabled" = false;
    `;

    const result = await pool.query(query, [DesignationId]);
    return result.rows;
};

// ==========================================================
// CHECK LOGIN NAME
// ==========================================================

export const checkLoginNameExists = async (LoginName) => {
    const query = `
        SELECT
            "UserId",
            "LoginName"
        FROM "DATA"."User"
        WHERE "LoginName" = $1;
    `;
    const result = await pool.query(query, [LoginName]);
    return result.rows;
};

// ==========================================================
// CHECK EMAIL
// ==========================================================

export const checkEmailExists = async (Email) => {
    const query = `
        SELECT
            "UserId",
            "Email"
        FROM "DATA"."User"
        WHERE "Email" = $1;
    `;
    const result = await pool.query(query, [Email]);
    return result.rows;
};

// ==========================================================
// CHECK PHONE NUMBER
// ==========================================================

export const checkPhoneNumberExists = async (PhoneNumber) => {
    const query = `
        SELECT
            "UserId",
            "PhoneNumber"
        FROM "DATA"."User"
        WHERE "PhoneNumber" = $1;
    `;
    const result = await pool.query(query, [PhoneNumber]);
    return result.rows;
};
// ==========================================================
// CHECK EMPLOYEE ID
// ==========================================================

export const checkEmployeeIdExists = async (EmployeeId) => {
    const query = `
        SELECT
            "UserId",
            "EmployeeId"
        FROM "DATA"."User"
        WHERE "EmployeeId" = $1;
    `;
    const result = await pool.query(query, [EmployeeId]);
    return result.rows;
};
// ==========================================================
// CREATE USER + USER COMPANY + USER PRODUCT
// + USER PROJECT + USER ROLE + USER FILE
// ==========================================================
export const createUser = async (userData) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==================================================
        // 1. CREATE USER
        // ==================================================

        const userQuery = `
            INSERT INTO "DATA"."User"
            (
                "EmployeeId",
                "FirstName",
                "MiddleName",
                "LastName",
                "PhoneNumber",
                "AltPhoneNumber",
                "DateOfBirth",
                "GenderId",
                "MaritalStatusId",
                "DesignationId",
                "Email",
                "Password",
                "LoginName",
                "Photo",
                "CreatedAt",
                "CreatedByUserName",
                "DateOfJoining"
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14,
                CURRENT_TIMESTAMP,
                $15,
                $16
            )
            RETURNING
                "UserId",
                "EmployeeId",
                "FirstName",
                "MiddleName",
                "LastName",
                "PhoneNumber",
                "AltPhoneNumber",
                "DateOfBirth",
                "GenderId",
                "MaritalStatusId",
                "DesignationId",
                "Email",
                "LoginName",
                "CreatedAt",
                "CreatedByUserName",
                "DateOfJoining";
        `;
        const userValues = [
            userData.EmployeeId,
            userData.FirstName,
            userData.MiddleName || null,
            userData.LastName || null,
            userData.PhoneNumber,
            userData.AltPhoneNumber || null,
            userData.DateOfBirth,
            userData.GenderId,
            userData.MaritalStatusId,
            userData.DesignationId,
            userData.Email,
            userData.Password,
            userData.LoginName,
            userData.Photo || null,
            userData.CreatedByUserName,
            userData.DateOfJoining
        ];
        const userResult = await client.query(userQuery,userValues);

        const user = userResult.rows[0];
        if (!user) {
            throw new Error("User creation failed");
        }
        const UserId = user.UserId;
        // ==================================================
        // VARIABLES FOR GENERATED IDs
        // ==================================================
        let userReportingManagerId = null;
        let userCompanyId = null;
        let userProductId = null;
        let userProjectId = null;
        let userRoleId = null;
        // ==================================================
        // 2. CREATE USER REPORTING MANAGER
        // ==================================================

        if (
            userData.ReportingManagerUserId !== null &&
            userData.ReportingManagerUserId !== undefined
        ) {

            const reportingManagerQuery = `
                INSERT INTO "DATA"."UserReportingManager"
                (
                    "UserId",
                    "ReportingManagerUserId",
                    "CompanyId",
                    "CreatedAt",
                    "CreatedByUserId"
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    CURRENT_TIMESTAMP,
                    $4
                )
                RETURNING
                    "UserReportingManagerId";
            `;

            const reportingManagerResult =
                await client.query(
                    reportingManagerQuery,
                    [
                        UserId,
                        Number( userData.ReportingManagerUserId),
                        Number( userData.CompanyId),
                        UserId
                    ]
                );

            userReportingManagerId = reportingManagerResult.rows[0].UserReportingManagerId;
        }


        // ==================================================
        // 3. CREATE USER COMPANY
        // ==================================================

        const userCompanyQuery = `
            INSERT INTO "DATA"."UserCompany"
            (
                "UserId",
                "CompanyId",
                "IsPrimaryCompany",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserId"
            )
            VALUES
            (
                $1,
                $2,
                true,
                false,
                CURRENT_TIMESTAMP,
                $3
            )
            RETURNING
                "UserCompanyId";
        `;

        const userCompanyResult =
            await client.query(
                userCompanyQuery,
                [
                    UserId,
                    Number(userData.CompanyId),
                    UserId
                ]
            );

        userCompanyId = userCompanyResult.rows[0].UserCompanyId;


        // ==================================================
        // 4. CREATE USER PRODUCT
        // ==================================================

        const userProductQuery = `
            INSERT INTO "DATA"."UserProduct"
            (
                "UserId",
                "CompanyProductId",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserId"
            )
            VALUES
            (
                $1,
                $2,
                false,
                CURRENT_TIMESTAMP,
                $3
            )
            RETURNING
                "UserProductId";
        `;

        const userProductResult = await client.query(userProductQuery,[UserId,Number(userData.CompanyProductId),UserId]);
        userProductId =userProductResult.rows[0].UserProductId;
        // ==================================================
        // 5. CREATE USER PROJECT
        // ==================================================
        const userProjectQuery = `
            INSERT INTO "DATA"."UserProject"
            (
                "UserId",
                "ProjectId",
                "IsPrimary",
                "IsDisabled",
                "CreatedAt",
                "CreatedByUserId"
            )
            VALUES
            (
                $1,
                $2,
                true,
                false,
                CURRENT_TIMESTAMP,
                $3
            )
            RETURNING
                "UserProjectId";
        `;
        const userProjectResult = await client.query(userProjectQuery,[UserId,Number(userData.ProjectId), UserId]);
        userProjectId =userProjectResult.rows[0].UserProjectId;
        // =================================================
        // 6. CREATE USER ROLE
        // ==================================================
        const userRoleQuery = `
            INSERT INTO "DATA"."UserRole"
            (
                "UserId",
                "RoleId",
                "CompanyId",
                "CompanyProductId",
                "ProjectId",
                "CreatedAt",
                "CreatedByUserId"
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                CURRENT_TIMESTAMP,
                $6
            )
            RETURNING
                "UserRoleId";
        `;
        const userRoleResult = await client.query(userRoleQuery,
                [
                    UserId,
                    Number(userData.RoleId),
                    Number(userData.CompanyId),
                    Number(userData.CompanyProductId),
                    Number(userData.ProjectId),
                    UserId
                ]
            );
        userRoleId = userRoleResult.rows[0].UserRoleId;
        // ==================================================
        // 7. CREATE USER DETAILS
        // ==================================================
        const userDetailsQuery = `
            INSERT INTO "DATA"."UserDetails"
            (
                "UserId",
                "EmployeeId",
                "FirstName",
                "MiddleName",
                "LastName",
                "PhoneNumber",
                "DateOfBirth",
                "GenderId",
                "MaritalStatusId",
                "DesignationId",
                "Email",
                "LoginName",
                "AltPhoneNumber",
                "DateOfJoining",
                "FileTypeId",
                "UserCompanyId",
                "UserProductId",
                "UserProjectId",
                "UserReportingManagerId",
                "UserRoleId",
                "IsDisabled",
                "CreatedAt",
                "UpdatedAt",
                "CreatedByUserId"
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14,
                $15,
                $16,
                $17,
                $18,
                $19,
                $20,
                false,
                CURRENT_TIMESTAMP,
                NULL,
                $21
            )
            RETURNING
                "UserDetailsId",
                "UserId",
                "EmployeeId",
                "FirstName",
                "MiddleName",
                "LastName",
                "PhoneNumber",
                "DateOfBirth",
                "GenderId",
                "MaritalStatusId",
                "DesignationId",
                "Email",
                "LoginName",
                "AltPhoneNumber",
                "DateOfJoining",
                "FileTypeId",
                "UserCompanyId",
                "UserProductId",
                "UserProjectId",
                "UserReportingManagerId",
                "UserRoleId",
                "IsDisabled",
                "CreatedAt",
                "UpdatedAt",
                "CreatedByUserId";
        `;
        // ==================================================
        // FILE TYPE
        // ==================================================
        let fileTypeId = null;
        if (userData.UserFiles && userData.UserFiles.length > 0) 
            {
            fileTypeId = Number(userData.UserFiles[0].FileTypeId);
        }

        const userDetailsValues = [
            UserId,
            userData.EmployeeId,
            userData.FirstName,
            userData.MiddleName || null,
            userData.LastName || null,
            userData.PhoneNumber,
            userData.DateOfBirth,
            userData.GenderId,
            userData.MaritalStatusId,
            userData.DesignationId,
            userData.Email,
            userData.LoginName,
            userData.AltPhoneNumber || null,
            userData.DateOfJoining,
            fileTypeId,
            userCompanyId,
            userProductId,
            userProjectId,
            userReportingManagerId,
            userRoleId,
            UserId
        ];
        const userDetailsResult = await client.query(userDetailsQuery,userDetailsValues);
        const userDetails = userDetailsResult.rows[0];
        // ==================================================
        // 8. CREATE USER FILES
        // ==================================================
        const userFiles = userData.UserFiles || [];
        const createdUserFiles = [];
        for (const userFile of userFiles) 
            {
            // ----------------------------------------------
            // VALIDATE FILE TYPE ID
            // ----------------------------------------------
            if (
                userFile.FileTypeId === undefined ||
                userFile.FileTypeId === null || !Number.isInteger(Number(userFile.FileTypeId)) || Number(userFile.FileTypeId) <= 0)
                 {
                throw new Error("Valid FileTypeId is required for every UserFile");
            }
            // ----------------------------------------------
            // VALIDATE FILE PATH
            // ----------------------------------------------
            if (
                !userFile.FilePath || String(userFile.FilePath).trim() === "")
                 {
                throw new Error("FilePath is required for every UserFile");
            }
            // ----------------------------------------------
            // INSERT USER FILE
            // ----------------------------------------------
            const userFileQuery = `
                INSERT INTO "DATA"."UserFile"
                (
                    "FileTypeId",
                    "UserId",
                    "FilePath",
                    "IsDisabled",
                    "CreatedAt",
                    "CreatedByUserId"
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    false,
                    CURRENT_TIMESTAMP,
                    $4
                )
                RETURNING
                    "UserFileId",
                    "FileTypeId",
                    "UserId",
                    "FilePath",
                    "IsDisabled",
                    "CreatedAt",
                    "CreatedByUserId";
            `;

            const userFileValues = [
                Number(userFile.FileTypeId),
                UserId,userFile.FilePath,UserId
            ];

            const userFileResult = await client.query(userFileQuery,userFileValues);

            if (userFileResult.rows.length > 0) {
                createdUserFiles.push(userFileResult.rows[0]);
            }
        }
        await client.query("COMMIT");
        return {
            ...user,
            UserDetails:userDetails,
            UserFiles:createdUserFiles
        };


    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

};
// ==========================================================
// FLAG ID 1 - COMPANY
// ==========================================================

export const getCompanyDropdown = async () => {

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


// ==========================================================
// FLAG ID 2 - PRODUCT BASED ON COMPANY
// ==========================================================

export const getProductDropdown = async (CompanyId) => {

    const query = `
        SELECT DISTINCT
            p."ProductId",
            p."ProductName"
        FROM "LKP"."CompanyProduct" cp
        INNER JOIN "LKP"."Product" p
            ON p."ProductId" = cp."ProductId"
        WHERE cp."CompanyId" = $1
          AND p."IsDisabled" = false
        ORDER BY p."ProductName";
    `;

    const result = await pool.query(
        query,
        [CompanyId]
    );

    return result.rows;
};


export const getProjectDropdown = async (CompanyProductId) => {

    const query = `
        SELECT DISTINCT
            pr."ProjectId",
            pr."ProjectName"
        FROM "LKP"."CompanyProduct" cp

        INNER JOIN "LKP"."Project" pr
            ON pr."CompanyProductId" = cp."CompanyProductId"

        WHERE cp."CompanyProductId" = $1
          AND pr."IsDisabled" = false

        ORDER BY pr."ProjectName";
    `;

    const result = await pool.query(query, [
        CompanyProductId
    ]);
    return result.rows;
};

export const getRoleDropdown = async () => {
    const query = `
        SELECT
            "RoleId",
            "RoleName"
        FROM "LKP"."Role"
        WHERE "IsDisabled" = false
        ORDER BY "RoleName" ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};


