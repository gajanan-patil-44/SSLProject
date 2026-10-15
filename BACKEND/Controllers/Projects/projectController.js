import {
    getAllProjects,
    getCompanyProductsForDropdown,
    checkCompanyProductExists,
    checkProjectExists,
    addProject,
    getProjectById,
    checkProjectExistsForUpdate,
    editProject,
    toggleProjectStatuses,
    deleteProject
} from "../../Models/ProjectModels.js";


// GET ALL PROJECTS

export const getProject = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID 1 - GET ALL PROJECTS

        if (parseInt(flagId) === 1) {

            const rows = await getAllProjects();

            return res.status(200).json({
                status: "success",
                message: "Projects fetched successfully",
                data: rows
            });
        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};


// ADD PROJECT / COMPANY PRODUCT DROPDOWN

export const addprojectController = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID 1 - GET COMPANY PRODUCTS

        if (parseInt(flagId) === 1) {

            const companyProducts = await getCompanyProductsForDropdown();

            return res.status(200).json({
                status: "success",
                message: "Company products fetched successfully",
                data: companyProducts
            });
        }


        // FLAG ID 2 - ADD PROJECT

        if (parseInt(flagId) === 2) {

            const {
                CompanyProductId,
                ProjectName,
                ProjectCode,
                IsDisabled,
                Description,
                CreatedByUserId
            } = req.body;


            // VALIDATE COMPANY PRODUCT ID

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


            if (
                !Number.isInteger(Number(CompanyProductId)) ||
                Number(CompanyProductId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId must be a valid positive integer"
                });
            }


            // VALIDATE PROJECT NAME

            if (
                ProjectName === undefined ||
                ProjectName === null ||
                typeof ProjectName !== "string" ||
                ProjectName.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ProjectName is required"
                });
            }


            // VALIDATE PROJECT CODE

            if (
                ProjectCode === undefined ||
                ProjectCode === null ||
                typeof ProjectCode !== "string" ||
                ProjectCode.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ProjectCode is required"
                });
            }


            // VALIDATE DESCRIPTION

            if (
                Description === undefined ||
                Description === null ||
                typeof Description !== "string" ||
                Description.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Description is required"
                });
            }


            // VALIDATE IS DISABLED

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // VALIDATE CREATED BY USER ID

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


            if (
                !Number.isInteger(Number(CreatedByUserId)) ||
                Number(CreatedByUserId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserId must be a valid positive integer"
                });
            }


            // CHECK COMPANY PRODUCT

            const companyProductData = await checkCompanyProductExists(Number(CompanyProductId));


            if (companyProductData.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyProductId"
                });
            }


            // CHECK DUPLICATE PROJECT

            const existingProject =await checkProjectExists(
                    Number(CompanyProductId),
                    ProjectName.trim(),
                    ProjectCode.trim()
                );
                

            if (existingProject.length > 0) {

                const duplicate = existingProject[0];


                // DUPLICATE PROJECT NAME

                if (
                    duplicate.ProjectName &&
                    duplicate.ProjectName.trim().toLowerCase() ===
                    ProjectName.trim().toLowerCase()
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Project name already exists for this company product"
                    });
                }


                // DUPLICATE PROJECT CODE

                if (
                    duplicate.ProjectCode &&
                    duplicate.ProjectCode.trim().toLowerCase() ===
                    ProjectCode.trim().toLowerCase()
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Project code already exists for this company product"
                    });
                }
            }


            // ADD PROJECT

            const project = await addProject({

                CompanyProductId: Number(CompanyProductId),
                ProjectName: ProjectName.trim(),
                ProjectCode: ProjectCode.trim(),
                IsDisabled,
                Description: Description.trim(),
                CreatedByUserId: Number(CreatedByUserId)
            });


            // SUCCESS

            return res.status(201).json({
                status: "success",
                message: "Project added successfully",
                data: project
            });
        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to process project",
            error: error.message
        });
    }
};


// EDIT PROJECT

