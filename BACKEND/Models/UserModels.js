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


export const getDesignationDropdown = async (CompanyId) => {
    const query = `
        SELECT
            "CompanyDesignationId" AS "DesignationId",
            "DesignationName",
            "DesignationLevel"
        FROM "LKP"."CompanyDesignation"
        WHERE "CompanyId" = $1
          AND "IsDisabled" = false
        ORDER BY "DesignationName";
    `;

    const result = await pool.query(query, [CompanyId]);

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
        SELECT EXISTS (
            SELECT 1
            FROM "DATA"."User"
            WHERE "LoginName" = $1
        ) AS "exists";
    `;

    const result = await pool.query(query, [LoginName]);

    return result.rows[0].exists;
};


// ==========================================================
// CHECK EMAIL
// ==========================================================


export const checkEmailExists = async (Email) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM "DATA"."User"
            WHERE "Email" = $1
        ) AS "exists";
    `;

    const result = await pool.query(query, [Email]);

    return result.rows[0].exists;
};

// ==========================================================
// CHECK PHONE NUMBER
// ==========================================================


export const checkPhoneNumberExists = async (PhoneNumber) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM "DATA"."User"
            WHERE "PhoneNumber" = $1
        ) AS "exists";
    `;

    const result = await pool.query(query, [PhoneNumber]);

    return result.rows[0].exists;
};

// ==========================================================
// CHECK EMPLOYEE ID
// ==========================================================


export const checkEmployeeIdExists = async (EmployeeId) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM "DATA"."User"
            WHERE "EmployeeId" = $1
        ) AS "exists";
    `;

    const result = await pool.query(query, [EmployeeId]);

    return result.rows[0].exists;
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
                "DateOfJoining",
                "DepartmentId"
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
                $16,
                $17
            )
            RETURNING
                "UserId",
                "EmployeeId",
                "FirstName"
                
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
            userData.DateOfJoining,
            userData.DepartmentId || null
        ];


        const userResult = await client.query(
            userQuery,
            userValues
        );


        const user = userResult.rows[0];


        if (!user) {
            throw new Error("User creation failed");
        }


        const UserId = user.UserId;


        // ==================================================
        // 2. CREATE USER REPORTING MANAGERS
        // ==================================================

        const reportingManagerIds =
            userData.ReportingManagerUserId || [];


        const createdReportingManagers = [];


        for (
            const ReportingManagerUserId
            of reportingManagerIds
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
                        ReportingManagerUserId,
                        userData.CompanyId,
                        UserId
                    ]
                );


            createdReportingManagers.push(
                reportingManagerResult.rows[0]
                    .UserReportingManagerId
            );

        }


        const userReportingManagerId =
            createdReportingManagers.length > 0
                ? createdReportingManagers[0]
                : null;


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
                    userData.CompanyId,
                    UserId
                ]
            );


        const userCompanyId =
            userCompanyResult.rows[0].UserCompanyId;


        // ==================================================
        // 4. CREATE USER PRODUCTS
        // CONVERT PRODUCT IDs TO COMPANY PRODUCT IDs
        // ==================================================

        const selectedProductIds =
            userData.ProductId ??
            userData.CompanyProductId ??
            [];

        let companyProductIds = [];

        if (selectedProductIds.length > 0) {

            // Get actual CompanyProductIds
            const companyProductResult = await client.query(
                `
                SELECT
                    "CompanyProductId",
                    "ProductId"
                FROM "LKP"."CompanyProduct"
                WHERE "CompanyId" = $1
                AND "ProductId" = ANY($2::smallint[])
                `,
                [
                    userData.CompanyId,
                    selectedProductIds
                ]
            );

            const productMapping = companyProductResult.rows;

            // Check whether all selected ProductIds exist
            const validProductIds = productMapping.map(
                row => Number(row.ProductId)
            );

            const invalidProductIds = selectedProductIds.filter(
                id => !validProductIds.includes(Number(id))
            );

            if (invalidProductIds.length > 0) {
                throw new Error(
                    `Invalid ProductId(s) for CompanyId ${userData.CompanyId}: ${invalidProductIds.join(", ")}`
                );
            }

            // Convert ProductIds into CompanyProductIds
            companyProductIds = productMapping.map(
                row => Number(row.CompanyProductId)
            );

        }

        const createdUserProducts = [];

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
            RETURNING "UserProductId";
        `;

        for (const CompanyProductId of companyProductIds) {

            const userProductResult = await client.query(
                userProductQuery,
                [
                    UserId,
                    CompanyProductId,
                    UserId
                ]
            );

            createdUserProducts.push(
                userProductResult.rows[0].UserProductId
            );

        }

        const userProductId =
            createdUserProducts.length > 0
                ? createdUserProducts[0]
                : null;

        // ==================================================
        // 5. CREATE USER PROJECTS
        // ==================================================

        const projectIds =
            userData.ProjectId || [];


        const createdUserProjects = [];


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
                $3,
                false,
                CURRENT_TIMESTAMP,
                $4
            )
            RETURNING
                "UserProjectId";
        `;


        for (
            let index = 0;
            index < projectIds.length;
            index++
        ) {

            const ProjectId =
                projectIds[index];


            const userProjectResult =
                await client.query(
                    userProjectQuery,
                    [
                        UserId,
                        ProjectId,
                        index === 0,
                        UserId
                    ]
                );


            createdUserProjects.push(
                userProjectResult.rows[0]
                    .UserProjectId
            );

        }


        const userProjectId =
            createdUserProjects.length > 0
                ? createdUserProjects[0]
                : null;


        // ==================================================
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


        const userRoleResult =
            await client.query(
                userRoleQuery,
                [
                    UserId,
                    userData.RoleId,
                    userData.CompanyId,
                    companyProductIds[0],
                    projectIds[0],
                    UserId
                ]
            );


        const userRoleId =
            userRoleResult.rows[0].UserRoleId;


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
                false,
                CURRENT_TIMESTAMP,
                NULL,
                $20
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
            userCompanyId,
            userProductId,
            userProjectId,
            userReportingManagerId,
            userRoleId,
            UserId
        ];


        const userDetailsResult =
            await client.query(
                userDetailsQuery,
                userDetailsValues
            );


        const userDetails =
            userDetailsResult.rows[0];


        // ==================================================
        // 8. CREATE USER FILES
        // ==================================================

        const userFiles =
            userData.UserFiles || [];


        const createdUserFiles = [];


        for (const userFile of userFiles) {

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
                userFile.FileTypeId,
                UserId,
                userFile.FilePath,
                UserId
            ];


            const userFileResult =
                await client.query(
                    userFileQuery,
                    userFileValues
                );


            if (userFileResult.rows.length > 0) {

                createdUserFiles.push(
                    userFileResult.rows[0]
                );

            }

        }

