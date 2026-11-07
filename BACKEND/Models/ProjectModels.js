import { pool } from "../Config/db.js";


// GET ALL PROJECTS


export const getAllProjects = async (CompanyId) => {

    const query = `
        SELECT
            PR."ProjectId",
            PR."CompanyProductId",

            C."CompanyId",
            C."CompanyName",

            P."ProductId",
            P."ProductName",
            P."ProductCode",

            PR."ProjectName",
            PR."ProjectCode",
            PR."Description",
            PR."IsDisabled",
            PR."CreatedAt",
            PR."UpdatedAt",
            PR."CreatedByUserId",
            PR."UpdatedByUserId"

        FROM "LKP"."Project" PR

        INNER JOIN "LKP"."CompanyProduct" CP
            ON PR."CompanyProductId" = CP."CompanyProductId"

        INNER JOIN "LKP"."Company" C
            ON CP."CompanyId" = C."CompanyId"

        INNER JOIN "LKP"."Product" P
            ON CP."ProductId" = P."ProductId"

        WHERE
            ($1::SMALLINT IS NULL OR C."CompanyId" = $1)

        ORDER BY
            PR."CreatedAt" DESC;
    `;

    const result = await pool.query(query, [CompanyId]);

    return result.rows;
};



// GET COMPANY PRODUCTS FOR DROPDOWN


export const getCompanyProductsForDropdown = async (CompanyId) => {

    const query = `
        SELECT
            CP."CompanyProductId",
            CP."CompanyId",
            C."CompanyName",
            CP."ProductId",
            P."ProductName",
            P."ProductCode",

            CONCAT(
                C."CompanyName",
                ' - ',
                P."ProductName"
            ) AS "CompanyProductName"

        FROM "LKP"."CompanyProduct" CP

        INNER JOIN "LKP"."Company" C
            ON CP."CompanyId" = C."CompanyId"

        INNER JOIN "LKP"."Product" P
            ON CP."ProductId" = P."ProductId"

        WHERE
            CP."IsDisabled" = false
            AND C."IsDisabled" = false
            AND P."IsDisabled" = false
            AND ($1::SMALLINT IS NULL OR CP."CompanyId" = $1)

        ORDER BY
            C."CompanyName",
            P."ProductName";
    `;

    const result = await pool.query(query, [CompanyId]);

    return result.rows;
};


// CHECK COMPANY PRODUCT EXISTS AND ACTIVE


export const checkCompanyProductExists = async (
    CompanyProductId,
    CompanyId
) => {

    const query = `
        SELECT
            CP."CompanyProductId",
            CP."CompanyId",
            CP."ProductId"

        FROM "LKP"."CompanyProduct" CP

        INNER JOIN "LKP"."Company" C
            ON CP."CompanyId" = C."CompanyId"

        INNER JOIN "LKP"."Product" P
            ON CP."ProductId" = P."ProductId"

        WHERE
            CP."CompanyProductId" = $1
            AND CP."IsDisabled" = false
            AND C."IsDisabled" = false
            AND P."IsDisabled" = false
            AND ($2::SMALLINT IS NULL OR CP."CompanyId" = $2)

        LIMIT 1;
    `;

    const result = await pool.query(query, [
        CompanyProductId,
        CompanyId
    ]);

    return result.rows;
};



// GET PROJECT BY ID


export const getProjectById = async (ProjectId, CompanyId) => {

    const query = `
        SELECT
            PR."ProjectId",
            PR."CompanyProductId",
            CP."CompanyId",
            PR."ProjectName",
            PR."ProjectCode",
            PR."IsDisabled",
            PR."Description"

        FROM "LKP"."Project" PR

        INNER JOIN "LKP"."CompanyProduct" CP
            ON PR."CompanyProductId" = CP."CompanyProductId"

        WHERE
            PR."ProjectId" = $1
            AND ($2::SMALLINT IS NULL OR CP."CompanyId" = $2);
    `;

    const result = await pool.query(query, [
        ProjectId,
        CompanyId
    ]);

    return result.rows;
};



// CHECK PROJECT FOR ADD


export const checkProjectExists = async (
    CompanyProductId,
    ProjectName,
    ProjectCode
) => {

    const query = `
        SELECT
            "ProjectId",
            "CompanyProductId",
            "ProjectName",
            "ProjectCode"

        FROM "LKP"."Project"

        WHERE
            "CompanyProductId" = $1
            AND (
                LOWER(TRIM("ProjectName")) = LOWER(TRIM($2))
                OR LOWER(TRIM("ProjectCode")) = LOWER(TRIM($3))
            );
    `;

    const result = await pool.query(query, [
        CompanyProductId,
        ProjectName,
        ProjectCode
    ]);

    return result.rows;
};



