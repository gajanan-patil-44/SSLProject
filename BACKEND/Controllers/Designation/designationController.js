import {
    getAllDesignations,
    getCompaniesForDropdown,
    checkCompanyExists,
    checkDesignationData,
    addDesignation,
    getCompaniesForEditDropdown,
    getDesignationById,
    checkDesignationExistsForUpdate,
    editDesignation,
    toggleDesignationStatuses,
    deleteDesignation
} from "../../Models/DesignationModels.js";


// ======================================================
// GET ALL DESIGNATIONS
// ======================================================

export const getDesignation = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // FlagId 1 = Get All Designations
        if (Number(flagId) === 1) {

            const rows = await getAllDesignations();

            return res.status(200).json({
                status: "success",
                message: "Designations fetched successfully",
                data: rows
            });
        }


        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error(
            "Error fetching designations:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch designations",
            error: error.message
        });
    }
};


// ======================================================
// DESIGNATION ADD / DROPDOWN CONTROLLER
// ======================================================

export const designationController = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // ==================================================
        // FLAG ID 1 - GET COMPANIES
        // ==================================================

        if (Number(flagId) === 1) {

            const companies = await getCompaniesForDropdown();

            return res.status(200).json({
                status: "success",
                message: "Companies fetched successfully",
                data: companies
            });
        }


        // ==================================================
        // FLAG ID 2 - ADD DESIGNATION
        // ==================================================

        if (Number(flagId) === 2) {

            const {
                CompanyId,
                DesignationName,
                DesignationCode,
                IsDisabled,
                CreatedByUserName
            } = req.body;


            // ==================================================
            // VALIDATE COMPANY ID
            // ==================================================

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                CompanyId === "" ||
                (!Number(CompanyId)) ||Number(CompanyId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyId"
                });
            }


            // ==================================================
            // CHECK COMPANY EXISTS AND IS ACTIVE
            // ==================================================

            const companyData = await checkCompanyExists(Number(CompanyId));


            if (companyData.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyId"
                });
            }


            // ==================================================
            // VALIDATE DESIGNATION NAME
            // ==================================================

            if (typeof DesignationName !== "string" || !DesignationName.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName is required"
                });
            }


            if (DesignationName.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName cannot exceed 150 characters"
                });
            }


            // ==================================================
            // VALIDATE DESIGNATION CODE
            // ==================================================

            if (typeof DesignationCode !== "string" || !DesignationCode.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode is required"
                });
            }


            if (DesignationCode.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode cannot exceed 150 characters"
                });
            }


            // ==================================================
            // VALIDATE IS DISABLED
            // ==================================================

            if (IsDisabled !== undefined && typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // ==================================================
            // VALIDATE CREATED BY USER
            // ==================================================

            if (typeof CreatedByUserName !== "string" || !CreatedByUserName.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }


            // ==================================================
            // CHECK DUPLICATE DESIGNATION
            // ==================================================

            const existingDesignation =await checkDesignationData(
                    Number(CompanyId),
                    DesignationName.trim(),
                    DesignationCode.trim()
                );


            let nameExists = false;
            let codeExists = false;


            for (const designation of existingDesignation) {

                if (designation.DesignationName && designation.DesignationName.trim().toLowerCase() === DesignationName.trim().toLowerCase()) {

                    nameExists = true;
                }


                if (designation.DesignationCode && designation.DesignationCode.trim().toLowerCase() === DesignationCode.trim().toLowerCase()) {

                    codeExists = true;
                }
            }


            // ==================================================
            // BOTH NAME AND CODE EXIST
            // ==================================================

            if (nameExists && codeExists) {

                return res.status(409).json({
                    status: "error",
                    message: "Designation name and code already exist for this company"
                });
            }


            // ==================================================
            // NAME EXISTS
            // ==================================================

            if (nameExists) {

                return res.status(409).json({
                    status: "error",
                    message: "Designation name already exists for this company"
                });
            }


            // ==================================================
            // CODE EXISTS
            // ==================================================

            if (codeExists) {

                return res.status(409).json({
                    status: "error",
                    message: "Designation code already exists for this company"
                });
            }


            // ==================================================
            // ADD DESIGNATION
            // ==================================================

            const designation =await addDesignation({

                    CompanyId: Number(CompanyId),
                    DesignationName: DesignationName.trim(),
                    DesignationCode: DesignationCode.trim(),
                    IsDisabled: IsDisabled ?? false,
                    CreatedByUserName: CreatedByUserName.trim()
                });


            // ==================================================
            // SUCCESS
            // ==================================================

            return res.status(201).json({
                status: "success",
                message: "Designation added successfully",
                data: designation
            });
        }


        // ==================================================
        // INVALID FLAG ID
        // ==================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        // console.error("Error processing designation:", error);


        return res.status(500).json({
            status: "error",
            message: "Failed to process designation",
            error: error.message
        });
    }
};