// ==================================================
// 2. CREATE SECRET PASSWORD
// ==================================================

const secretPasswordQuery = `
    INSERT INTO "TRACK"."SecretPassword"
    (
        "UserId",
        "PlainPassword",
        "HashedPassword",
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
        "SecretPasswordId";
`;

const secretPasswordResult = await client.query(
    secretPasswordQuery,
    [
       UserId,
        userData.PlainPassword,
        userData.HashedPassword,
        UserId
    ]
);

const secretPasswordId =
    secretPasswordResult.rows[0].SecretPasswordId;
        // ==================================================
        // 9. COMMIT
        // ==================================================

        await client.query("COMMIT");


        return {
            ...user,

            UserDetails: userDetails,

            UserReportingManagers:
                createdReportingManagers,

            UserProducts:
                createdUserProducts,

            UserProjects:
                createdUserProjects,

            UserRoleId:
                userRoleId,

            UserFiles:
                createdUserFiles
        };


    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

};


// export const getDepartmentDropdownCompanyId = async (CompanyId = null) => {
//     const query = `
//         SELECT
//             D."DepartmentId",
//             D."DepartmentName"
//              FROM "LKP"."Department" D
//         INNER JOIN "LKP"."Company" C
//             ON C."CompanyId" = D."CompanyId"
//         WHERE
//             D."IsDisabled" = false
//             AND C."IsDisabled" = false
//             AND (
//                 $1::smallint IS NULL
//                 OR D."CompanyId" = $1
//             )
//         ORDER BY D."DepartmentName" ASC
//     `;

//     const result = await pool.query(query, [CompanyId]);

