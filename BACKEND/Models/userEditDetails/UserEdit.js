import { pool } from "../../Config/db.js";
import bcrypt from "bcrypt";

export const getAllUserDetails = async (CompanyId) => {
    try {

        const query = `
    SELECT
        u."UserId",
        u."EmployeeId",
        u."FirstName",
        u."MiddleName",
        u."LastName",
        u."Email",
        u."LoginName",
        u."PhoneNumber",
        u."AltPhoneNumber",
        u."DateOfJoining",
        u."DateOfBirth",
        u."IsDisabled",
        u."CreatedAt",

        u."GenderId", 
        g."GenderName" AS "GenderName",

        u."MaritalStatusId", 
        ms."MaritalStatusName" AS "MaritalStatusName",

        u."DesignationId", 
        cd."DesignationName" AS "DesignationName",



        -- =====================================
        -- COMPANY
        -- =====================================
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'UserCompanyId', uc."UserCompanyId",
                    'CompanyId', uc."CompanyId",
                    'CompanyName', c."CompanyName",
                    'IsPrimaryCompany', uc."IsPrimaryCompany"
                )
            ) FILTER (
                WHERE uc."UserCompanyId" IS NOT NULL
            ),
            '[]'
        ) AS "Companies",

        -- =====================================
        -- PRODUCT
        -- =====================================
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'UserProductId', up."UserProductId",
                    'CompanyProductId', up."CompanyProductId",
                    'ProductId', p."ProductId",
                    'ProductName', p."ProductName"
                )
            ) FILTER (
                WHERE up."UserProductId" IS NOT NULL
            ),
            '[]'
        ) AS "Products",

        -- =====================================
        -- PROJECT
        -- =====================================
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'UserProjectId', upr."UserProjectId",
                    'ProjectId', upr."ProjectId",
                    'ProjectName', pr."ProjectName",
                    'IsPrimary', upr."IsPrimary"
                )
            ) FILTER (
                WHERE upr."UserProjectId" IS NOT NULL
            ),
            '[]'
        ) AS "Projects",

        -- =====================================
        -- ROLE
        -- =====================================
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'UserRoleId', ur."UserRoleId",
                    'RoleId', ur."RoleId",
                    'RoleName', r."RoleName",
                    'CompanyId', ur."CompanyId",
                    'CompanyName', rc."CompanyName",
                    'CompanyProductId', ur."CompanyProductId",
                    'ProductId', rp."ProductId",
                    'ProductName', rp."ProductName",
                    'ProjectId', ur."ProjectId",
                    'ProjectName', rpr."ProjectName"
                )
            ) FILTER (
                WHERE ur."UserRoleId" IS NOT NULL
            ),
            '[]'
        ) AS "Roles",

        -- =====================================
        -- REPORTING MANAGER
        -- =====================================
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'UserReportingManagerId',
                        urm."UserReportingManagerId",

                    'ReportingManagerUserId',
                        urm."ReportingManagerUserId",

                    'ReportingManagerName',
                        CONCAT(
                            rm."FirstName",
                            ' ',
                            COALESCE(rm."LastName", '')
                        ),

                    'CompanyId',
                        urm."CompanyId",

                    'CompanyName',
                        rmc."CompanyName"
                )
            ) FILTER (
                WHERE urm."UserReportingManagerId" IS NOT NULL AND urm."CompanyId" =$1
            ),
            '[]'
        ) AS "ReportingManagers"

    FROM "DATA"."User" u

    -- =====================================
    -- USER COMPANY
    -- =====================================
    LEFT JOIN "DATA"."UserCompany" uc
        ON uc."UserId" = u."UserId"
        AND uc."IsDisabled" = false

    LEFT JOIN "LKP"."Company" c
        ON c."CompanyId" = uc."CompanyId"

    -- =====================================
    -- USER PRODUCT
    -- =====================================
    LEFT JOIN "DATA"."UserProduct" up
        ON up."UserId" = u."UserId"
        AND up."IsDisabled" = false

    LEFT JOIN "LKP"."CompanyProduct" cp
        ON cp."CompanyProductId" = up."CompanyProductId"

    LEFT JOIN "LKP"."Product" p
        ON p."ProductId" = cp."ProductId"

    -- =====================================
    -- USER PROJECT
    -- =====================================
    LEFT JOIN "DATA"."UserProject" upr
        ON upr."UserId" = u."UserId"
        AND upr."IsDisabled" = false

    LEFT JOIN "LKP"."Project" pr
        ON pr."ProjectId" = upr."ProjectId"

    -- =====================================
    -- USER ROLE
    -- =====================================
    LEFT JOIN "DATA"."UserRole" ur
        ON ur."UserId" = u."UserId"

    LEFT JOIN "LKP"."Role" r
        ON r."RoleId" = ur."RoleId"

    -- Role's Company
    LEFT JOIN "LKP"."Company" rc
        ON rc."CompanyId" = ur."CompanyId"

    -- Role's CompanyProduct
    LEFT JOIN "LKP"."CompanyProduct" rcp
        ON rcp."CompanyProductId" = ur."CompanyProductId"

    -- Role's Product
    LEFT JOIN "LKP"."Product" rp
        ON rp."ProductId" = rcp."ProductId"

    -- Role's Project
    LEFT JOIN "LKP"."Project" rpr
        ON rpr."ProjectId" = ur."ProjectId"

    -- =====================================
    -- REPORTING MANAGER
    -- =====================================
    LEFT JOIN "DATA"."UserReportingManager" urm
        ON urm."UserId" = u."UserId"
        AND urm."IsDisabled" = false

    -- Get manager's User record
    LEFT JOIN "DATA"."User" rm
        ON rm."UserId" = urm."ReportingManagerUserId"

    -- Manager's Company
    LEFT JOIN "LKP"."Company" rmc
        ON rmc."CompanyId" = urm."CompanyId"

    LEFT JOIN "LKP"."Gender" g 
    ON g."GenderId" = u."GenderId"

    LEFT JOIN "LKP"."MaritalStatus" ms 
    ON ms."MaritalStatusId" = u."MaritalStatusId"

    LEFT JOIN "LKP"."CompanyDesignation" cd 
    ON cd."CompanyDesignationId" = u."DesignationId"

    WHERE EXISTS (
    SELECT 1
    FROM "DATA"."UserCompany" uc_filter
    WHERE uc_filter."UserId" = u."UserId"
      AND uc_filter."CompanyId" = $1
      AND uc_filter."IsDisabled" = false
)

GROUP BY
        u."UserId",
        u."EmployeeId",
        u."FirstName",
        u."MiddleName",
        u."LastName",
        u."Email",
        u."LoginName",
        u."GenderId", 
        g."GenderName", 
        u."MaritalStatusId",
        ms."MaritalStatusName", 
        u."DesignationId", 
        cd."DesignationName";

`;

        const result = await pool.query(query,[CompanyId]);
        return result.rows
    } catch (error) {
        throw error
    }
}


// export const editUserdetails = async ({
//     UserId,


//     employeeId,
//     firstName,
//     middleName,
//     lastName,
//     phoneNumber,
//     dateOfBirth,
//     genderId,
//     maritalStatusId,
//     designationId,
//     email,
//     loginName,
//     altPhoneNumber,
//     dateOfJoining,
//     updatedByUserName,


//     UserCompanyId,
//     companyId,
//     isPrimaryCompany,


//     UserProductId,
//     companyProductId,


//     UserProjectId,
//     projectId,
//     isPrimary,