// ======================================================
// EDIT DESIGNATION CONTROLLER
// ======================================================

export const editDesignationController = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // ==================================================
        // FLAG ID 1 - GET COMPANIES
        // ==================================================

        if (Number(flagId) === 1) {

            const companies =await getCompaniesForEditDropdown();

            return res.status(200).json({
                status: "success",
                message: "Companies fetched successfully",
                data: companies
            });
        }


        // ==================================================
        // FLAG ID 2 - GET DESIGNATION BY ID
        // ==================================================

        if (Number(flagId) === 2) {

            const {CompanyDesignationId} = req.body;


            // ==================================================
            // VALIDATE DESIGNATION ID
            // ==================================================

            if (
                CompanyDesignationId === undefined ||
                CompanyDesignationId === null ||
                CompanyDesignationId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId is required"
                });
            }


            if (!Number.isInteger(Number(CompanyDesignationId)) || Number(CompanyDesignationId) <= 0) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId must be a valid positive integer"
                });
            }


            // ==================================================
            // GET DESIGNATION
            // ==================================================

            const designation =await getDesignationById(Number(CompanyDesignationId));


            if (designation.length === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }


            return res.status(200).json({
                status: "success",
                message: "Designation fetched successfully",
                data: designation[0]
            });
        }


        // ==================================================
        // FLAG ID 3 - UPDATE DESIGNATION
        // ==================================================

        if (Number(flagId) === 3) {

            const {
                CompanyDesignationId,
                CompanyId,
                DesignationName,
                DesignationCode,
                IsDisabled,
                UpdateByUserName
            } = req.body;


            // ==================================================
            // VALIDATE DESIGNATION ID
            // ==================================================

            if (
                CompanyDesignationId === undefined ||
                CompanyDesignationId === null ||
                CompanyDesignationId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId is required"
                });
            }


            if (!Number.isInteger(Number(CompanyDesignationId)) || Number(CompanyDesignationId) <= 0) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId must be a valid positive integer"
                });
            }


            // ==================================================
            // VALIDATE COMPANY ID
            // ==================================================

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                CompanyId === "" ||
                !Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyId"
                });
            }


            // ==================================================
            // CHECK COMPANY EXISTS AND IS ACTIVE
            // ==================================================

            const companyData =await checkCompanyExists(Number(CompanyId));


            if (companyData.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyId"
                });
            }


            // ==================================================
            // VALIDATE DESIGNATION NAME
            // ==================================================

            if (typeof DesignationName !== "string" || !DesignationName.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName is required"
                });
            }


            if (DesignationName.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName cannot exceed 150 characters"
                });
            }


            // ==================================================
            // VALIDATE DESIGNATION CODE
            // ==================================================

            if (typeof DesignationCode !== "string" || !DesignationCode.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode is required"
                });
            }


            if (DesignationCode.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode cannot exceed 150 characters"
                });
            }


            // ==================================================
            // VALIDATE IS DISABLED
            // ==================================================

            if (IsDisabled !== undefined && typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // ==================================================
            // VALIDATE UPDATED USER
            // ==================================================

            if (typeof UpdateByUserName !== "string" || !UpdateByUserName.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdateByUserName is required"
                });
            }


            // ==================================================
            // CHECK DESIGNATION EXISTS
            // ==================================================

            const existingRecord = await getDesignationById(Number(CompanyDesignationId));


            if (existingRecord.length === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }


            // ==================================================
            // CHECK DUPLICATE DESIGNATION
            // ==================================================

            const duplicateDesignation = await checkDesignationExistsForUpdate(
                    Number(CompanyDesignationId),
                    Number(CompanyId),
                    DesignationName.trim(),
                    DesignationCode.trim()
                );


            let nameExists = false;
            let codeExists = false;


            for (const designation of duplicateDesignation) {

                if (designation.DesignationName && designation.DesignationName.trim().toLowerCase() === DesignationName.trim().toLowerCase()) {

                    nameExists = true;
                }


                if ( designation.DesignationCode && designation.DesignationCode.trim().toLowerCase() ===DesignationCode.trim().toLowerCase()) {

                    codeExists = true;
                }
            }


            // ==================================================
            // BOTH NAME AND CODE EXIST
            // ==================================================

            if (nameExists && codeExists) {

                return res.status(409).json({
                    status: "error",
                    message: "Designation name and code already exist for this company"
                });
            }


            // ==================================================
            // NAME EXISTS
            // ==================================================

            if (nameExists) {

                return res.status(409).json({
                    status: "error",
                    message: "Designation name already exists for this company"
                });
            }


            // ==================================================
            // CODE EXISTS
            // ==================================================

            if (codeExists) {

                return res.status(409).json({
                    status: "error",
                    message: "Designation code already exists for this company"
                });
            }


            // ==================================================
            // UPDATE DESIGNATION
            // ==================================================

            const result =await editDesignation({

                    CompanyDesignationId: Number(CompanyDesignationId),
                    CompanyId: Number(CompanyId),
                    DesignationName: DesignationName.trim(),
                    DesignationCode: DesignationCode.trim(),
                    IsDisabled: IsDisabled ?? existingRecord[0].IsDisabled,
                    UpdateByUserName: UpdateByUserName.trim()
                });


            // ==================================================
            // UPDATE FAILED
            // ==================================================

            if (!result) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }


            // ==================================================
            // SUCCESS
            // ==================================================

            return res.status(200).json({
                status: "success",
                message: "Designation updated successfully",
                data: result
            });
        }

        // ==================================================
        // INVALID FLAG ID
        // ==================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error editing designation:", error);


        if (error.code === "23505") {

            return res.status(409).json({
                status: "error",
                message: "Designation already exists"
            });
        }


        return res.status(500).json({
            status: "error",
            message: "Failed to edit designation",
            error: error.message
        });
    }
};