//     return result.rows;
// };







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
        SELECT
            cp."CompanyProductId",
            cp."ProductId",
            p."ProductName"
        FROM "LKP"."CompanyProduct" cp
        INNER JOIN "LKP"."Product" p
            ON p."ProductId" = cp."ProductId"
        WHERE cp."CompanyId" = $1
          AND cp."IsDisabled" = false
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
        SELECT
            "ProjectId",
            "ProjectName"
        FROM "LKP"."Project"
        WHERE "CompanyProductId" = $1
          AND "IsDisabled" = false
        ORDER BY "ProjectName";
    `;

    const result = await pool.query(
        query,
        [Number(CompanyProductId)]
    );

    return result.rows;
};

export const getRoleDropdown = async (CompanyId) => {

    const query = `
        SELECT
            "RoleId",
            "RoleName",
            "CompanyId"
        FROM "LKP"."Role"
        WHERE "IsDisabled" = false
          AND "CompanyId" = $1
        ORDER BY "RoleName" ASC;
    `;

    const result = await pool.query(query, [CompanyId]);

    return result.rows;
};


// ======================================================
// GET ALL GENDERS
// ======================================================

export const getAllGenders = async () => {

    try {

        const result = await pool.query(`
            SELECT
                "GenderId" AS "GenderId",
                "GenderName" AS "GenderName"

            FROM "LKP"."Gender"

            WHERE "IsDisabled" = false

            ORDER BY "GenderName"
        `);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ======================================================
// GET ALL MARITAL STATUSES
// ======================================================

export const getAllMaritalStatuses = async () => {

    try {

        const result = await pool.query(`
            SELECT
                "MaritalStatusId" AS "MaritalStatusId",
                "MaritalStatusName" AS "MaritalStatusName"

            FROM "LKP"."MaritalStatus"

            WHERE "IsDisabled" = false

            ORDER BY "MaritalStatusName"
        `);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ======================================================
// GET ALL DESIGNATIONS
// ======================================================

export const getAllDesignations = async (CompanyId) => {

    try {

        const result = await pool.query(`
            SELECT
                cd."CompanyDesignationId" AS "CompanyDesignationId",
                cd."DesignationName" AS "DesignationName",
                cd."DesignationCode" AS "DesignationCode",
                cd."CompanyId" AS "CompanyId"

            FROM "LKP"."CompanyDesignation" cd

            WHERE cd."IsDisabled" = false
            AND cd."CompanyId" = $1

            ORDER BY cd."DesignationName"
        `, [CompanyId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ======================================================
// GET ALL COMPANIES
// ======================================================

export const getAllCompanies = async () => {

    try {

        const result = await pool.query(`
            SELECT
                "CompanyId" AS "CompanyId",
                "CompanyName" AS "CompanyName",
                "CompanyCode" AS "CompanyCode"

            FROM "LKP"."Company"

            WHERE "IsDisabled" = false

            ORDER BY "CompanyName"
        `);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ======================================================
// GET ALL REPORTING MANAGERS
// ======================================================

export const getAllReportingManagers = async (CompanyId) => {

    try {

        const result = await pool.query(`
            SELECT DISTINCT
                urm."ReportingManagerUserId" AS "ReportingManagerUserId",
                CONCAT_WS(
                    ' ',
                    manager."FirstName",
                    manager."MiddleName",
                    manager."LastName"
                ) AS "ReportingManagerName"

            FROM "DATA"."UserReportingManager" urm

            INNER JOIN "DATA"."User" manager
                ON manager."UserId" = urm."ReportingManagerUserId"

            WHERE urm."CompanyId" = $1
            AND urm."IsDisabled" = false
            AND manager."IsDisabled" = false

            ORDER BY "ReportingManagerName"
        `, [CompanyId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ======================================================
// GET ALL COMPANY PRODUCTS
// ======================================================

export const getAllCompanyProducts = async (CompanyId) => {

    try {

        const result = await pool.query(`
            SELECT
                cp."CompanyProductId" AS "CompanyProductId",
                cp."CompanyId" AS "CompanyId",
                cp."ProductId" AS "ProductId",
                p."ProductName" AS "ProductName",
                p."ProductCode" AS "ProductCode"

            FROM "LKP"."CompanyProduct" cp

            INNER JOIN "LKP"."Product" p
                ON p."ProductId" = cp."ProductId"

            WHERE cp."CompanyId" = $1
            AND cp."IsDisabled" = false
            AND p."IsDisabled" = false

            ORDER BY p."ProductName"
        `, [CompanyId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ======================================================
// GET ALL PROJECTS
// ======================================================

export const getAllProjects = async (CompanyProductId) => {

    try {

        const result = await pool.query(`
            SELECT
                p."ProjectId" AS "ProjectId",
                p."CompanyProductId" AS "CompanyProductId",
                p."ProjectName" AS "ProjectName",
                p."ProjectCode" AS "ProjectCode"

            FROM "LKP"."Project" p

            INNER JOIN "LKP"."CompanyProduct" cp
                ON cp."CompanyProductId" = p."CompanyProductId"

            WHERE p."CompanyProductId" = $1
            AND p."IsDisabled" = false
            AND cp."IsDisabled" = false

            ORDER BY p."ProjectName"
        `, [CompanyProductId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};


// ======================================================
// GET ALL ROLES
// ======================================================

export const getAllRoles = async (CompanyId) => {

    try {

        const result = await pool.query(`
            SELECT
                "RoleId" AS "RoleId",
                "RoleCode" AS "RoleCode",
                "RoleName" AS "RoleName",
                "RoleDescription" AS "RoleDescription",
                "CompanyId" AS "CompanyId"

            FROM "LKP"."Role"

            WHERE "CompanyId" = $1
            AND "IsDisabled" = false

            ORDER BY "RoleName"
        `, [CompanyId]);

        return result.rows;

    } catch (error) {

        throw error;
    }
};






export const getDesignationById = async (DesignationId) => {
    const query = `
        SELECT
            "CompanyDesignationId" AS "DesignationId",
            "DesignationName",
            "CompanyId",
            "DesignationLevel"
        FROM "LKP"."CompanyDesignation"
        WHERE "CompanyDesignationId" = $1
          AND "IsDisabled" = false;
    `;

    const result = await pool.query(query, [DesignationId]);
    return result.rows[0] || null;
};


export const getUserCount = async () => {
    const query = `
        SELECT COUNT(*)::int AS "UserCount"
        FROM "DATA"."User"
    `;

    const result = await pool.query(query);

    return result.rows[0].UserCount;
};