//     UserRoleId,
//     roleId,
//     roleCompanyId,
//     roleCompanyProductId,
//     roleProjectId,


//     UserReportingManagerId,
//     reportingManagerUserId,
//     reportingManagerCompanyId
// }) => {

//     const client = await pool.connect();

//     try {

//         await client.query("BEGIN");

//         const userQuery = `
//             UPDATE "DATA"."User"
//             SET
//                 "EmployeeId" =
//                     COALESCE($1, "EmployeeId"),

//                 "FirstName" =
//                     COALESCE($2, "FirstName"),

//                 "MiddleName" =
//                     COALESCE($3, "MiddleName"),

//                 "LastName" =
//                     COALESCE($4, "LastName"),

//                 "PhoneNumber" =
//                     COALESCE($5, "PhoneNumber"),

//                 "DateOfBirth" =
//                     COALESCE($6, "DateOfBirth"),

//                 "GenderId" =
//                     COALESCE($7, "GenderId"),

//                 "MaritalStatusId" =
//                     COALESCE($8, "MaritalStatusId"),

//                 "DesignationId" =
//                     COALESCE($9, "DesignationId"),

//                 "Email" =
//                     COALESCE($10, "Email"),

//                 "LoginName" =
//                     COALESCE($11, "LoginName"),

//                 "AltPhoneNumber" =
//                     COALESCE($12, "AltPhoneNumber"),

//                 "DateOfJoining" =
//                     COALESCE($13, "DateOfJoining"),

//                 "UpdatedAt" =
//                     CURRENT_TIMESTAMP,

//                 "UpdatedByUserName" =
//                     COALESCE($14, "UpdatedByUserName")

//             WHERE "UserId" = $15

//             RETURNING
//                 "UserId",
//                 "FirstName";
//         `;


//         await client.query(
//             userQuery,
//             [
//                 employeeId,
//                 firstName,
//                 middleName,
//                 lastName,
//                 phoneNumber,
//                 dateOfBirth,
//                 genderId,
//                 maritalStatusId,
//                 designationId,
//                 email,
//                 loginName,
//                 altPhoneNumber,
//                 dateOfJoining,
//                 updatedByUserName,
//                 UserId
//             ]
//         );

//         if (UserCompanyId) {

//             const userCompanyQuery = `
//                 UPDATE "DATA"."UserCompany"
//                 SET
//                     "CompanyId" =
//                         COALESCE($1, "CompanyId"),

//                     "IsPrimaryCompany" =
//                         COALESCE($2, "IsPrimaryCompany"),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE(
//                             $3,
//                             "UpdatedByUserId"
//                         )

//                 WHERE "UserCompanyId" = $4
//                 AND "UserId" = $5;
//             `;


//           let r=  await client.query(
//                 userCompanyQuery,
//                 [
//                     companyId,
//                     isPrimaryCompany,
//                     UserId,
//                     UserCompanyId,
//                     UserId
//                 ]
//             );

//         }

//         if (UserProductId) {

//             const userProductQuery = `
//                 UPDATE "DATA"."UserProduct"
//                 SET
//                     "CompanyProductId" =
//                         COALESCE(
//                             $1,
//                             "CompanyProductId"
//                         ),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE(
//                             $2,
//                             "UpdatedByUserId"
//                         )

//                 WHERE "UserProductId" = $3
//                 AND "UserId" = $4;
//             `;


//           let s=  await client.query(
//                 userProductQuery,
//                 [
//                     companyProductId,
//                     UserId,
//                     UserProductId,
//                     UserId
//                 ]
//             );


//         }


//         if (UserProjectId) {

//             const userProjectQuery = `
//                 UPDATE "DATA"."UserProject"
//                 SET
//                     "ProjectId" =
//                         COALESCE(
//                             $1,
//                             "ProjectId"
//                         ),

//                     "IsPrimary" =
//                         COALESCE(
//                             $2,
//                             "IsPrimary"
//                         ),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE(
//                             $3,
//                             "UpdatedByUserId"
//                         )

//                 WHERE "UserProjectId" = $4
//                 AND "UserId" = $5;
//             `;


//             await client.query(
//                 userProjectQuery,
//                 [
//                     projectId,
//                     isPrimary,
//                     UserId,
//                     UserProjectId,
//                     UserId
//                 ]
//             );
//         }


//         if (UserRoleId) {

//             const userRoleQuery = `
//                 UPDATE "DATA"."UserRole"
//                 SET
//                     "RoleId" =
//                         COALESCE(
//                             $1,
//                             "RoleId"
//                         ),

//                     "CompanyId" =
//                         COALESCE(
//                             $2,
//                             "CompanyId"
//                         ),

//                     "CompanyProductId" =
//                         COALESCE(
//                             $3,
//                             "CompanyProductId"
//                         ),

//                     "ProjectId" =
//                         COALESCE(
//                             $4,
//                             "ProjectId"
//                         ),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE(
//                             $5,
//                             "UpdatedByUserId"
//                         )

//                 WHERE "UserRoleId" = $6
//                 AND "UserId" = $7;
//             `;


//             await client.query(
//                 userRoleQuery,
//                 [
//                     roleId,
//                     roleCompanyId,
//                     roleCompanyProductId,
//                     roleProjectId,
//                     UserId,
//                     UserRoleId,
//                     UserId
//                 ]
//             );
//         }



//         if (UserReportingManagerId) {

//             const reportingManagerQuery = `
//                 UPDATE "DATA"."UserReportingManager"
//                 SET
//                     "ReportingManagerUserId" =
//                         COALESCE(
//                             $1,
//                             "ReportingManagerUserId"
//                         ),

//                     "CompanyId" =
//                         COALESCE(
//                             $2,
//                             "CompanyId"
//                         ),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE(
//                             $3,
//                             "UpdatedByUserId"
//                         )

//                 WHERE "UserReportingManagerId" = $4
//                 AND "UserId" = $5;
//             `;


//             await client.query(
//                 reportingManagerQuery,
//                 [
//                     reportingManagerUserId,
//                     reportingManagerCompanyId,
//                     UserId,
//                     UserReportingManagerId,
//                     UserId
//                 ]
//             );
//         }

//         await client.query("COMMIT");

//         return {
//             UserId
//         };


//     } catch (error) {

//         await client.query("ROLLBACK");

//         throw error;

//     } finally {

//         client.release();

//     }
// };




// export const editUserdetails = async ({
//     UserId,

//     // ============================================================
//     // DATA.User
//     // ============================================================

//     employeeId,
//     firstName,
//     middleName,
//     lastName,
//     phoneNumber,
//     dateOfBirth,
//     genderId,
//     maritalStatusId,
//     designationId,
//     email,
//     loginName,
//     altPhoneNumber,
//     dateOfJoining,
//     updatedByUserName,


//     // ============================================================
//     // DATA.UserCompany
//     // ============================================================

//     UserCompanyId,
//     companyId,
//     isPrimaryCompany,


//     // ============================================================
//     // DATA.UserProduct
//     // ============================================================

//     UserProductId,
//     companyProductId,


//     // ============================================================
//     // DATA.UserProject
//     // ============================================================

//     UserProjectId,
//     projectId,
//     isPrimary,


//     // ============================================================
//     // DATA.UserRole
//     // ============================================================

//     UserRoleId,
//     roleId,
//     roleCompanyId,
//     roleCompanyProductId,
//     roleProjectId,


//     // ============================================================
//     // DATA.UserReportingManager
//     // ============================================================

