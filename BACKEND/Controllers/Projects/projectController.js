import {
    getAllProjects,
    getCompanyProductsForDropdown,
    checkCompanyProductExists,
    checkProjectData,
    addProject,
    checkProjectExistsForEdit,
    checkProjectDataForUpdate,
    editProject,
    toggleProjectStatuses,
    deleteProject
} from "../../Models/ProjectModels.js";


// ==========================================
// VIEW PROJECTS
// ==========================================

export const getProject = async (req, res) => {

    const { flagId } = req.body;

    try {

        // ==========================================
        // FLAG ID 1 - GET ALL PROJECTS
        // ==========================================

        if (parseInt(flagId) === 1) {

            const projects =await getAllProjects();

            return res.status(200).json({

                status: "success",
                message: "Projects fetched successfully",
                data: projects

            });
        }


        // ==========================================
        // INVALID FLAG ID
        // ==========================================

        return res.status(400).json({

            status: "error",
            message: "Invalid FlagId."

        });

    } catch (error) {

        // console.error("Error fetching projects:", error);


        return res.status(500).json({

            status: "error",
            message: "Failed to fetch projects",
            error: error.message

        });
    }
};


// ==========================================
// ADD PROJECT CONTROLLER
// ==========================================

export const projectController = async (req, res) => {

    const { flagId } = req.body;

    try {

        // ==========================================
        // FLAG ID 1 - GET COMPANY PRODUCTS
        // ==========================================

        if (parseInt(flagId) === 1) {

            const companyProducts =await getCompanyProductsForDropdown();


            return res.status(200).json({

                status: "success",
                message: "Company products fetched successfully",
                data: companyProducts

            });
        }


        // ==========================================
        // FLAG ID 2 - ADD PROJECT
        // ==========================================

        if (parseInt(flagId) === 2) {

            const {
                CompanyProductId,
                ProjectCode,
                ProjectName,
                ProjectDescription,
                IsDisabled,
                CreatedByUserName
            } = req.body;


            // ==========================================
            // VALIDATE COMPANY PRODUCT ID
            // ==========================================

            if (
                CompanyProductId === undefined ||
                CompanyProductId === null ||
                CompanyProductId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "CompanyProductId is required"

                });
            }


            if (!Number.isInteger(Number(CompanyProductId)) || Number(CompanyProductId) <= 0) {

                return res.status(400).json({

                    status: "error",
                    message: "CompanyProductId must be a valid positive integer"

                });
            }


            // ==========================================
            // VALIDATE PROJECT CODE
            // ==========================================

            if (typeof ProjectCode !== "string" || !ProjectCode.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode is required"

                });
            }


            if (ProjectCode.trim().length > 100) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode cannot exceed 100 characters"

                });
            }


            // ==========================================
            // VALIDATE PROJECT NAME
            // ==========================================

            if (typeof ProjectName !== "string" ||!ProjectName.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName is required"

                });
            }


            if (ProjectName.trim().length > 100) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName cannot exceed 100 characters"

                });
            }


            // ==========================================
            // VALIDATE PROJECT DESCRIPTION
            // ==========================================

            if (
                ProjectDescription !== undefined &&
                ProjectDescription !== null &&
                typeof ProjectDescription !== "string"
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectDescription must be a string"

                });
            }


            // ==========================================
            // VALIDATE IS DISABLED
            // ==========================================

            if (
                IsDisabled !== undefined &&
                typeof IsDisabled !== "boolean"
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "IsDisabled must be true or false"

                });
            }


            // ==========================================
            // VALIDATE CREATED USER
            // ==========================================

            if (typeof CreatedByUserName !== "string" ||!CreatedByUserName.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "CreatedByUserName is required"

                });
            }


            // ==========================================
            // CHECK COMPANY PRODUCT
            // ==========================================

            const companyProduct =await checkCompanyProductExists(Number(CompanyProductId));


            if (companyProduct.length === 0) {

                return res.status(400).json({

                    status: "error",
                    message: "Invalid or inactive CompanyProductId"

                });
            }


            // ==========================================
            // CHECK DUPLICATE PROJECT
            // ==========================================

            const existingProject =await checkProjectData(Number(CompanyProductId),ProjectCode.trim(), ProjectName.trim());


            if (existingProject.length > 0) {

                const duplicate =
                    existingProject[0];


                if (duplicate.ProjectCode.trim().toLowerCase() === ProjectCode.trim().toLowerCase()) {

                    return res.status(409).json({

                        status: "error",
                        message: "Project code already exists for this company product"

                    });
                }


                if (duplicate.ProjectName.trim().toLowerCase() === ProjectName.trim().toLowerCase()) {

                    return res.status(409).json({

                        status: "error",
                        message: "Project name already exists for this company product"

                    });
                }
            }


            // ==========================================
            // ADD PROJECT
            // ==========================================

            const project =await addProject({

                    CompanyProductId:
                        Number(CompanyProductId),

                    ProjectCode:
                        ProjectCode.trim(),

                    ProjectName:
                        ProjectName.trim(),

                    ProjectDescription:
                        ProjectDescription?.trim() || null,

                    IsDisabled:
                        IsDisabled ?? false,

                    CreatedByUserName:
                        CreatedByUserName.trim()

                });


            // ==========================================
            // SUCCESS
            // ==========================================

            return res.status(201).json({

                status: "success",
                message: "Project added successfully",
                data: project

            });
        }


        // ==========================================
        // INVALID FLAG ID
        // ==========================================

        return res.status(400).json({

            status: "error",
            message: "Invalid FlagId."

        });

    } catch (error) {

        // console.error( "Error processing project:", error);


        // PostgreSQL unique constraint
        if (error.code === "23505") {

            return res.status(409).json({

                status: "error",
                message: "Project already exists"

            });
        }


        return res.status(500).json({

            status: "error",
            message: "Failed to process project",
            error: error.message

        });
    }
};


