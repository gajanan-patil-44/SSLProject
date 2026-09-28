import { pool } from "../Config/db.js";


// GET ALL PROJECTS

export const getAllProjects = async () => {

    try {

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
                ON PR."CompanyProductId" =
                   CP."CompanyProductId"

            INNER JOIN "LKP"."Company" C
                ON CP."CompanyId" =
                   C."CompanyId"

            INNER JOIN "LKP"."Product" P
                ON CP."ProductId" =
                   P."ProductId"

            ORDER BY
                PR."CreatedAt" DESC;
        `;


        const result = await pool.query(query);


        return result.rows;

    } catch (error) {

        throw error;
    }
};


// GET COMPANY PRODUCTS FOR DROPDOWN

export const getCompanyProductsForDropdown = async () => {

    try {

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
                ON CP."CompanyId" =
                   C."CompanyId"

            INNER JOIN "LKP"."Product" P
                ON CP."ProductId" =
                   P."ProductId"

            WHERE
                CP."IsDisabled" = false

                AND C."IsDisabled" = false

                AND P."IsDisabled" = false

            ORDER BY
                C."CompanyName",
                P."ProductName";
        `;


        const result = await pool.query(query);


        return result.rows;

    } catch (error) {

        throw error;
    }
};


// CHECK COMPANY PRODUCT EXISTS AND ACTIVE

export const checkCompanyProductExists = async (CompanyProductId) => {

    try {

        const query = `
            SELECT
                CP."CompanyProductId",
                CP."CompanyId",
                CP."ProductId"

            FROM "LKP"."CompanyProduct" CP

            INNER JOIN "LKP"."Company" C
                ON CP."CompanyId" =
                   C."CompanyId"

            INNER JOIN "LKP"."Product" P
                ON CP."ProductId" =
                   P."ProductId"

            WHERE
                CP."CompanyProductId" = $1

                AND CP."IsDisabled" = false

                AND C."IsDisabled" = false

                AND P."IsDisabled" = false;
        `;


        const values = [CompanyProductId];


        const result =await pool.query(
                query,
                values
            );


        return result.rows;

    } catch (error) {

        throw error;
    }
};


// GET PROJECT BY ID

export const getProjectById = async (ProjectId) => {

    try {

        const query = `
            SELECT
                "ProjectId",
                "CompanyProductId",
                "ProjectName",
                "ProjectCode",
                "IsDisabled",
                "Description"

            FROM "LKP"."Project"

            WHERE "ProjectId" = $1;
        `;


        const values = [ProjectId];


        const result = await pool.query(
                query,
                values
            );


        return result.rows;

    } catch (error) {

        throw error;
    }
};



// CHECK PROJECT FOR ADD

export const checkProjectExists = async (
    CompanyProductId,
    ProjectName,
    ProjectCode
) => {

    try {

        const query = `
            SELECT
                "ProjectId",
                "CompanyProductId",
                "ProjectName",
                "ProjectCode"

            FROM "LKP"."Project"

            WHERE
                "CompanyProductId" = $1

                AND
                (
                    LOWER(TRIM("ProjectName")) =
                        LOWER(TRIM($2))

                    OR

                    LOWER(TRIM("ProjectCode")) =
                        LOWER(TRIM($3))
                );
        `;


        const values = [
            CompanyProductId,
            ProjectName,
            ProjectCode
        ];


        const result = await pool.query(
                query,
                values
            );


        return result.rows;

    } catch (error) {

        throw error;
    }
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
                "UpdatedAt",
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
    ProjectId
) => {

    try {

        const query = `
            SELECT
                "ProjectId",
                "CompanyProductId",
                "ProjectName",
                "ProjectCode"

            FROM "LKP"."Project"

            WHERE
                "CompanyProductId" = $1

                AND
                "ProjectId" <> $4

                AND
                (
                    LOWER(TRIM("ProjectName")) =
                        LOWER(TRIM($2))

                    OR

                    LOWER(TRIM("ProjectCode")) =
                        LOWER(TRIM($3))
                );
        `;


        const values = [
            CompanyProductId,
            ProjectName,
            ProjectCode,
            ProjectId
        ];


        const result = await pool.query(
                query,
                values
            );


        return result.rows;

    } catch (error) {

        throw error;
    }
};



// EDIT PROJECT

export const editProject = async (projectData) => {

    try {

        const query = `
            UPDATE "LKP"."Project"

            SET
                "CompanyProductId" = $1,
                "ProjectName" = $2,
                "ProjectCode" = $3,
                "IsDisabled" = $4,
                "Description" = $5,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserId" = $6

            WHERE
                "ProjectId" = $7;
        `;


        const values = [
            projectData.CompanyProductId,
            projectData.ProjectName,
            projectData.ProjectCode,
            projectData.IsDisabled,
            projectData.Description,
            projectData.UpdatedByUserId,
            projectData.ProjectId
        ];


        const result = await pool.query(
                query,
                values
            );


        return result.rowCount;

    } catch (error) {

        throw error;
    }
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