//     UserReportingManagerId,
//     reportingManagerUserId,
//     reportingManagerCompanyId
// }) => {

//     const client = await pool.connect();

//     try {

//         // ============================================================
//         // 1. BEGIN TRANSACTION
//         // ============================================================

//         await client.query("BEGIN");


//         // ============================================================
//         // 2. FETCH CURRENT USER DATA
//         // ============================================================

//         const userResult = await client.query(
//             `
//             SELECT
//                 "UserId",
//                 "EmployeeId",
//                 "FirstName",
//                 "MiddleName",
//                 "LastName",
//                 "PhoneNumber",
//                 "DateOfBirth",
//                 "GenderId",
//                 "MaritalStatusId",
//                 "DesignationId",
//                 "Email",
//                 "LoginName",
//                 "AltPhoneNumber",
//                 "DateOfJoining"
//             FROM "DATA"."User"
//             WHERE "UserId" = $1;
//             `,
//             [UserId]
//         );


//         if (userResult.rows.length === 0) {

//             throw new Error(
//                 `User with UserId ${UserId} not found`
//             );
//         }


//         const oldUser = userResult.rows[0];


//         // ============================================================
//         // 3. FETCH CURRENT USER COMPANY
//         // ============================================================

//         let oldCompany = null;

//         if (UserCompanyId) {

//             const result = await client.query(
//                 `
//                 SELECT
//                     "UserCompanyId",
//                     "CompanyId",
//                     "IsPrimaryCompany"
//                 FROM "DATA"."UserCompany"
//                 WHERE "UserCompanyId" = $1
//                 AND "UserId" = $2;
//                 `,
//                 [
//                     UserCompanyId,
//                     UserId
//                 ]
//             );

//             oldCompany = result.rows[0] || null;
//         }


//         // ============================================================
//         // 4. FETCH CURRENT USER PRODUCT
//         // ============================================================

//         let oldProduct = null;

//         if (UserProductId) {

//             const result = await client.query(
//                 `
//                 SELECT
//                     "UserProductId",
//                     "CompanyProductId"
//                 FROM "DATA"."UserProduct"
//                 WHERE "UserProductId" = $1
//                 AND "UserId" = $2;
//                 `,
//                 [
//                     UserProductId,
//                     UserId
//                 ]
//             );

//             oldProduct = result.rows[0] || null;
//         }


//         // ============================================================
//         // 5. FETCH CURRENT USER PROJECT
//         // ============================================================

//         let oldProject = null;

//         if (UserProjectId) {

//             const result = await client.query(
//                 `
//                 SELECT
//                     "UserProjectId",
//                     "ProjectId",
//                     "IsPrimary"
//                 FROM "DATA"."UserProject"
//                 WHERE "UserProjectId" = $1
//                 AND "UserId" = $2;
//                 `,
//                 [
//                     UserProjectId,
//                     UserId
//                 ]
//             );

//             oldProject = result.rows[0] || null;
//         }


//         // ============================================================
//         // 6. FETCH CURRENT USER ROLE
//         // ============================================================

//         let oldRole = null;

//         if (UserRoleId) {

//             const result = await client.query(
//                 `
//                 SELECT
//                     "UserRoleId",
//                     "RoleId",
//                     "CompanyId",
//                     "CompanyProductId",
//                     "ProjectId"
//                 FROM "DATA"."UserRole"
//                 WHERE "UserRoleId" = $1
//                 AND "UserId" = $2;
//                 `,
//                 [
//                     UserRoleId,
//                     UserId
//                 ]
//             );

//             oldRole = result.rows[0] || null;
//         }


//         // ============================================================
//         // 7. FETCH CURRENT REPORTING MANAGER
//         // ============================================================

//         let oldReportingManager = null;

//         if (UserReportingManagerId) {

//             const result = await client.query(
//                 `
//                 SELECT
//                     "UserReportingManagerId",
//                     "ReportingManagerUserId",
//                     "CompanyId"
//                 FROM "DATA"."UserReportingManager"
//                 WHERE "UserReportingManagerId" = $1
//                 AND "UserId" = $2;
//                 `,
//                 [
//                     UserReportingManagerId,
//                     UserId
//                 ]
//             );

//             oldReportingManager = result.rows[0] || null;
//         }


//         // ============================================================
//         // 8. CHECK WHETHER ACTUAL DATA IS CHANGING
//         // ============================================================

//         let hasChanges = false;


//         // ============================================================
//         // USER CHANGES
//         // ============================================================

//         if (
//             employeeId !== undefined &&
//             employeeId !== oldUser.EmployeeId
//         ) {
//             hasChanges = true;
//         }

//         if (
//             firstName !== undefined &&
//             firstName !== oldUser.FirstName
//         ) {
//             hasChanges = true;
//         }

//         if (
//             middleName !== undefined &&
//             middleName !== oldUser.MiddleName
//         ) {
//             hasChanges = true;
//         }

//         if (
//             lastName !== undefined &&
//             lastName !== oldUser.LastName
//         ) {
//             hasChanges = true;
//         }

//         if (
//             phoneNumber !== undefined &&
//             phoneNumber !== oldUser.PhoneNumber
//         ) {
//             hasChanges = true;
//         }

//         if (
//             dateOfBirth !== undefined &&
//             dateOfBirth !== oldUser.DateOfBirth
//         ) {
//             hasChanges = true;
//         }

//         if (
//             genderId !== undefined &&
//             Number(genderId) !== Number(oldUser.GenderId)
//         ) {
//             hasChanges = true;
//         }

//         if (
//             maritalStatusId !== undefined &&
//             Number(maritalStatusId) !== Number(oldUser.MaritalStatusId)
//         ) {
//             hasChanges = true;
//         }

//         if (
//             designationId !== undefined &&
//             Number(designationId) !== Number(oldUser.DesignationId)
//         ) {
//             hasChanges = true;
//         }

//         if (
//             email !== undefined &&
//             email !== oldUser.Email
//         ) {
//             hasChanges = true;
//         }

//         if (
//             loginName !== undefined &&
//             loginName !== oldUser.LoginName
//         ) {
//             hasChanges = true;
//         }

//         if (
//             altPhoneNumber !== undefined &&
//             altPhoneNumber !== oldUser.AltPhoneNumber
//         ) {
//             hasChanges = true;
//         }

//         if (
//             dateOfJoining !== undefined &&
//             dateOfJoining !== oldUser.DateOfJoining
//         ) {
//             hasChanges = true;
//         }


//         // ============================================================
//         // COMPANY CHANGES
//         // ============================================================

//         if (oldCompany) {

//             if (
//                 companyId !== undefined &&
//                 Number(companyId) !== Number(oldCompany.CompanyId)
//             ) {
//                 hasChanges = true;
//             }

//             if (
//                 isPrimaryCompany !== undefined &&
//                 isPrimaryCompany !== oldCompany.IsPrimaryCompany
//             ) {
//                 hasChanges = true;
//             }
//         }


//         // ============================================================
//         // PRODUCT CHANGES
//         // ============================================================

//         if (oldProduct) {

//             if (
//                 companyProductId !== undefined &&
//                 Number(companyProductId) !==
//                     Number(oldProduct.CompanyProductId)
//             ) {
//                 hasChanges = true;
//             }
//         }


//         // ============================================================
//         // PROJECT CHANGES
//         // ============================================================

//         if (oldProject) {

//             if (
//                 projectId !== undefined &&
//                 Number(projectId) !== Number(oldProject.ProjectId)
//             ) {
//                 hasChanges = true;
//             }

