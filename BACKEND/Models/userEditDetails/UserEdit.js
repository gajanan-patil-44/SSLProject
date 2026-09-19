import { pool } from "../../Config/db.js";

export const getAllUserDetails = async () => {
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
                WHERE urm."UserReportingManagerId" IS NOT NULL
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

    

    GROUP BY
        u."UserId",
        u."EmployeeId",
        u."FirstName",
        u."MiddleName",
        u."LastName",
        u."Email",
        u."LoginName";

`;
        const result = await pool.query(query);
        return result.rows
    } catch (error) {
        throw error
    }
}


export const editUserdetails = async ({
    UserId,

    
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

    
    UserCompanyId,
    companyId,
    isPrimaryCompany,

   
    UserProductId,
    companyProductId,

    
    UserProjectId,
    projectId,
    isPrimary,

    
    UserRoleId,
    roleId,
    roleCompanyId,
    roleCompanyProductId,
    roleProjectId,

    
    UserReportingManagerId,
    reportingManagerUserId,
    reportingManagerCompanyId
}) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const userQuery = `
            UPDATE "DATA"."User"
            SET
                "EmployeeId" =
                    COALESCE($1, "EmployeeId"),

                "FirstName" =
                    COALESCE($2, "FirstName"),

                "MiddleName" =
                    COALESCE($3, "MiddleName"),

                "LastName" =
                    COALESCE($4, "LastName"),

                "PhoneNumber" =
                    COALESCE($5, "PhoneNumber"),

                "DateOfBirth" =
                    COALESCE($6, "DateOfBirth"),

                "GenderId" =
                    COALESCE($7, "GenderId"),

                "MaritalStatusId" =
                    COALESCE($8, "MaritalStatusId"),

                "DesignationId" =
                    COALESCE($9, "DesignationId"),

                "Email" =
                    COALESCE($10, "Email"),

                "LoginName" =
                    COALESCE($11, "LoginName"),

                "AltPhoneNumber" =
                    COALESCE($12, "AltPhoneNumber"),

                "DateOfJoining" =
                    COALESCE($13, "DateOfJoining"),

                "UpdatedAt" =
                    CURRENT_TIMESTAMP,

                "UpdatedByUserName" =
                    COALESCE($14, "UpdatedByUserName")

            WHERE "UserId" = $15

            RETURNING
                "UserId",
                "FirstName";
        `;


        await client.query(
            userQuery,
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


        if (UserCompanyId) {

            const userCompanyQuery = `
                UPDATE "DATA"."UserCompany"
                SET
                    "CompanyId" =
                        COALESCE($1, "CompanyId"),

                    "IsPrimaryCompany" =
                        COALESCE($2, "IsPrimaryCompany"),

                    "UpdatedAt" =
                        CURRENT_TIMESTAMP,

                    "UpdatedByUserId" =
                        COALESCE(
                            $3,
                            "UpdatedByUserId"
                        )

                WHERE "UserCompanyId" = $4
                AND "UserId" = $5;
            `;


            await client.query(
                userCompanyQuery,
                [
                    companyId,
                    isPrimaryCompany,
                    UserId,
                    UserCompanyId,
                    UserId
                ]
            );
        }


       

        if (UserProductId) {

            const userProductQuery = `
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
                        COALESCE(
                            $2,
                            "UpdatedByUserId"
                        )

                WHERE "UserProductId" = $3
                AND "UserId" = $4;
            `;


            await client.query(
                userProductQuery,
                [
                    companyProductId,
                    UserId,
                    UserProductId,
                    UserId
                ]
            );
        }


        if (UserProjectId) {

            const userProjectQuery = `
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
                        COALESCE(
                            $3,
                            "UpdatedByUserId"
                        )

                WHERE "UserProjectId" = $4
                AND "UserId" = $5;
            `;


            await client.query(
                userProjectQuery,
                [
                    projectId,
                    isPrimary,
                    UserId,
                    UserProjectId,
                    UserId
                ]
            );
        }


        if (UserRoleId) {

            const userRoleQuery = `
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
                        COALESCE(
                            $5,
                            "UpdatedByUserId"
                        )

                WHERE "UserRoleId" = $6
                AND "UserId" = $7;
            `;


            await client.query(
                userRoleQuery,
                [
                    roleId,
                    roleCompanyId,
                    roleCompanyProductId,
                    roleProjectId,
                    UserId,
                    UserRoleId,
                    UserId
                ]
            );
        }


       
        if (UserReportingManagerId) {

            const reportingManagerQuery = `
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
                        COALESCE(
                            $3,
                            "UpdatedByUserId"
                        )

                WHERE "UserReportingManagerId" = $4
                AND "UserId" = $5;
            `;


            await client.query(
                reportingManagerQuery,
                [
                    reportingManagerUserId,
                    reportingManagerCompanyId,
                    UserId,
                    UserReportingManagerId,
                    UserId
                ]
            );
        }


       

        await client.query("COMMIT");


        return {
            UserId
        };


    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
};