// ======================================================
// TOGGLE DESIGNATION STATUS CONTROLLER
// ======================================================

export const toggleDesignationStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // ==================================================
        // FLAG ID 4 - TOGGLE DESIGNATION STATUS
        // ==================================================

        if (Number(flagId) === 4) {

            const {
                CompanyDesignationId,
                IsDisabled,
                UpdateByUserName
            } = req.body;


            // ==================================================
            // VALIDATE DESIGNATION ID
            // ==================================================

            if (
                CompanyDesignationId === undefined ||
                CompanyDesignationId === null ||
                CompanyDesignationId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId is required"
                });
            }


            if (!Number.isInteger(Number(CompanyDesignationId)) || Number(CompanyDesignationId) <= 0) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId must be a valid positive integer"
                });
            }


            // ==================================================
            // VALIDATE IS DISABLED
            // ==================================================

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // ==================================================
            // VALIDATE UPDATED USER
            // ==================================================

            if (typeof UpdateByUserName !== "string" || !UpdateByUserName.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdateByUserName is required"
                });
            }


            // ==================================================
            // TOGGLE STATUS
            // ==================================================

            const designation = await toggleDesignationStatuses({

                    CompanyDesignationId: Number(CompanyDesignationId),
                    IsDisabled,
                    UpdateByUserName: UpdateByUserName.trim()
                });


            // ==================================================
            // DESIGNATION NOT FOUND
            // ==================================================

            if (!designation) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }


            // ==================================================
            // SUCCESS
            // ==================================================

            return res.status(200).json({
                status: "success",
                message: "Designation status updated successfully",
                data: designation
            });
        }


        // ==================================================
        // INVALID FLAG ID
        // ==================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId"
        });

    } catch (error) {

        console.error("Error toggling designation status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update designation status",
            error: error.message
        });
    }
};


// ======================================================
// DELETE DESIGNATION CONTROLLER
// ======================================================

export const deleteDesignationController = async (req, res) => {

    const {
        flagId,
        CompanyDesignationId
    } = req.body;


    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // ==================================================
        // FLAG ID 1 - DELETE DESIGNATION
        // ==================================================

        if (Number(flagId) === 1) {


            // ==================================================
            // VALIDATE DESIGNATION ID
            // ==================================================

            if (
                CompanyDesignationId === undefined ||
                CompanyDesignationId === null ||
                CompanyDesignationId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId is required"
                });
            }


            if (!Number.isInteger(Number(CompanyDesignationId)) || Number(CompanyDesignationId) <= 0) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId must be a valid positive integer"
                });
            }


            // ==================================================
            // DELETE DESIGNATION
            // ==================================================

            const result =await deleteDesignation(Number(CompanyDesignationId));


            // ==================================================
            // DESIGNATION NOT FOUND
            // ==================================================

            if (!result) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }


            // ==================================================
            // SUCCESS
            // ==================================================

            return res.status(200).json({
                status: "success",
                message: "Designation deleted successfully",
                data: result
            });
        }


        // ==================================================
        // INVALID FLAG ID
        // ==================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        console.error("Error deleting designation:", error);

        return res.status(500).json({
            status: "error",
            message:"Failed to delete designation",
            error: error.message
        });
    }
};