//             if (
//                 isPrimary !== undefined &&
//                 isPrimary !== oldProject.IsPrimary
//             ) {
//                 hasChanges = true;
//             }
//         }


//         // ============================================================
//         // ROLE CHANGES
//         // ============================================================

//         if (oldRole) {

//             if (
//                 roleId !== undefined &&
//                 Number(roleId) !== Number(oldRole.RoleId)
//             ) {
//                 hasChanges = true;
//             }

//             if (
//                 roleCompanyId !== undefined &&
//                 Number(roleCompanyId) !== Number(oldRole.CompanyId)
//             ) {
//                 hasChanges = true;
//             }

//             if (
//                 roleCompanyProductId !== undefined &&
//                 Number(roleCompanyProductId) !==
//                     Number(oldRole.CompanyProductId)
//             ) {
//                 hasChanges = true;
//             }

//             if (
//                 roleProjectId !== undefined &&
//                 Number(roleProjectId) !== Number(oldRole.ProjectId)
//             ) {
//                 hasChanges = true;
//             }
//         }


//         // ============================================================
//         // REPORTING MANAGER CHANGES
//         // ============================================================

//         if (oldReportingManager) {

//             if (
//                 reportingManagerUserId !== undefined &&
//                 Number(reportingManagerUserId) !==
//                     Number(oldReportingManager.ReportingManagerUserId)
//             ) {
//                 hasChanges = true;
//             }

//             if (
//                 reportingManagerCompanyId !== undefined &&
//                 Number(reportingManagerCompanyId) !==
//                     Number(oldReportingManager.CompanyId)
//             ) {
//                 hasChanges = true;
//             }
//         }


//         // ============================================================
//         // 9. IF NOTHING CHANGED
//         // ============================================================

//         if (!hasChanges) {

//             await client.query("ROLLBACK");

//             return {
//                 UserId,
//                 message: "No changes detected"
//             };
//         }


//         // ============================================================
//         // 10. INSERT COMPLETE OLD DATA INTO UserDetails
//         //
//         //     THIS HAPPENS ONLY WHEN SOMETHING ACTUALLY CHANGED
//         // ============================================================

//         const historyResult = await client.query(
//             `
//             INSERT INTO "DATA"."UserDetails"
//             (
//                 "UserId",

//                 "EmployeeId",
//                 "FirstName",
//                 "MiddleName",
//                 "LastName",
//                 "PhoneNumber",
//                 "DateOfBirth",
//                 "GenderId",
//                 "MaritalStatusId",
//                 "DesignationId",
//                 "Email",
//                 "LoginName",
//                 "AltPhoneNumber",
//                 "DateOfJoining",

//                 "UserCompanyId",
//                 "CompanyId",
//                 "IsPrimaryCompany",

//                 "UserProductId",
//                 "CompanyProductId",

//                 "UserProjectId",
//                 "ProjectId",
//                 "IsPrimary",

//                 "UserReportingManagerId",
//                 "ReportingManagerUserId",
//                 "ReportingManagerCompanyId",

//                 "UserRoleId",
//                 "RoleId",
//                 "RoleCompanyId",
//                 "RoleCompanyProductId",
//                 "RoleProjectId",

//                 "CreatedAt",
//                 "CreatedByUserId"
//             )

//             VALUES
//             (
//                 $1,

//                 $2,
//                 $3,
//                 $4,
//                 $5,
//                 $6,
//                 $7,
//                 $8,
//                 $9,
//                 $10,
//                 $11,
//                 $12,
//                 $13,
//                 $14,

//                 $15,
//                 $16,
//                 $17,

//                 $18,
//                 $19,

//                 $20,
//                 $21,
//                 $22,

//                 $23,
//                 $24,
//                 $25,

//                 $26,
//                 $27,
//                 $28,
//                 $29,
//                 $30,

//                 CURRENT_TIMESTAMP,
//                 $31
//             )

//             RETURNING "UserDetailsId";
//             `,
//             [

//                 // ====================================================
//                 // USER
//                 // ====================================================

//                 oldUser.UserId,
//                 oldUser.EmployeeId,
//                 oldUser.FirstName,
//                 oldUser.MiddleName,
//                 oldUser.LastName,
//                 oldUser.PhoneNumber,
//                 oldUser.DateOfBirth,
//                 oldUser.GenderId,
//                 oldUser.MaritalStatusId,
//                 oldUser.DesignationId,
//                 oldUser.Email,
//                 oldUser.LoginName,
//                 oldUser.AltPhoneNumber,
//                 oldUser.DateOfJoining,


//                 // ====================================================
//                 // COMPANY
//                 // ====================================================

//                 oldCompany?.UserCompanyId ?? null,
//                 oldCompany?.CompanyId ?? null,
//                 oldCompany?.IsPrimaryCompany ?? null,


//                 // ====================================================
//                 // PRODUCT
//                 // ====================================================

//                 oldProduct?.UserProductId ?? null,
//                 oldProduct?.CompanyProductId ?? null,


//                 // ====================================================
//                 // PROJECT
//                 // ====================================================

//                 oldProject?.UserProjectId ?? null,
//                 oldProject?.ProjectId ?? null,
//                 oldProject?.IsPrimary ?? null,


//                 // ====================================================
//                 // REPORTING MANAGER
//                 // ====================================================

//                 oldReportingManager?.UserReportingManagerId ?? null,
//                 oldReportingManager?.ReportingManagerUserId ?? null,
//                 oldReportingManager?.CompanyId ?? null,


//                 // ====================================================
//                 // ROLE
//                 // ====================================================

//                 oldRole?.UserRoleId ?? null,
//                 oldRole?.RoleId ?? null,
//                 oldRole?.CompanyId ?? null,
//                 oldRole?.CompanyProductId ?? null,
//                 oldRole?.ProjectId ?? null,


//                 // ====================================================
//                 // USER WHO PERFORMED EDIT
//                 // ====================================================

//                 UserId
//             ]
//         );


//         // ============================================================
//         // 11. UPDATE DATA.User
//         // ============================================================

//         await client.query(
//             `
//             UPDATE "DATA"."User"
//             SET

//                 "EmployeeId" =
//                     COALESCE($1, "EmployeeId"),

//                 "FirstName" =
//                     COALESCE($2, "FirstName"),

//                 "MiddleName" =
//                     COALESCE($3, "MiddleName"),

//                 "LastName" =
//                     COALESCE($4, "LastName"),

//                 "PhoneNumber" =
//                     COALESCE($5, "PhoneNumber"),

//                 "DateOfBirth" =
//                     COALESCE($6, "DateOfBirth"),

//                 "GenderId" =
//                     COALESCE($7, "GenderId"),

//                 "MaritalStatusId" =
//                     COALESCE($8, "MaritalStatusId"),

//                 "DesignationId" =
//                     COALESCE($9, "DesignationId"),

//                 "Email" =
//                     COALESCE($10, "Email"),

//                 "LoginName" =
//                     COALESCE($11, "LoginName"),

//                 "AltPhoneNumber" =
//                     COALESCE($12, "AltPhoneNumber"),

//                 "DateOfJoining" =
//                     COALESCE($13, "DateOfJoining"),

//                 "UpdatedAt" =
//                     CURRENT_TIMESTAMP,

//                 "UpdatedByUserName" =
//                     COALESCE($14, "UpdatedByUserName")

