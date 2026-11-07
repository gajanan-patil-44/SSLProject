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

        // =============================================
        // FLAG ID VALIDATION
        // =============================================

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

        if (!Number.isInteger(Number(flagId))) {
            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }

        // =============================================
        // FLAG ID 1 - GET ALL PROJECTS
        // =============================================

        if (Number(flagId) === 1) {

            const loggedInCompanyId = req.user?.CompanyId;

            if (loggedInCompanyId === undefined) {
                return res.status(401).json({
                    status: "error",
                    message: "User authentication information is missing"
                });
            }

            const rows = await getAllProjects(loggedInCompanyId);

            return res.status(200).json({
                status: "success",
                message: "Projects fetched successfully",
                data: rows
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Get Project Error:", error);

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

        // =============================================
        // FLAG ID VALIDATION
        // =============================================

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

        if (!Number.isInteger(Number(flagId))) {
            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }

        // =============================================
        // VALIDATE LOGGED-IN COMPANY
        // =============================================

        const loggedInCompanyId = req.user?.CompanyId;

        if (loggedInCompanyId === undefined) {
            return res.status(401).json({
                status: "error",
                message: "User authentication information is missing"
            });
        }

        // =============================================
        // FLAG ID 1 - GET COMPANY PRODUCTS
        // =============================================

        if (Number(flagId) === 1) {

            const companyProducts = await getCompanyProductsForDropdown(
                loggedInCompanyId
            );

            return res.status(200).json({
                status: "success",
                message: "Company products fetched successfully",
                data: companyProducts
            });
        }

        // =============================================
        // FLAG ID 2 - ADD PROJECT
        // =============================================

        if (Number(flagId) === 2) {

            const {
                CompanyProductId,
                ProjectName,
                ProjectCode,
                IsDisabled,
                Description,
                CreatedByUserId
            } = req.body;

            // =============================================
            // VALIDATE COMPANY PRODUCT ID
            // =============================================

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

            // =============================================
            // CHECK COMPANY PRODUCT
            // =============================================

            const companyProductData =
                await checkCompanyProductExists(
                    Number(CompanyProductId),
                    loggedInCompanyId
                );

            if (companyProductData.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyProductId for this company"
                });
            }

            // =============================================
            // VALIDATE PROJECT NAME
            // =============================================

            if (
                typeof ProjectName !== "string" ||
                ProjectName.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProjectName is required"
                });
            }

            const projectName = ProjectName.trim();

            if (projectName.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "Project name must not exceed 30 characters"
                });
            }

            const projectNameRegex = /^[A-Za-z\s]+$/;

            if (!projectNameRegex.test(projectName)) {
                return res.status(400).json({
                    status: "error",
                    message: "Project name should contain only alphabets and spaces"
                });
            }

            // =============================================
            // VALIDATE PROJECT CODE
            // =============================================

            if (
                typeof ProjectCode !== "string" ||
                ProjectCode.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "ProjectCode is required"
                });
            }

            const projectCode = ProjectCode.trim();

            if (!/^[A-Za-z0-9]{1,15}$/.test(projectCode)) {
                return res.status(400).json({
                    status: "error",
                    message: "Project Code must contain only alphanumeric characters and must not exceed 15 characters"
                });
            }

            // =============================================
            // VALIDATE DESCRIPTION
            // =============================================

            let description = null;

            if (Description !== undefined && Description !== null) {

                if (typeof Description !== "string") {
                    return res.status(400).json({
                        status: "error",
                        message: "Description must be a valid string or null"
                    });
                }

                description = Description.trim();

                if (description.length > 250) {
                    return res.status(400).json({
                        status: "error",
                        message: "Description must not exceed 250 characters"
                    });
                }

                if (
                    description !== "" &&
                    !/[A-Za-z0-9]/.test(description)
                ) {
                    return res.status(400).json({
                        status: "error",
                        message: "Description cannot contain only special characters"
                    });
                }

                if (description === "") {
                    description = null;
                }
            }

            // =============================================
            // VALIDATE IS DISABLED
            // =============================================

            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

            // =============================================
            // VALIDATE CREATED BY USER ID
            // =============================================

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

            // =============================================
            // CHECK DUPLICATE PROJECT
            // =============================================

            const existingProject = await checkProjectExists(
                Number(CompanyProductId),
                projectName,
                projectCode
            );

            if (existingProject.length > 0) {

                const duplicateName = existingProject.some(
                    item =>
                        item.ProjectName.trim().toLowerCase() ===
                        projectName.toLowerCase()
                );

                const duplicateCode = existingProject.some(
                    item =>
                        item.ProjectCode.trim().toLowerCase() ===
                        projectCode.toLowerCase()
                );

                if (duplicateName) {
                    return res.status(409).json({
                        status: "error",
                        message: "Project name already exists for this company product"
                    });
                }

                if (duplicateCode) {
                    return res.status(409).json({
                        status: "error",
                        message: "Project code already exists for this company product"
                    });
                }
            }

            // =============================================
            // ADD PROJECT
            // =============================================

            const project = await addProject({

                CompanyProductId: Number(CompanyProductId),

                ProjectName: projectName,

                ProjectCode: projectCode,

                IsDisabled,

                Description: description,

                CreatedByUserId: Number(CreatedByUserId)

            });

            return res.status(201).json({
                status: "success",
                message: "Project added successfully",
                data: project
            });
        }

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

        // =============================================
        // FLAG ID VALIDATION
        // =============================================

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

        if (!Number.isInteger(Number(flagId))) {
            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }

        // =============================================
        // VALIDATE LOGGED-IN COMPANY
        // =============================================

        const loggedInCompanyId = req.user?.CompanyId;

        if (loggedInCompanyId === undefined) {
            return res.status(401).json({
                status: "error",
                message: "User authentication information is missing"
            });
        }

        // =============================================
        // FLAG ID 1 - GET COMPANY PRODUCTS
        // =============================================

        if (Number(flagId) === 1) {

            const companyProducts = await getCompanyProductsForDropdown(
                loggedInCompanyId
            );

            return res.status(200).json({
                status: "success",
                message: "Company products fetched successfully",
                data: companyProducts
            });
        }

        // =============================================
        // FLAG ID 2 - EDIT PROJECT
        // =============================================

        if (Number(flagId) === 2) {

            const {
                ProjectId,
                CompanyProductId,
                ProjectName,
                ProjectCode,
                IsDisabled,
                Description,
                UpdatedByUserId
            } = req.body;

            // =============================================
            // VALIDATE PROJECT ID
            // =============================================

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

            const projectId = Number(ProjectId);

            // =============================================
            // VALIDATE COMPANY PRODUCT ID
            // =============================================

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

            const companyProductId = Number(CompanyProductId);

            // =============================================
            // VALIDATE PROJECT NAME
            // =============================================

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

            const projectName = ProjectName.trim();

            if (projectName.length > 30) {
                return res.status(400).json({
                    status: "error",
                    message: "Project name must not exceed 30 characters"
                });
            }

            const projectNameRegex = /^[A-Za-z\s]+$/;

            if (!projectNameRegex.test(projectName)) {
                return res.status(400).json({
                    status: "error",
                    message: "Project name should contain only alphabets and spaces"
                });
            }

            // =============================================
            // VALIDATE PROJECT CODE
            // =============================================

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

            const projectCode = ProjectCode.trim();

            if (!/^[A-Za-z0-9]{1,15}$/.test(projectCode)) {
                return res.status(400).json({
                    status: "error",
                    message: "Project Code must contain only alphanumeric characters and must not exceed 15 characters"
                });
            }

            // =============================================
            // VALIDATE DESCRIPTION
            // =============================================

            let description = null;

            if (Description !== undefined && Description !== null) {

                if (typeof Description !== "string") {
                    return res.status(400).json({
                        status: "error",
                        message: "Description must be a valid string or null"
                    });
                }

                description = Description.trim();

                if (description.length > 250) {
                    return res.status(400).json({
                        status: "error",
                        message: "Description must not exceed 250 characters"
                    });
                }

                if (
                    description !== "" &&
                    !/[A-Za-z0-9]/.test(description)
                ) {
                    return res.status(400).json({
                        status: "error",
                        message: "Description cannot contain only special characters"
                    });
                }

                if (description === "") {
                    description = null;
                }
            }

            // =============================================
            // VALIDATE IS DISABLED
            // =============================================

            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

            // =============================================
            // VALIDATE UPDATED BY USER ID
            // =============================================

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

            // =============================================
            // CHECK PROJECT EXISTS
            // WITHIN LOGGED-IN COMPANY
            // =============================================

            const projectExists = await getProjectById(
                projectId,
                loggedInCompanyId
            );

            if (projectExists.length === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Project not found"
                });
            }

            // =============================================
            // CHECK COMPANY PRODUCT
            // WITHIN LOGGED-IN COMPANY
            // =============================================

            const companyProductData =
                await checkCompanyProductExists(
                    companyProductId,
                    loggedInCompanyId
                );

            if (companyProductData.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyProductId for this company"
                });
            }

            // =============================================
            // CHECK DUPLICATE PROJECT
            // EXCLUDE CURRENT PROJECT
            // =============================================

            const existingProject =
                await checkProjectExistsForUpdate(
                    companyProductId,
                    projectName,
                    projectCode,
                    projectId,
                    loggedInCompanyId
                );

            if (existingProject.length > 0) {

                const duplicateName = existingProject.some(
                    item =>
                        item.ProjectName.trim().toLowerCase() ===
                        projectName.toLowerCase()
                );

                const duplicateCode = existingProject.some(
                    item =>
                        item.ProjectCode.trim().toLowerCase() ===
                        projectCode.toLowerCase()
                );

                if (duplicateName) {
                    return res.status(409).json({
                        status: "error",
                        message: "Project name already exists for this company product"
                    });
                }

                if (duplicateCode) {
                    return res.status(409).json({
                        status: "error",
                        message: "Project code already exists for this company product"
                    });
                }
            }

            // =============================================
            // UPDATE PROJECT
            // =============================================

            const result = await editProject({

                ProjectId: projectId,

                CompanyProductId: companyProductId,

                ProjectName: projectName,

                ProjectCode: projectCode,

                IsDisabled,

                Description: description,

                UpdatedByUserId: Number(UpdatedByUserId),

                CompanyId: loggedInCompanyId

            });

            // =============================================
            // PROJECT NOT FOUND
            // =============================================

            if (result === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Project not found"
                });
            }

            // =============================================
            // SUCCESS
            // =============================================

            return res.status(200).json({
                status: "success",
                message: "Project updated successfully"
            });
        }

        // =============================================
        // INVALID FLAG ID
        // =============================================

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