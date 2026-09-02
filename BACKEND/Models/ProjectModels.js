import { pool } from "../Config/db.js";


// ==========================================
// GET ALL PROJECTS
// ==========================================

export const getAllProjects = async () => {

    try {

        const query = `
               SELECT
                PR."ProjectId",
                PR."CompanyProductId",

                CP."CompanyId",
                C."CompanyName",

                CP."ProductId",
                P."ProductName",

                PR."ProjectName",
                PR."Description",
                PR."IsDisabled",
                PR."Description",

                PR."CreatedAt",
                PR."UpdatedAt",
				U."FirstName" AS "CreatedByUserName"
                
            FROM "LKP"."Project" PR

            INNER JOIN "LKP"."CompanyProduct" CP
                ON PR."CompanyProductId" = CP."CompanyProductId"

            INNER JOIN "LKP"."Company" C
                ON CP."CompanyId" = C."CompanyId"

            INNER JOIN "LKP"."Product" P
                ON CP."ProductId" = P."ProductId"
				
			INNER JOIN "DATA"."User" U
                ON PR."CreatedByUserId" = U."UserId"


            ORDER BY
                PR."CreatedAt" DESC;
        `;


        const result = await pool.query(query);

        return result.rows;

    } catch (error) {

        // console.error("Error fetching projects:", error);

        throw error;
    }
};


// ==========================================
// GET COMPANY PRODUCT DROPDOWN
// ==========================================

export const getCompanyProductsForDropdown =async () => {

        try {

            const query = `
                SELECT
                    CP."CompanyProductId",
                    P."ProductName"
					
                FROM "LKP"."CompanyProduct" CP
                INNER JOIN "LKP"."Product" P
                    ON CP."ProductId" = P."ProductId"
                WHERE CP."IsDisabled" = false
                AND P."IsDisabled" = false

                ORDER BY
                    P."ProductName";
            `;


            const result =await pool.query(query);


            return result.rows;

        } catch (error) {

            // console.error("Error fetching company products for dropdown:", error);

            throw error;
        }
    };


// ==========================================
// CHECK COMPANY PRODUCT
// ==========================================

export const checkCompanyProductExists =async (CompanyProductId) => {

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

                WHERE CP."CompanyProductId" = $1

                AND CP."IsDisabled" = false
                AND C."IsDisabled" = false
                AND P."IsDisabled" = false;
            `;


            const values = [CompanyProductId];


            const result =await pool.query(query, values);


            return result.rows;

        } catch (error) {

            // console.error("Error checking company product:", error);

            throw error;
        }
    };


// ==========================================
// CHECK DUPLICATE PROJECT WHILE ADDING
// ==========================================

export const checkProjectData = async (
    CompanyProductId,
    ProjectCode,
    ProjectName
) => {

    try {

        const query = `
            SELECT
                "ProjectId",
                "CompanyProductId",
                "ProjectCode",
                "ProjectName"

            FROM "LKP"."Project"

            WHERE "CompanyProductId" = $1

            AND
            (
                LOWER(TRIM("ProjectCode"))
                    = LOWER(TRIM($2))

                OR

                LOWER(TRIM("ProjectName"))
                    = LOWER(TRIM($3))
            );
        `;


        const values = [
            CompanyProductId,
            ProjectCode,
            ProjectName
        ];


        const result =await pool.query(query, values);


        return result.rows;

    } catch (error) {

        // console.error("Error checking duplicate project:", error);

        throw error;
    }
};


// ==========================================
// ADD PROJECT
// ==========================================

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
                CURRENT_TIMESTAMP,
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


        const result =await pool.query(query, values);

        return result.rows[0];

    } catch (error) {

        // console.error("Error adding project:", error);

        throw error;
    }
};


// ==========================================
// CHECK PROJECT EXISTS FOR EDIT
// ==========================================

export const checkProjectExistsForEdit =async (ProjectId) => {

        try {

            const query = `
                SELECT
                    "ProjectId",
                    "CompanyProductId",
                    "ProjectName",
                    "ProjectCode",
                    "IsDisabled",
                    "Description",
                    "CreatedAt",
                    "UpdatedAt",
                    "CreatedByUserId",
                    "UpdatedByUserId"

                FROM "LKP"."Project"
                WHERE "ProjectId" = $1;
            `;


            const values = [ProjectId];


            const result =await pool.query(query, values);

            return result.rows;

        } catch (error) {

            // console.error("Error checking project for edit:", error);

            throw error;
        }
    };


// ==========================================
// CHECK DUPLICATE PROJECT FOR UPDATE
// ==========================================

export const checkProjectDataForUpdate =async (
        ProjectId,
        CompanyProductId,
        ProjectCode,
        ProjectName
    ) => {

        try {

            const query = `
                SELECT
                    "ProjectId",
                    "CompanyProductId",
                    "ProjectCode",
                    "ProjectName"

                FROM "LKP"."Project"
                WHERE "CompanyProductId" = $1
                AND "ProjectId" <> $2
                AND
                (
                    LOWER(TRIM("ProjectCode"))
                        = LOWER(TRIM($3))

                    OR

                    LOWER(TRIM("ProjectName"))
                        = LOWER(TRIM($4))
                );
            `;


            const values = [
                CompanyProductId,
                ProjectId,
                ProjectCode,
                ProjectName
            ];


            const result =await pool.query(query, values);

            return result.rows;

        } catch (error) {

            // console.error("Error checking duplicate project for update:", error);

            throw error;
        }
    };


// ==========================================
// EDIT PROJECT
// ==========================================

export const editProject = async (projectData) => {

    try {

        const query = `
            UPDATE "LKP"."Project"

            SET
                "CompanyProductId" = $1,
                "ProjectName" = $2,
                "ProjectCode" = $3,
                "Description" = $4,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserId" = $5

            WHERE "ProjectId" = $6;
        `;


        const values = [
            projectData.CompanyProductId,
            projectData.ProjectName,
            projectData.ProjectCode,
            projectData.Description,
            projectData.UpdatedByUserId,
            projectData.ProjectId

        ];


        const result =await pool.query(query, values);

        return result.rowCount;

    } catch (error) {

        // console.error("Error editing project:", error);

        throw error;
    }
};


// ==========================================
// TOGGLE PROJECT STATUS
// ==========================================

export const toggleProjectStatuses =async (projectData) => {

        try {

            const query = `
                UPDATE "LKP"."Project"

                SET
                    "IsDisabled" = $1,
                    "UpdatedAt" = CURRENT_TIMESTAMP,
                    "UpdatedByUserId" = $2

                WHERE "ProjectId" = $3

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


            const result =await pool.query(query, values);

            return result.rows[0];

        } catch (error) {

            // console.error("Error toggling project status:", error);

            throw error;
        }
    };


// ==========================================
// DELETE PROJECT
// ==========================================

export const deleteProject =async (ProjectId) => {

        try {

            const query = `
                DELETE FROM "LKP"."Project"
                WHERE "ProjectId" = $1;
            `;


            const values = [ProjectId];


            const result =await pool.query(query, values);

            return result.rowCount;

        } catch (error) {

            // console.error("Error deleting project:", error);

            throw error;
        }
    };