//             WHERE "UserId" = $15;
//             `,
//             [
//                 employeeId,
//                 firstName,
//                 middleName,
//                 lastName,
//                 phoneNumber,
//                 dateOfBirth,
//                 genderId,
//                 maritalStatusId,
//                 designationId,
//                 email,
//                 loginName,
//                 altPhoneNumber,
//                 dateOfJoining,
//                 updatedByUserName,
//                 UserId
//             ]
//         );


//         // ============================================================
//         // 12. UPDATE DATA.UserCompany
//         // ============================================================

//         if (UserCompanyId) {

//             const result = await client.query(
//                 `
//                 UPDATE "DATA"."UserCompany"
//                 SET

//                     "CompanyId" =
//                         COALESCE($1, "CompanyId"),

//                     "IsPrimaryCompany" =
//                         COALESCE($2, "IsPrimaryCompany"),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE($3, "UpdatedByUserId")

//                 WHERE "UserCompanyId" = $4
//                 AND "UserId" = $5;
//                 `,
//                 [
//                     companyId,
//                     isPrimaryCompany,
//                     UserId,
//                     UserCompanyId,
//                     UserId
//                 ]
//             );

//             console.log(
//                 "UserCompany rowCount:",
//                 result.rowCount
//             );
//         }


//         // ============================================================
//         // 13. UPDATE DATA.UserProduct
//         // ============================================================

//         if (UserProductId) {

//             const result = await client.query(
//                 `
//                 UPDATE "DATA"."UserProduct"
//                 SET

//                     "CompanyProductId" =
//                         COALESCE($1, "CompanyProductId"),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE($2, "UpdatedByUserId")

//                 WHERE "UserProductId" = $3
//                 AND "UserId" = $4;
//                 `,
//                 [
//                     companyProductId,
//                     UserId,
//                     UserProductId,
//                     UserId
//                 ]
//             );

//             console.log(
//                 "UserProduct rowCount:",
//                 result.rowCount
//             );
//         }


//         // ============================================================
//         // 14. UPDATE DATA.UserProject
//         // ============================================================

//         if (UserProjectId) {

//             const result = await client.query(
//                 `
//                 UPDATE "DATA"."UserProject"
//                 SET

//                     "ProjectId" =
//                         COALESCE($1, "ProjectId"),

//                     "IsPrimary" =
//                         COALESCE($2, "IsPrimary"),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE($3, "UpdatedByUserId")

//                 WHERE "UserProjectId" = $4
//                 AND "UserId" = $5;
//                 `,
//                 [
//                     projectId,
//                     isPrimary,
//                     UserId,
//                     UserProjectId,
//                     UserId
//                 ]
//             );

//             console.log(
//                 "UserProject rowCount:",
//                 result.rowCount
//             );
//         }


//         // ============================================================
//         // 15. UPDATE DATA.UserRole
//         // ============================================================

//         if (UserRoleId) {

//             const result = await client.query(
//                 `
//                 UPDATE "DATA"."UserRole"
//                 SET

//                     "RoleId" =
//                         COALESCE($1, "RoleId"),

//                     "CompanyId" =
//                         COALESCE($2, "CompanyId"),

//                     "CompanyProductId" =
//                         COALESCE($3, "CompanyProductId"),

//                     "ProjectId" =
//                         COALESCE($4, "ProjectId"),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE($5, "UpdatedByUserId")

//                 WHERE "UserRoleId" = $6
//                 AND "UserId" = $7;
//                 `,
//                 [
//                     roleId,
//                     roleCompanyId,
//                     roleCompanyProductId,
//                     roleProjectId,
//                     UserId,
//                     UserRoleId,
//                     UserId
//                 ]
//             );

//             console.log(
//                 "UserRole rowCount:",
//                 result.rowCount
//             );
//         }


//         // ============================================================
//         // 16. UPDATE DATA.UserReportingManager
//         // ============================================================

//         if (UserReportingManagerId) {

//             const result = await client.query(
//                 `
//                 UPDATE "DATA"."UserReportingManager"
//                 SET

//                     "ReportingManagerUserId" =
//                         COALESCE(
//                             $1,
//                             "ReportingManagerUserId"
//                         ),

//                     "CompanyId" =
//                         COALESCE(
//                             $2,
//                             "CompanyId"
//                         ),

//                     "UpdatedAt" =
//                         CURRENT_TIMESTAMP,

//                     "UpdatedByUserId" =
//                         COALESCE(
//                             $3,
//                             "UpdatedByUserId"
//                         )

//                 WHERE "UserReportingManagerId" = $4
//                 AND "UserId" = $5;
//                 `,
//                 [
//                     reportingManagerUserId,
//                     reportingManagerCompanyId,
//                     UserId,
//                     UserReportingManagerId,
//                     UserId
//                 ]
//             );

//             console.log(
//                 "UserReportingManager rowCount:",
//                 result.rowCount
//             );
//         }


//         // ============================================================
//         // 17. COMMIT
//         // ============================================================

//         await client.query("COMMIT");


//         // ============================================================
//         // 18. RETURN SUCCESS
//         // ============================================================

//         return {
//             UserId,
//             UserDetailsId:
//                 historyResult.rows[0].UserDetailsId,
//             message:
//                 "User details updated successfully"
//         };


//     } catch (error) {

//         // ============================================================
//         // ROLLBACK
//         // ============================================================

//         await client.query("ROLLBACK");

//         console.error(
//             "Edit user transaction failed:",
//             error
//         );

//         throw error;

//     } finally {

//         client.release();
//     }
// };


// ======================================================
// GET ALL GENDERS
// ======================================================

