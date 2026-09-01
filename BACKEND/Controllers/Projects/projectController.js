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
// VALIDATE POSITIVE INTEGER
// ==========================================

const isValidPositiveInteger = (value) => {

    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isInteger(Number(value)) &&
        Number(value) > 0
    );
};

// ==========================================
// VIEW PROJECTS
// ==========================================

export const getProject = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // ==========================================
        // FLAG ID 1 - GET ALL PROJECTS
        // ==========================================

        if (parseInt(flagId) === 1) {

            const projects = await getAllProjects();

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

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // ==========================================
        // FLAG ID 1 - COMPANY PRODUCT DROPDOWN
        // ==========================================

        if (parseInt(flagId) === 1) {

            const companyProducts = await getCompanyProductsForDropdown();

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
                ProjectName,
                ProjectCode,
                IsDisabled,
                Description,
                CreatedByUserId
            } = req.body;


            // ==========================================
            // COMPANY PRODUCT ID VALIDATION
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


            if (!isValidPositiveInteger(CompanyProductId)) {

                return res.status(400).json({

                    status: "error",
                    message: "CompanyProductId must be a valid positive integer"

                });
            }

            // ==========================================
            // PROJECT NAME VALIDATION
            // ==========================================

            if (typeof ProjectName !== "string" || !ProjectName.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName is required"

                });
            }


            if (ProjectName.trim().length > 255) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName cannot exceed 255 characters"

                });
            }


            // ==========================================
            // PROJECT CODE VALIDATION
            // ==========================================

            if (typeof ProjectCode !== "string" || !ProjectCode.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode is required"

                });
            }


            if (ProjectCode.trim().length > 255) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode cannot exceed 255 characters"

                });
            }


            // ==========================================
            // DESCRIPTION VALIDATION
            // ==========================================

            if (
                Description !== undefined &&
                Description !== null &&
                typeof Description !== "string"
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "Description must be a string"

                });
            }


            // ==========================================
            // IS DISABLED VALIDATION
            // ==========================================

            if (IsDisabled !== undefined && typeof IsDisabled !== "boolean") {

                return res.status(400).json({

                    status: "error",
                    message: "IsDisabled must be true or false"

                });
            }


            // ==========================================
            // CREATED BY USER ID VALIDATION
            // ==========================================

            if (
                CreatedByUserId === undefined ||
                CreatedByUserId === null ||
                CreatedByUserId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "CreatedByUserId is required"

                });
            }


            if (!isValidPositiveInteger(CreatedByUserId)) {

                return res.status(400).json({

                    status: "error",
                    message: "CreatedByUserId must be a valid positive integer"

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

            const existingProject = await checkProjectData(

                Number(CompanyProductId),
                ProjectCode.trim(),
                ProjectName.trim()

            );


            if (existingProject.length > 0) {

                const duplicate = existingProject[0];


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

            const project = await addProject({

                CompanyProductId: Number(CompanyProductId),
                ProjectName: ProjectName.trim(),
                ProjectCode: ProjectCode.trim(),
                IsDisabled: IsDisabled ?? false,
                Description: Description?.trim() || null,
                CreatedByUserId: Number(CreatedByUserId)

            });


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

        // console.error("Error processing project:", error);


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

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // ==========================================
        // FLAG ID 1 - COMPANY PRODUCT DROPDOWN
        // ==========================================

        if (parseInt(flagId) === 1) {

            const companyProducts = await getCompanyProductsForDropdown();

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
                ProjectName,
                ProjectCode,
                Description,
                UpdatedByUserId
            } = req.body;


            // ==========================================
            // PROJECT ID VALIDATION
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


            if (!isValidPositiveInteger(ProjectId)) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId must be a valid positive integer"

                });
            }


            // ==========================================
            // COMPANY PRODUCT ID VALIDATION
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


            if (!isValidPositiveInteger(CompanyProductId)) {

                return res.status(400).json({

                    status: "error",
                    message: "CompanyProductId must be a valid positive integer"

                });
            }


            // ==========================================
            // PROJECT NAME VALIDATION
            // ==========================================

            if (typeof ProjectName !== "string" || !ProjectName.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName is required"

                });
            }


            if (ProjectName.trim().length > 255) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectName cannot exceed 255 characters"

                });
            }


            // ==========================================
            // PROJECT CODE VALIDATION
            // ==========================================

            if (typeof ProjectCode !== "string" || !ProjectCode.trim()) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode is required"

                });
            }


            if (ProjectCode.trim().length > 255) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectCode cannot exceed 255 characters"

                });
            }


            // ==========================================
            // DESCRIPTION VALIDATION
            // ==========================================

            if (
                Description !== undefined &&
                Description !== null &&
                typeof Description !== "string"
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "Description must be a string"

                });
            }


            // ==========================================
            // UPDATED BY USER ID VALIDATION
            // ==========================================

            if (
                UpdatedByUserId === undefined ||
                UpdatedByUserId === null ||
                UpdatedByUserId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "UpdatedByUserId is required"

                });
            }


            if (!isValidPositiveInteger(UpdatedByUserId)) {

                return res.status(400).json({

                    status: "error",
                    message: "UpdatedByUserId must be a valid positive integer"

                });
            }


            // ==========================================
            // CHECK PROJECT EXISTS
            // ==========================================

            const projectExists = await checkProjectExistsForEdit(Number(ProjectId));


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

            const duplicateProject = await checkProjectDataForUpdate(

                Number(ProjectId),
                Number(CompanyProductId),
                ProjectCode.trim(),
                ProjectName.trim()

            );


            if (duplicateProject.length > 0) {

                const duplicate = duplicateProject[0];


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
            // UPDATE PROJECT
            // ==========================================

            const result = await editProject({

                ProjectId: Number(ProjectId),
                CompanyProductId: Number(CompanyProductId),
                ProjectName: ProjectName.trim(),
                ProjectCode: ProjectCode.trim(),
                Description: Description?.trim() || null,
                UpdatedByUserId: Number(UpdatedByUserId)

            });


            // ==========================================
            // PROJECT NOT FOUND
            // ==========================================

            if (result === 0) {

                return res.status(404).json({

                    status: "error",
                    message: "Project not found"

                });
            }


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
// TOGGLE PROJECT STATUS
// ==========================================

export const toggleProjectStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // ==========================================
        // FLAG ID 4 - TOGGLE PROJECT STATUS
        // ==========================================

        if (parseInt(flagId) === 4) {

            const {
                ProjectId,
                IsDisabled,
                UpdatedByUserId
            } = req.body;


            // ==========================================
            // PROJECT ID VALIDATION
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


            if (!isValidPositiveInteger(ProjectId)) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId must be a valid positive integer"

                });
            }


            // ==========================================
            // IS DISABLED VALIDATION
            // ==========================================

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({

                    status: "error",
                    message: "IsDisabled must be true or false"

                });
            }


            // ==========================================
            // UPDATED BY USER ID VALIDATION
            // ==========================================

            if (
                UpdatedByUserId === undefined ||
                UpdatedByUserId === null ||
                UpdatedByUserId === ""
            ) {

                return res.status(400).json({

                    status: "error",
                    message: "UpdatedByUserId is required"

                });
            }


            if (!isValidPositiveInteger(UpdatedByUserId)) {

                return res.status(400).json({

                    status: "error",
                    message: "UpdatedByUserId must be a valid positive integer"

                });
            }


            // ==========================================
            // TOGGLE PROJECT
            // ==========================================

            const project = await toggleProjectStatuses({

                ProjectId: Number(ProjectId),
                IsDisabled,
                UpdatedByUserId: Number(UpdatedByUserId)

            });


            // ==========================================
            // PROJECT NOT FOUND
            // ==========================================

            if (!project) {

                return res.status(404).json({

                    status: "error",
                    message: "Project not found"

                });
            }


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

        // console.error("Error toggling project status:", error);


        return res.status(500).json({

            status: "error",
            message: "Failed to update project status",
            error: error.message

        });
    }
};


// ==========================================
// DELETE PROJECT
// ==========================================

export const deleteProjectController = async (req, res) => {

    const {
        flagId,
        ProjectId
    } = req.body;


    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // ==========================================
        // FLAG ID 1 - DELETE PROJECT
        // ==========================================

        if (parseInt(flagId) === 1) {

            // ==========================================
            // PROJECT ID VALIDATION
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


            if (!isValidPositiveInteger(ProjectId)) {

                return res.status(400).json({

                    status: "error",
                    message: "ProjectId must be a valid positive integer"

                });
            }


            // ==========================================
            // DELETE PROJECT
            // ==========================================

            const result = await deleteProject(Number(ProjectId));


            // ==========================================
            // PROJECT NOT FOUND
            // ==========================================

            if (result === 0) {

                return res.status(404).json({

                    status: "error",
                    message: "Project not found"

                });
            }


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


        // ==========================================
        // FOREIGN KEY ERROR
        // ==========================================

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