// ADD PROJECT

export const addProject = async (projectData) => {

    try {

        const query = `
            INSERT INTO "LKP"."Project"
            (
                "CompanyProductId",
                "ProjectName",
                "ProjectCode",
                "IsDisabled",
                "Description",
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
                "ProjectId",
                "CompanyProductId",
                "ProjectName",
                "ProjectCode",
                "IsDisabled",
                "Description",
                "CreatedAt",
                "CreatedByUserId";
        `;

        const values = [
            projectData.CompanyProductId,
            projectData.ProjectName,
            projectData.ProjectCode,
            projectData.IsDisabled,
            projectData.Description,
            projectData.CreatedByUserId
        ];

        const result = await pool.query(
                query,
                values
            );


        return result.rows[0];

    } catch (error) {

        throw error;
    }
};



// CHECK PROJECT FOR UPDATE


export const checkProjectExistsForUpdate = async (
    CompanyProductId,
    ProjectName,
    ProjectCode,
    ProjectId,
    CompanyId
) => {

    const query = `
        SELECT
            PR."ProjectId",
            PR."CompanyProductId",
            PR."ProjectName",
            PR."ProjectCode"

        FROM "LKP"."Project" PR

        INNER JOIN "LKP"."CompanyProduct" CP
            ON PR."CompanyProductId" = CP."CompanyProductId"

        WHERE
            PR."CompanyProductId" = $1
            AND PR."ProjectId" <> $4
            AND ($5::SMALLINT IS NULL OR CP."CompanyId" = $5)
            AND (
                LOWER(TRIM(PR."ProjectName")) = LOWER(TRIM($2))
                OR LOWER(TRIM(PR."ProjectCode")) = LOWER(TRIM($3))
            );
    `;

    const result = await pool.query(query, [
        CompanyProductId,
        ProjectName,
        ProjectCode,
        ProjectId,
        CompanyId
    ]);

    return result.rows;
};


// EDIT PROJECT


export const editProject = async (projectData) => {

    const query = `
        UPDATE "LKP"."Project" PR

        SET
            "CompanyProductId" = $1,
            "ProjectName" = $2,
            "ProjectCode" = $3,
            "IsDisabled" = $4,
            "Description" = $5,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserId" = $6

        WHERE
            PR."ProjectId" = $7

            AND EXISTS (
                SELECT 1
                FROM "LKP"."CompanyProduct" CP
                WHERE CP."CompanyProductId" = PR."CompanyProductId"
                  AND ($8::SMALLINT IS NULL OR CP."CompanyId" = $8)
            )

            AND EXISTS (
                SELECT 1
                FROM "LKP"."CompanyProduct" NEWCP
                WHERE NEWCP."CompanyProductId" = $1
                  AND ($8::SMALLINT IS NULL OR NEWCP."CompanyId" = $8)
            );
    `;

    const values = [
        projectData.CompanyProductId,
        projectData.ProjectName,
        projectData.ProjectCode,
        projectData.IsDisabled,
        projectData.Description,
        projectData.UpdatedByUserId,
        projectData.ProjectId,
        projectData.CompanyId
    ];

    const result = await pool.query(query, values);

    return result.rowCount;
};



// TOGGLE PROJECT STATUS

export const toggleProjectStatuses = async (projectData) => {

    try {

        const query = `
            UPDATE "LKP"."Project"

            SET
                "IsDisabled" = $1,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserId" = $2

            WHERE
                "ProjectId" = $3

            RETURNING
                "ProjectId",
                "CompanyProductId",
                "ProjectName",
                "ProjectCode",
                "IsDisabled",
                "Description",
                "UpdatedAt",
                "UpdatedByUserId";
        `;

        const values = [
            projectData.IsDisabled,
            projectData.UpdatedByUserId,
            projectData.ProjectId
        ];

        const result = await pool.query(
                query,
                values
            );


        return result.rows[0];

    } catch (error) {

        throw error;
    }
};


// DELETE PROJECT

export const deleteProject = async (ProjectId) => {

    try {

        const query = `
            DELETE FROM "LKP"."Project"

            WHERE
                "ProjectId" = $1;
        `;

        const values = [ProjectId];

        const result = await pool.query(
                query,
                values
            );


        return result.rowCount;

    } catch (error) {

        throw error;
    }
};