// ==========================================
// EDIT PROJECT CONTROLLER
// ==========================================

export const editProjectController = async (req, res) => {

    const { flagId } = req.body;

    try {

        // ==========================================
        // FLAG ID 1 - GET COMPANY PRODUCTS
        // ==========================================

        if (parseInt(flagId) === 1) {

            const companyProducts =await getCompanyProductsForDropdown();


            return res.status(200).json({

                status: "success",
                message: "Company products fetched successfully",
                data: companyProducts

            });
        }


        // ==========================================
        // FLAG ID 2 - EDIT PROJECT
        // ==========================================

        if (parseInt(flagId) === 2) {

            const {
                ProjectId,
                CompanyProductId,
                ProjectCode,
                ProjectName,
                ProjectDescription,
                UpdatedByUserName
            } = req.body;


            // ==========================================
            // VALIDATE PROJECT ID
            // ==========================================

            if (
                ProjectId === undefined ||
                ProjectId === null ||
                ProjectId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId is required"

                });
            }


            if (!Number.isInteger(Number(ProjectId)) || Number(ProjectId) <= 0) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId must be a valid positive integer"

                });
            }


            // ==========================================
            // VALIDATE COMPANY PRODUCT ID
            // ==========================================

            if (
                CompanyProductId === undefined ||
                CompanyProductId === null ||
                CompanyProductId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "CompanyProductId is required"

                });
            }


            if (!Number.isInteger(Number(CompanyProductId)) ||Number(CompanyProductId) <= 0) {

                return res.status(400).json({

                    status: "error",
                    message: "CompanyProductId must be a valid positive integer"

                });
            }


            // ==========================================
            // VALIDATE PROJECT CODE
            // ==========================================

            if (typeof ProjectCode !== "string" ||!ProjectCode.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode is required"

                });
            }


            if (ProjectCode.trim().length > 100) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode cannot exceed 100 characters"

                });
            }


            // ==========================================
            // VALIDATE PROJECT NAME
            // ==========================================

            if (typeof ProjectName !== "string" ||!ProjectName.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName is required"

                });
            }


            if (ProjectName.trim().length > 100) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName cannot exceed 100 characters"

                });
            }


            // ==========================================
            // VALIDATE DESCRIPTION
            // ==========================================

            if (
                ProjectDescription !== undefined &&
                ProjectDescription !== null &&
                typeof ProjectDescription !== "string"
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectDescription must be a string"

                });
            }


            // ==========================================
            // VALIDATE UPDATED USER
            // ==========================================

            if (typeof UpdatedByUserName !== "string" ||!UpdatedByUserName.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "UpdatedByUserName is required"

                });
            }


            // ==========================================
            // CHECK PROJECT EXISTS
            // ==========================================

            const projectExists =await checkProjectExistsForEdit(Number(ProjectId));


            if (projectExists.length === 0) {

                return res.status(404).json({

                    status: "error",
                    message: "Project not found"

                });
            }


            // ==========================================
            // CHECK COMPANY PRODUCT
            // ==========================================

            const companyProduct = await checkCompanyProductExists(Number(CompanyProductId));


            if (companyProduct.length === 0) {

                return res.status(400).json({

                    status: "error",
                    message: "Invalid or inactive CompanyProductId"

                });
            }


            // ==========================================
            // CHECK DUPLICATE PROJECT
            // ==========================================

            const duplicateProject =await checkProjectDataForUpdate(

                    Number(ProjectId),
                    Number(CompanyProductId),
                    ProjectCode.trim(),
                    ProjectName.trim()
                );


            if (duplicateProject.length > 0) {

                const duplicate =duplicateProject[0];


                if (
                    duplicate.ProjectCode.trim().toLowerCase() === ProjectCode.trim() .toLowerCase()) {

                    return res.status(409).json({

                        status: "error",
                        message: "Project code already exists for this company product"

                    });
                }


                if (duplicate.ProjectName.trim().toLowerCase() ===ProjectName.trim().toLowerCase()) {

                    return res.status(409).json({

                        status: "error",
                        message: "Project name already exists for this company product"

                    });
                }
            }


            // ==========================================
            // UPDATE PROJECT
            // ==========================================

            const result =await editProject({

                    ProjectId: Number(ProjectId),
                    CompanyProductId:Number(CompanyProductId),
                    ProjectCode:ProjectCode.trim(),
                    ProjectName:ProjectName.trim(),
                    ProjectDescription:ProjectDescription?.trim() || null,
                    UpdatedByUserName:UpdatedByUserName.trim()

                });


            // ==========================================
            // PROJECT NOT FOUND
            // ==========================================

            if (result === 0) {

                return res.status(404).json({

                    status: "error",
                    message:"Project not found"

                });
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            return res.status(200).json({

                status: "success",
                message: "Project updated successfully",
                data: result

            });
        }


        // ==========================================
        // INVALID FLAG ID
        // ==========================================

        return res.status(400).json({

            status: "error",
            message: "Invalid FlagId."

        });

    } catch (error) {

        // console.error("Error editing project:", error);


        if (error.code === "23505") {

            return res.status(409).json({

                status: "error",
                message: "Project already exists"

            });
        }


        return res.status(500).json({

            status: "error",
            message: "Failed to edit project",
            error: error.message

        });
    }
};


