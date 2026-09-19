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
    updatedByUserName
}) => {

    const query = `
        UPDATE "DATA"."User"
        SET
            "EmployeeId" = COALESCE($1, "EmployeeId"),
            "FirstName" = COALESCE($2, "FirstName"),
            "MiddleName" = COALESCE($3, "MiddleName"),
            "LastName" = COALESCE($4, "LastName"),
            "PhoneNumber" = COALESCE($5, "PhoneNumber"),
            "DateOfBirth" = COALESCE($6, "DateOfBirth"),
            "GenderId" = COALESCE($7, "GenderId"),
            "MaritalStatusId" = COALESCE($8, "MaritalStatusId"),
            "DesignationId" = COALESCE($9, "DesignationId"),
            "Email" = COALESCE($10, "Email"),
            "LoginName" = COALESCE($11, "LoginName"),
            "AltPhoneNumber" = COALESCE($12, "AltPhoneNumber"),
            "DateOfJoining" = COALESCE($13, "DateOfJoining"),
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = COALESCE($14, "UpdatedByUserName")

        WHERE "UserId" = $15

        RETURNING 
        "UserId",
        "FirstName";
    `;

    const values = [
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
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};