export const editUserdetails = async ({
    UserId,

    // ============================================================
    // USER
    // ============================================================

    employeeId,
    firstName,
    middleName,
    lastName,
    phoneNumber,
    dateOfBirth,
    genderId,
    maritalStatusId,
    designationId,
    email,
    loginName,
    altPhoneNumber,
    dateOfJoining,
    updatedByUserName,

    // ============================================================
    // RELATIONSHIPS
    // ============================================================

    companies,
    products,
    projects,
    roles,
    reportingManagers

}) => {

    const client = await pool.connect();

    try {

        // ============================================================
        // 1. BEGIN TRANSACTION
        // ============================================================

        await client.query("BEGIN");


        // ============================================================
        // 2. FETCH OLD USER
        // ============================================================

        const userResult = await client.query(
            `
            SELECT
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
                "DateOfJoining"
            FROM "DATA"."User"
            WHERE "UserId" = $1
            FOR UPDATE;
            `,
            [UserId]
        );


        if (userResult.rows.length === 0) {
            throw new Error(
                `User with UserId ${UserId} not found`
            );
        }


        const oldUser = userResult.rows[0];


        // ============================================================
        // 3. FETCH OLD COMPANIES
        // ============================================================

        const oldCompaniesResult = await client.query(
            `
            SELECT
                "UserCompanyId",
                "UserId",
                "CompanyId",
                "IsPrimaryCompany"
            FROM "DATA"."UserCompany"
            WHERE "UserId" = $1
            FOR UPDATE;
            `,
            [UserId]
        );

        const oldCompanies = oldCompaniesResult.rows;


        // ============================================================
        // 4. FETCH OLD PRODUCTS
        // ============================================================

        const oldProductsResult = await client.query(
            `
            SELECT
                "UserProductId",
                "UserId",
                "CompanyProductId"
            FROM "DATA"."UserProduct"
            WHERE "UserId" = $1
            FOR UPDATE;
            `,
            [UserId]
        );

        const oldProducts = oldProductsResult.rows;


        // ============================================================
        // 5. FETCH OLD PROJECTS
        // ============================================================

        const oldProjectsResult = await client.query(
            `
            SELECT
                "UserProjectId",
                "UserId",
                "ProjectId",
                "IsPrimary"
            FROM "DATA"."UserProject"
            WHERE "UserId" = $1
            FOR UPDATE;
            `,
            [UserId]
        );

        const oldProjects = oldProjectsResult.rows;


        // ============================================================
        // 6. FETCH OLD ROLES
        // ============================================================

        const oldRolesResult = await client.query(
            `
            SELECT
                "UserRoleId",
                "UserId",
                "RoleId",
                "CompanyId",
                "CompanyProductId",
                "ProjectId"
            FROM "DATA"."UserRole"
            WHERE "UserId" = $1
            FOR UPDATE;
            `,
            [UserId]
        );

        const oldRoles = oldRolesResult.rows;


        // ============================================================
        // 7. FETCH OLD REPORTING MANAGERS
        // ============================================================

        const oldManagersResult = await client.query(
            `
            SELECT
                "UserReportingManagerId",
                "UserId",
                "ReportingManagerUserId",
                "CompanyId"
            FROM "DATA"."UserReportingManager"
            WHERE "UserId" = $1
            FOR UPDATE;
            `,
            [UserId]
        );

        const oldManagers = oldManagersResult.rows;


        // ============================================================
        // 8. CHECK USER FIELD CHANGES
        // ============================================================

        let hasChanges = false;


        if (
            employeeId !== undefined &&
            employeeId !== oldUser.EmployeeId
        ) {
            hasChanges = true;
        }


        if (
            firstName !== undefined &&
            firstName !== oldUser.FirstName
        ) {
            hasChanges = true;
        }


        if (
            middleName !== undefined &&
            middleName !== oldUser.MiddleName
        ) {
            hasChanges = true;
        }


        if (
            lastName !== undefined &&
            lastName !== oldUser.LastName
        ) {
            hasChanges = true;
        }


        if (
            phoneNumber !== undefined &&
            phoneNumber !== oldUser.PhoneNumber
        ) {
            hasChanges = true;
        }


        if (
            dateOfBirth !== undefined &&
            dateOfBirth !== oldUser.DateOfBirth
        ) {
            hasChanges = true;
        }


        if (
            genderId !== undefined &&
            Number(genderId) !== Number(oldUser.GenderId)
        ) {
            hasChanges = true;
        }


        if (
            maritalStatusId !== undefined &&
            Number(maritalStatusId) !==
            Number(oldUser.MaritalStatusId)
        ) {
            hasChanges = true;
        }


        if (
            designationId !== undefined &&
            Number(designationId) !==
            Number(oldUser.DesignationId)
        ) {
            hasChanges = true;
        }


        if (
            email !== undefined &&
            email !== oldUser.Email
        ) {
            hasChanges = true;
        }


        if (
            loginName !== undefined &&
            loginName !== oldUser.LoginName
        ) {
            hasChanges = true;
        }


        if (
            altPhoneNumber !== undefined &&
            altPhoneNumber !== oldUser.AltPhoneNumber
        ) {
            hasChanges = true;
        }


        if (
            dateOfJoining !== undefined &&
            dateOfJoining !== oldUser.DateOfJoining
        ) {
            hasChanges = true;
        }


        // ============================================================
        // 9. CHECK COMPANY CHANGES
        // ============================================================

        const oldCompanyMap = new Map(
            oldCompanies.map(row => [
                Number(row.UserCompanyId),
                row
            ])
        );


        for (const company of companies || []) {

            const old = oldCompanyMap.get(
                Number(company.UserCompanyId)
            );


            if (!old) {
                throw new Error(
                    `UserCompanyId ${company.UserCompanyId} not found for UserId ${UserId}`
                );
            }


            if (
                company.companyId !== undefined &&
                Number(company.companyId) !==
                Number(old.CompanyId)
            ) {
                hasChanges = true;
            }


            if (
                company.isPrimaryCompany !== undefined &&
                company.isPrimaryCompany !==
                old.IsPrimaryCompany
            ) {
                hasChanges = true;
            }
        }


        // ============================================================
        // 10. CHECK PRODUCT CHANGES
        // ============================================================

        const oldProductMap = new Map(
            oldProducts.map(row => [
                Number(row.UserProductId),
                row
            ])
        );


        for (const product of products || []) {

            const old = oldProductMap.get(
                Number(product.UserProductId)
            );


            if (!old) {
                throw new Error(
                    `UserProductId ${product.UserProductId} not found for UserId ${UserId}`
                );
            }


            if (
                product.companyProductId !== undefined &&
                Number(product.companyProductId) !==
                Number(old.CompanyProductId)
            ) {
                hasChanges = true;
            }
        }


        // ============================================================
        // 11. CHECK PROJECT CHANGES
        // ============================================================

        const oldProjectMap = new Map(
            oldProjects.map(row => [
                Number(row.UserProjectId),
                row
            ])
        );


        for (const project of projects || []) {

            const old = oldProjectMap.get(
                Number(project.UserProjectId)
            );


            if (!old) {
                throw new Error(
                    `UserProjectId ${project.UserProjectId} not found for UserId ${UserId}`
                );
            }


            if (
                project.projectId !== undefined &&
                Number(project.projectId) !==
                Number(old.ProjectId)
            ) {
                hasChanges = true;
            }


            if (
                project.isPrimary !== undefined &&
                project.isPrimary !== old.IsPrimary
            ) {
                hasChanges = true;
            }
        }


        // ============================================================
        // 12. CHECK ROLE CHANGES
        // ============================================================

        const oldRoleMap = new Map(
            oldRoles.map(row => [
                Number(row.UserRoleId),
                row
            ])
        );


        for (const role of roles || []) {

            const old = oldRoleMap.get(
                Number(role.UserRoleId)
            );


            if (!old) {
                throw new Error(
                    `UserRoleId ${role.UserRoleId} not found for UserId ${UserId}`
                );
            }


            if (
                role.roleId !== undefined &&
                Number(role.roleId) !==
                Number(old.RoleId)
            ) {
                hasChanges = true;
            }


            if (
                role.roleCompanyId !== undefined &&
                Number(role.roleCompanyId) !==
                Number(old.CompanyId)
            ) {
                hasChanges = true;
            }


            if (
                role.roleCompanyProductId !== undefined &&
                Number(role.roleCompanyProductId) !==
                Number(old.CompanyProductId)
            ) {
                hasChanges = true;
            }


            if (
                role.roleProjectId !== undefined &&
                Number(role.roleProjectId) !==
                Number(old.ProjectId)
            ) {
                hasChanges = true;
            }
        }


        // ============================================================
        // 13. CHECK REPORTING MANAGER CHANGES
        // ============================================================

        const oldManagerMap = new Map(
            oldManagers.map(row => [
                Number(row.UserReportingManagerId),
                row
            ])
        );


        for (const manager of reportingManagers || []) {

            const old = oldManagerMap.get(
                Number(manager.UserReportingManagerId)
            );


            if (!old) {
                throw new Error(
                    `UserReportingManagerId ${manager.UserReportingManagerId} not found for UserId ${UserId}`
                );
            }


            if (
                manager.reportingManagerUserId !== undefined &&
                Number(manager.reportingManagerUserId) !==
                Number(old.ReportingManagerUserId)
            ) {
                hasChanges = true;
            }


            if (
                manager.reportingManagerCompanyId !== undefined &&
                Number(manager.reportingManagerCompanyId) !==
                Number(old.CompanyId)
            ) {
                hasChanges = true;
            }
        }


        // ============================================================
        // 14. NOTHING CHANGED
        // ============================================================

        if (!hasChanges) {

            await client.query("ROLLBACK");

            return {
                UserId,
                message: "No changes detected"
            };
        }


        // ============================================================
        // 15. GET OLD RELATED RECORDS
        //
        // Your UserDetails table has only one column for each
        // related table, so we use the first existing old record.
        // ============================================================

        const oldCompany =
            oldCompanies.length > 0
                ? oldCompanies[0]
                : null;

        const oldProduct =
            oldProducts.length > 0
                ? oldProducts[0]
                : null;

        const oldProject =
            oldProjects.length > 0
                ? oldProjects[0]
                : null;

        const oldRole =
            oldRoles.length > 0
                ? oldRoles[0]
                : null;

        const oldManager =
            oldManagers.length > 0
                ? oldManagers[0]
                : null;


        // ============================================================
        // 16. INSERT COMPLETE OLD RECORD
        //
        // ONLY ONE ROW IS INSERTED INTO UserDetails
        // ============================================================

        const historyResult = await client.query(
            `
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

                "RoleId",
                "ReportingManagerUserId",

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
                $21,

                CURRENT_TIMESTAMP,
                $22
            )
            RETURNING "UserDetailsId";
            `,
            [
                // ========================================================
                // OLD USER DATA
                // ========================================================

                oldUser.UserId,
                oldUser.EmployeeId,
                oldUser.FirstName,
                oldUser.MiddleName,
                oldUser.LastName,
                oldUser.PhoneNumber,
                oldUser.DateOfBirth,
                oldUser.GenderId,
                oldUser.MaritalStatusId,
                oldUser.DesignationId,
                oldUser.Email,
                oldUser.LoginName,
                oldUser.AltPhoneNumber,
                oldUser.DateOfJoining,

                // ========================================================
                // OLD COMPANY
                // ========================================================

                oldCompany
                    ? oldCompany.UserCompanyId
                    : null,

                // ========================================================
                // OLD PRODUCT
                // ========================================================

                oldProduct
                    ? oldProduct.UserProductId
                    : null,

                // ========================================================
                // OLD PROJECT
                // ========================================================

                oldProject
                    ? oldProject.UserProjectId
                    : null,

                // ========================================================
                // OLD REPORTING MANAGER
                // ========================================================

                oldManager
                    ? oldManager.UserReportingManagerId
                    : null,

                // ========================================================
                // OLD ROLE
                // ========================================================

                oldRole
                    ? oldRole.UserRoleId
                    : null,

                // ========================================================
                // OLD ROLE ID
                // ========================================================

                oldRole
                    ? oldRole.RoleId
                    : null,

                // ========================================================
                // OLD REPORTING MANAGER USER ID
                // ========================================================

                oldManager
                    ? oldManager.ReportingManagerUserId
                    : null,

                // ========================================================
                // USER WHO PERFORMED EDIT
                // ========================================================

                UserId
            ]
        );


        const userDetailsId =
            historyResult.rows[0].UserDetailsId;


        // ============================================================
        // 16. INSERT ALL OLD COMPANIES
        // ============================================================

        for (const old of oldCompanies) {

            await client.query(
                `
                INSERT INTO "DATA"."UserDetails"
                (
                    "UserId",
                    "UserCompanyId",
                    
                    
                    "CreatedAt",
                    "CreatedByUserId"
                )
                VALUES
                (
                    $1,$2,
                    CURRENT_TIMESTAMP,
                    $3
                );
                `,
                [
                    old.UserId,
                    old.UserCompanyId,

                    UserId
                ]
            );
        }


        // ============================================================
        // 17. INSERT ALL OLD PRODUCTS
        // ============================================================

        for (const old of oldProducts) {

            await client.query(
                `
                INSERT INTO "DATA"."UserDetails"
                (
                    "UserId",
                    "UserProductId",
                    
                    "CreatedAt",
                    "CreatedByUserId"
                )
                VALUES
                (
                    $1,$2,
                    CURRENT_TIMESTAMP,
                    $3
                );
                `,
                [
                    old.UserId,
                    old.UserProductId,
                   
                    UserId
                ]
            );
        }


        // ============================================================
        // 18. INSERT ALL OLD PROJECTS
        // ============================================================

        for (const old of oldProjects) {

            await client.query(
                `
                INSERT INTO "DATA"."UserDetails"
                (
                    "UserId",
                    "UserProjectId",
                    
                    
                    "CreatedAt",
                    "CreatedByUserId"
                )
                VALUES
                (
                    $1,$2,
                    CURRENT_TIMESTAMP,
                    $3
                );
                `,
                [
                    old.UserId,
                    old.UserProjectId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 19. INSERT ALL OLD ROLES
        // ============================================================

        for (const old of oldRoles) {

            await client.query(
                `
                INSERT INTO "DATA"."UserDetails"
                (
                    "UserId",
                    "UserRoleId",
                    "RoleId",
                    "CreatedAt",
                    "CreatedByUserId"
                )
                VALUES
                (
                    $1,$2,$3,
                    CURRENT_TIMESTAMP,
                    $4
                );
                `,
                [
                    old.UserId,
                    old.UserRoleId,
                    old.RoleId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 20. INSERT ALL OLD REPORTING MANAGERS
        // ============================================================

        for (const old of oldManagers) {

            await client.query(
                `
                INSERT INTO "DATA"."UserDetails"
                (
                    "UserId",
                    "UserReportingManagerId",
                    "ReportingManagerUserId",
                    
                    "CreatedAt",
                    "CreatedByUserId"
                )
                VALUES
                (
                    $1,$2,$3,
                    CURRENT_TIMESTAMP,
                    $4
                );
                `,
                [
                    old.UserId,
                    old.UserReportingManagerId,
                    
                    old.CompanyId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 21. UPDATE DATA.User
        // ============================================================

        await client.query(
            `
            UPDATE "DATA"."User"
            SET
                "EmployeeId" =
                    COALESCE(
                        $1,
                        "EmployeeId"
                    ),

                "FirstName" =
                    COALESCE(
                        $2,
                        "FirstName"
                    ),

                "MiddleName" =
                    COALESCE(
                        $3,
                        "MiddleName"
                    ),

                "LastName" =
                    COALESCE(
                        $4,
                        "LastName"
                    ),

                "PhoneNumber" =
                    COALESCE(
                        $5,
                        "PhoneNumber"
                    ),

                "DateOfBirth" =
                    COALESCE(
                        $6,
                        "DateOfBirth"
                    ),

                "GenderId" =
                    COALESCE(
                        $7,
                        "GenderId"
                    ),

                "MaritalStatusId" =
                    COALESCE(
                        $8,
                        "MaritalStatusId"
                    ),

                "DesignationId" =
                    COALESCE(
                        $9,
                        "DesignationId"
                    ),

                "Email" =
                    COALESCE(
                        $10,
                        "Email"
                    ),

                "LoginName" =
                    COALESCE(
                        $11,
                        "LoginName"
                    ),

                "AltPhoneNumber" =
                    COALESCE(
                        $12,
                        "AltPhoneNumber"
                    ),

                "DateOfJoining" =
                    COALESCE(
                        $13,
                        "DateOfJoining"
                    ),

                "UpdatedAt" =
                    CURRENT_TIMESTAMP,

                "UpdatedByUserName" =
                    COALESCE(
                        $14,
                        "UpdatedByUserName"
                    )

            WHERE "UserId" = $15;
            `,
            [
                employeeId,
                firstName,
                middleName,
                lastName,
                phoneNumber,
                dateOfBirth,
                genderId,
                maritalStatusId,
                designationId,
                email,
                loginName,
                altPhoneNumber,
                dateOfJoining,
                updatedByUserName,
                UserId
            ]
        );


        // ============================================================
        // 18. UPDATE COMPANIES
        // ============================================================

        for (const company of companies || []) {

            await client.query(
                `
                UPDATE "DATA"."UserCompany"
                SET
                    "CompanyId" =
                        COALESCE(
                            $1,
                            "CompanyId"
                        ),

                    "IsPrimaryCompany" =
                        COALESCE(
                            $2,
                            "IsPrimaryCompany"
                        ),

                    "UpdatedAt" =
                        CURRENT_TIMESTAMP,

                    "UpdatedByUserId" =
                        $3

                WHERE "UserCompanyId" = $4
                AND "UserId" = $5;
                `,
                [
                    company.companyId,
                    company.isPrimaryCompany,
                    UserId,
                    company.UserCompanyId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 19. UPDATE PRODUCTS
        // ============================================================

        for (const product of products || []) {

            await client.query(
                `
                UPDATE "DATA"."UserProduct"
                SET
                    "CompanyProductId" =
                        COALESCE(
                            $1,
                            "CompanyProductId"
                        ),

                    "UpdatedAt" =
                        CURRENT_TIMESTAMP,

                    "UpdatedByUserId" =
                        $2

                WHERE "UserProductId" = $3
                AND "UserId" = $4;
                `,
                [
                    product.companyProductId,
                    UserId,
                    product.UserProductId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 20. UPDATE PROJECTS
        // ============================================================

        for (const project of projects || []) {

            await client.query(
                `
                UPDATE "DATA"."UserProject"
                SET
                    "ProjectId" =
                        COALESCE(
                            $1,
                            "ProjectId"
                        ),

                    "IsPrimary" =
                        COALESCE(
                            $2,
                            "IsPrimary"
                        ),

                    "UpdatedAt" =
                        CURRENT_TIMESTAMP,

                    "UpdatedByUserId" =
                        $3

                WHERE "UserProjectId" = $4
                AND "UserId" = $5;
                `,
                [
                    project.projectId,
                    project.isPrimary,
                    UserId,
                    project.UserProjectId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 21. UPDATE ROLES
        // ============================================================

        for (const role of roles || []) {

            await client.query(
                `
                UPDATE "DATA"."UserRole"
                SET
                    "RoleId" =
                        COALESCE(
                            $1,
                            "RoleId"
                        ),

                    "CompanyId" =
                        COALESCE(
                            $2,
                            "CompanyId"
                        ),

                    "CompanyProductId" =
                        COALESCE(
                            $3,
                            "CompanyProductId"
                        ),

                    "ProjectId" =
                        COALESCE(
                            $4,
                            "ProjectId"
                        ),

                    "UpdatedAt" =
                        CURRENT_TIMESTAMP,

                    "UpdatedByUserId" =
                        $5

                WHERE "UserRoleId" = $6
                AND "UserId" = $7;
                `,
                [
                    role.roleId,
                    role.roleCompanyId,
                    role.roleCompanyProductId,
                    role.roleProjectId,
                    UserId,
                    role.UserRoleId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 22. UPDATE REPORTING MANAGERS
        // ============================================================

        for (const manager of reportingManagers || []) {

            await client.query(
                `
                UPDATE "DATA"."UserReportingManager"
                SET
                    "ReportingManagerUserId" =
                        COALESCE(
                            $1,
                            "ReportingManagerUserId"
                        ),

                    "CompanyId" =
                        COALESCE(
                            $2,
                            "CompanyId"
                        ),

                    "UpdatedAt" =
                        CURRENT_TIMESTAMP,

                    "UpdatedByUserId" =
                        $3

                WHERE "UserReportingManagerId" = $4
                AND "UserId" = $5;
                `,
                [
                    manager.reportingManagerUserId,
                    manager.reportingManagerCompanyId,
                    UserId,
                    manager.UserReportingManagerId,
                    UserId
                ]
            );
        }


        // ============================================================
        // 23. COMMIT
        // ============================================================

        await client.query("COMMIT");


        return {
            UserId,
            UserDetailsId: userDetailsId,
            message: "User details updated successfully"
        };


    } catch (error) {

        await client.query("ROLLBACK");

      
        throw error;

    } finally {

        client.release();

    }
};



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



export const toggleUserStatuses = async (userData) => {

    try {

        const query = `
            UPDATE "DATA"."User"
            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $2
            WHERE "UserId" = $3
            RETURNING *;
        `;

        const values = [
            userData.IsDisabled,
            userData.UpdatedByUserName,
            userData.UserId
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        // console.error("Error toggling user status:", error);

        throw error;
    }
};





export const changeUserPassword = async ({
    UserId,
    NewPassword,
    HashedPassword,
    UpdatedByUserId
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Get the current user password
        const userResult = await client.query(
            `SELECT "UserId", "Password"
             FROM "DATA"."User"
             WHERE "UserId" = $1
             FOR UPDATE`,
            [UserId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return {
                success: false,
                status: 404,
                message: "User not found"
            };
        }

        const user = userResult.rows[0];

        // 2. Check whether the new password is the current password
        if (user.Password) {
            const isCurrentPassword = await bcrypt.compare(
                NewPassword,
                user.Password
            );

            if (isCurrentPassword) {
                await client.query("ROLLBACK");

                return {
                    success: false,
                    status: 409,
                    message: "New password must be different from the current password"
                };
            }
        }

        // 3. Get previous password history
        const historyResult = await client.query(
            `SELECT "HashedPassword"
             FROM "TRACK"."SecretPassword"
             WHERE "UserId" = $1`,
            [UserId]
        );

        // 4. Prevent reuse of previously used passwords
        for (const history of historyResult.rows) {
            if (!history.HashedPassword) {
                continue;
            }

            const isUsedPassword = await bcrypt.compare(
                NewPassword,
                history.HashedPassword
            );

            if (isUsedPassword) {
                await client.query("ROLLBACK");

                return {
                    success: false,
                    status: 409,
                    message: "This password has already been used"
                };
            }
        }

        // 5. Update the current password
       await client.query(
    `UPDATE "DATA"."User"
     SET "Password" = $1,
         "PasswordChangedOn" = CURRENT_TIMESTAMP,
         "UpdatedAt" = CURRENT_TIMESTAMP
     WHERE "UserId" = $2`,
    [HashedPassword, UserId]
);

        // 6. Save the new password hash in password history
       await client.query(
    `INSERT INTO "TRACK"."SecretPassword"
    (
        "UserId",
        "PlainPassword",
        "HashedPassword",
        "CreatedByUserId",
        "UpdatedByUserId",
        "UpdatedAt"
    )
    VALUES ($1, $2, $3, $4, $4, CURRENT_TIMESTAMP)`,
    [UserId, NewPassword, HashedPassword, UpdatedByUserId ?? UserId]
);

        await client.query("COMMIT");

        return {
            success: true,
            status: 200,
            message: "Password changed successfully"
        };

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Change User Password Model Error:", error);
        throw error;

    } finally {
        client.release();
    }
};