export const editProjectController = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID 1 - GET COMPANY PRODUCTS

        if (parseInt(flagId) === 1) {

            const companyProducts = await getCompanyProductsForDropdown();

            return res.status(200).json({
                status: "success",
                message: "Company products fetched successfully",
                data: companyProducts
            });
        }


        // FLAG ID 2 - EDIT PROJECT

        if (parseInt(flagId) === 2) {

            const {
                ProjectId,
                CompanyProductId,
                ProjectName,
                ProjectCode,
                IsDisabled,
                Description,
                UpdatedByUserId
            } = req.body;


            // VALIDATE PROJECT ID

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


            if (
                !Number.isInteger(Number(ProjectId)) ||
                Number(ProjectId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ProjectId must be a valid positive integer"
                });
            }


            // VALIDATE COMPANY PRODUCT ID

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


            if (
                !Number.isInteger(Number(CompanyProductId)) ||
                Number(CompanyProductId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyProductId must be a valid positive integer"
                });
            }


            // VALIDATE PROJECT NAME

            if (
                ProjectName === undefined ||
                ProjectName === null ||
                typeof ProjectName !== "string" ||
                ProjectName.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ProjectName is required"
                });
            }


            // VALIDATE PROJECT CODE

            if (
                ProjectCode === undefined ||
                ProjectCode === null ||
                typeof ProjectCode !== "string" ||
                ProjectCode.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ProjectCode is required"
                });
            }


            // VALIDATE DESCRIPTION

            if (
                Description === undefined ||
                Description === null ||
                typeof Description !== "string" ||
                Description.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Description is required"
                });
            }


            // VALIDATE IS DISABLED

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // VALIDATE UPDATED BY USER ID

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


            if (
                !Number.isInteger(Number(UpdatedByUserId)) ||
                Number(UpdatedByUserId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserId must be a valid positive integer"
                });
            }


            // CHECK PROJECT EXISTS

            const projectExists =await getProjectById(Number(ProjectId));


            if (projectExists.length === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Project not found"
                });
            }


            // CHECK COMPANY PRODUCT

            const companyProductData =await checkCompanyProductExists(Number(CompanyProductId));


            if (companyProductData.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyProductId"
                });
            }


            // CHECK DUPLICATE PROJECT
            // EXCLUDE CURRENT PROJECT

            const existingProject =await checkProjectExistsForUpdate(
                    Number(CompanyProductId),
                    ProjectName.trim(),
                    ProjectCode.trim(),
                    Number(ProjectId)
                );


            if (existingProject.length > 0) {

                const duplicate = existingProject[0];


                // DUPLICATE PROJECT NAME

                if (
                    duplicate.ProjectName &&
                    duplicate.ProjectName.trim().toLowerCase() ===
                    ProjectName.trim().toLowerCase()
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Project name already exists for this company product"
                    });
                }


                // DUPLICATE PROJECT CODE

                if (
                    duplicate.ProjectCode &&
                    duplicate.ProjectCode.trim().toLowerCase() ===
                    ProjectCode.trim().toLowerCase()
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Project code already exists for this company product"
                    });
                }
            }

            // UPDATE PROJECT

            const result = await editProject({

                ProjectId: Number(ProjectId),
                CompanyProductId: Number(CompanyProductId),
                ProjectName: ProjectName.trim(),
                ProjectCode: ProjectCode.trim(),
                IsDisabled,
                Description: Description.trim(),
                UpdatedByUserId: Number(UpdatedByUserId)
            });


            // PROJECT NOT FOUND

            if (result === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Project not found"
                });
            }

            // SUCCESS

            return res.status(200).json({
                status: "success",
                message: "Project updated successfully",
                data: result
            });
        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to edit project",
            error: error.message
        });
    }
};


// TOGGLE PROJECT STATUS

export const toggleProjectStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        // VALIDATE FLAG ID

        if (
            flagId === undefined ||
            flagId === null ||
            flagId === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        // FLAG ID 4 - TOGGLE PROJECT STATUS


        if (parseInt(flagId) === 4) {

            const {
                ProjectId,
                IsDisabled,
                UpdatedByUserId
            } = req.body;


            // VALIDATE PROJECT ID

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


            if (
                !Number.isInteger(Number(ProjectId)) ||
                Number(ProjectId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ProjectId must be a valid positive integer"
                });
            }


            // VALIDATE IS DISABLED

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // VALIDATE UPDATED BY USER ID

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


            if (
                !Number.isInteger(Number(UpdatedByUserId)) ||
                Number(UpdatedByUserId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserId must be a valid positive integer"
                });
            }


            // TOGGLE PROJECT STATUS

            const projectData = await toggleProjectStatuses({

                    ProjectId: Number(ProjectId),
                    IsDisabled,
                    UpdatedByUserId: Number(UpdatedByUserId)
                });


            // PROJECT DOES NOT EXIST
            if (!projectData) {

                return res.status(404).json({
                    status: "error",
                    message: "Project not found"
                });
            }

            // SUCCESS

            return res.status(200).json({
                status: "success",
                message: "Project status updated successfully"
            });
        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to update project status",
            error: error.message
        });
    }
};


// DELETE PROJECT

export const deleteProjectController = async (req, res) => {

    const {
        flagId,
        ProjectId
    } = req.body;

    try {

        // FLAG ID 1 - DELETE PROJECT

        if (parseInt(flagId) === 1) {

            // VALIDATE PROJECT ID
   

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


            if (
                !Number.isInteger(Number(ProjectId)) ||
                Number(ProjectId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "ProjectId must be a valid positive integer"
                });
            }


            // DELETE PROJECT

            const result = await deleteProject(Number(ProjectId));


            // PROJECT NOT FOUND

            if (result === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Project not found"
                });
            }


            // SUCCESS

            return res.status(200).json({
                status: "success",
                message: "Project deleted successfully",
                data: result
            });
        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to delete project",
            error: error.message
        });
    }
};