// ==========================================
// TOGGLE PROJECT STATUS CONTROLLER
// ==========================================

export const toggleProjectStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        // ==========================================
        // FLAG ID 4 - TOGGLE PROJECT STATUS
        // ==========================================

        if (parseInt(flagId) === 1) {

            const {
                ProjectId,
                IsDisabled,
                UpdatedByUserName
            } = req.body;


            // ==========================================
            // VALIDATE PROJECT ID
            // ==========================================

            if (
                ProjectId === undefined ||
                ProjectId === null ||
                ProjectId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId is required"

                });
            }


            if (!Number.isInteger(Number(ProjectId)) ||Number(ProjectId) <= 0) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId must be a valid positive integer"

                });
            }


            // ==========================================
            // VALIDATE IS DISABLED
            // ==========================================

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({

                    status: "error",
                    message: "IsDisabled must be true or false"

                });
            }


            // ==========================================
            // VALIDATE UPDATED USER
            // ==========================================

            if (typeof UpdatedByUserName !== "string" ||!UpdatedByUserName.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "UpdatedByUserName is required"

                });
            }


            // ==========================================
            // PREPARE PROJECT DATA
            // ==========================================

            const projectData = {

                ProjectId: Number(ProjectId), IsDisabled,
                UpdatedByUserName: UpdatedByUserName.trim()

            };

            // console.log("Received toggle project data:", projectData);


            // ==========================================
            // TOGGLE PROJECT
            // ==========================================

            const project = await toggleProjectStatuses(projectData);


            // ==========================================
            // PROJECT DOES NOT EXIST
            // ==========================================

            if (!project) {

                return res.status(404).json({

                    status: "error",
                    message: "Project not found"

                });
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            return res.status(200).json({

                status: "success",
                message: "Project status updated successfully",
                data: project

            });
        }


        // ==========================================
        // INVALID FLAG ID
        // ==========================================

        return res.status(400).json({

            status: "error",
            message: "Invalid flagId"

        });

    } catch (error) {

        // console.error( "Error toggling project status:",error);


        return res.status(500).json({

            status: "error",
            message: "Failed to update project status",
            error: error.message

        });
    }
};


// ==========================================
// DELETE PROJECT CONTROLLER
// ==========================================

export const deleteProjectController = async (req, res) => {

    const {flagId, ProjectId} = req.body;


    try {

        // ==========================================
        // FLAG ID 1 - DELETE PROJECT
        // ==========================================

        if (parseInt(flagId) === 1) {

            // ==========================================
            // VALIDATE PROJECT ID
            // ==========================================

            if (
                ProjectId === undefined ||
                ProjectId === null ||
                ProjectId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId is required"

                });
            }


            if (!Number.isInteger(Number(ProjectId)) ||Number(ProjectId) <= 0) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId must be a valid positive integer"

                });
            }


            // ==========================================
            // DELETE PROJECT
            // ==========================================

            const result =await deleteProject( Number(ProjectId));


            // ==========================================
            // PROJECT NOT FOUND
            // ==========================================

            if (result === 0) {

                return res.status(404).json({

                    status: "error",
                    message: "Project not found"

                });
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            return res.status(200).json({

                status: "success",
                message: "Project deleted successfully",
                data: result

            });
        }


        // ==========================================
        // INVALID FLAG ID
        // ==========================================

        return res.status(400).json({

            status: "error",
            message: "Invalid FlagId."

        });

    } catch (error) {

        // console.error("Error deleting project:", error);


        // Foreign key violation
        if (error.code === "23503") {

            return res.status(409).json({

                status: "error",
                message: "Project cannot be deleted because it is referenced by another record"

            });
        }


        return res.status(500).json({

            status: "error",
            message: "Failed to delete project",
            error: error.message

        });
    }
};