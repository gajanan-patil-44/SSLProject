import {
    getAllDesignations,
    getCompaniesForDropdown,
    checkCompanyExists,
    checkDesignationExists,
    addDesignation,
    checkDesignationExistsForUpdate,
    editDesignation,
    toggleDesignationStatuses,
    deleteDesignation
} from "../../Models/DesignationModels.js";


// GET ALL DESIGNATIONS

export const getDesignation = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID 1 - GET ALL DESIGNATIONS

        if (parseInt(flagId) === 1) {

            const rows = await getAllDesignations();

            return res.status(200).json({
                status: "success",
                message: "Designations fetched successfully",
                data: rows
            });
        }


        // INVALID FLAG ID
       
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        // console.error("Error fetching designations:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch designations",
            error: error.message
        });
    }
};

export const getCompanyDropdown = async (req, res) => {

    try {

        const { FlagId } = req.body;

        if (parseInt(FlagId) !== 1) {

            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId"
            });
        }

        const companies = await getCompaniesForDropdown();

        return res.status(200).json({
            status: "success",
            message: "Companies fetched successfully",
            data: companies
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};


// ADD DESIGNATION / COMPANY DROPDOWN

export const designationController = async (req, res) => {

    const { flagId } = req.body;

    try {

        // =====================================================
        // FLAG ID 1 - GET COMPANIES FOR DROPDOWN
        // =====================================================

        if (parseInt(flagId) === 1) {

            const companies = await getCompaniesForDropdown();

            return res.status(200).json({
                status: "success",
                message: "Companies fetched successfully",
                data: companies
            });
        }


        // =====================================================
        // FLAG ID 2 - ADD DESIGNATION
        // =====================================================

        if (parseInt(flagId) === 2) {

            const {
                CompanyId,
                DesignationName,
                DesignationCode,
                DesignationLevel,
                IsDisabled,
                CreatedByUserName
            } = req.body;


            // =================================================
            // VALIDATE COMPANY ID
            // =================================================

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                CompanyId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }


            if (
                !Number.isInteger(Number(CompanyId)) ||
                Number(CompanyId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "CompanyId must be a valid positive integer"
                });
            }


            // =================================================
            // VALIDATE DESIGNATION NAME
            // =================================================

            if (
                DesignationName === undefined ||
                DesignationName === null ||
                DesignationName === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName is required"
                });
            }


            if (typeof DesignationName !== "string") {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName must be a string"
                });
            }


            if (DesignationName.trim() === "") {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName is required"
                });
            }


            if (DesignationName.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "DesignationName must not exceed 150 characters"
                });
            }


            // =================================================
            // VALIDATE DESIGNATION CODE
            // =================================================

            if (
                DesignationCode === undefined ||
                DesignationCode === null ||
                DesignationCode === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode is required"
                });
            }


            if (typeof DesignationCode !== "string") {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode must be a string"
                });
            }


            if (DesignationCode.trim() === "") {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode is required"
                });
            }


            if (DesignationCode.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "DesignationCode must not exceed 150 characters"
                });
            }


            // =================================================
            // VALIDATE DESIGNATION LEVEL
            // =================================================

            if (
                DesignationLevel === undefined ||
                DesignationLevel === null ||
                DesignationLevel === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationLevel is required"
                });
            }


            if (
                !Number.isInteger(Number(DesignationLevel)) ||
                Number(DesignationLevel) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "DesignationLevel must be a valid positive integer"
                });
            }


            // =================================================
            // VALIDATE IS DISABLED
            // =================================================

            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message:
                        "IsDisabled must be true or false"
                });
            }


            // =================================================
            // VALIDATE CREATED BY USER NAME
            // =================================================

            if (
                CreatedByUserName === undefined ||
                CreatedByUserName === null ||
                CreatedByUserName === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "CreatedByUserName is required"
                });
            }


            if (typeof CreatedByUserName !== "string") {

                return res.status(400).json({
                    status: "error",
                    message:
                        "CreatedByUserName must be a string"
                });
            }


            if (CreatedByUserName.trim() === "") {

                return res.status(400).json({
                    status: "error",
                    message:
                        "CreatedByUserName is required"
                });
            }


            // =================================================
            // CHECK COMPANY
            // =================================================

            const companyData =
                await checkCompanyExists(
                    Number(CompanyId)
                );


            if (companyData.length === 0) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "Invalid or inactive CompanyId"
                });
            }


            // =================================================
            // CHECK DUPLICATE DESIGNATION
            // =================================================

            const existingDesignation =
                await checkDesignationExists(
                    Number(CompanyId),
                    DesignationName.trim(),
                    DesignationCode.trim()
                );


            if (existingDesignation.length > 0) {

                const duplicate =
                    existingDesignation[0];


                // ---------------------------------------------
                // DUPLICATE NAME
                // ---------------------------------------------

                // if (
                //     duplicate.DesignationName &&
                //     duplicate.DesignationName
                //         .trim()
                //         .toLowerCase() ===
                //     DesignationName
                //         .trim()
                //         .toLowerCase()
                // ) {

                //     return res.status(409).json({
                //         status: "error",
                //         message:
                //             "Designation name already exists for this company"
                //     });
                // }


                // ---------------------------------------------
                // DUPLICATE CODE
                // ---------------------------------------------

                if (
                    duplicate.DesignationCode &&
                    duplicate.DesignationCode
                        .trim()
                        .toLowerCase() ===
                    DesignationCode
                        .trim()
                        .toLowerCase()
                ) {

                    return res.status(409).json({
                        status: "error",
                        message:
                            "Designation code already exists for this company"
                    });
                }
            }


            // =================================================
            // ADD DESIGNATION
            // =================================================

            const designation =
                await addDesignation({

                    CompanyId:
                        Number(CompanyId),

                    DesignationName:
                        DesignationName.trim(),

                    DesignationCode:
                        DesignationCode.trim(),

                    DesignationLevel:
                        Number(DesignationLevel),

                    IsDisabled:
                        IsDisabled,

                    CreatedByUserName:
                        CreatedByUserName.trim()
                });


            // =================================================
            // SUCCESS
            // =================================================

            return res.status(201).json({

                status: "success",

                message:
                    "Designation added successfully",

                data: designation
            });
        }


        // =====================================================
        // INVALID FLAG ID
        // =====================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message:
                "Failed to process designation",
            error:
                error.message
        });
    }
};


// EDIT DESIGNATION


export const editDesignationController = async (req, res) => {
    try {
        const { flagId } = req.body;

        // ==========================================================
        // FLAG ID VALIDATION
        // ==========================================================

        if (
            flagId === undefined ||
            flagId === null ||
            String(flagId).trim() === ""
        ) {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        // ==========================================================
        // FLAG ID 1 - GET COMPANIES
        // ==========================================================

        if (Number(flagId) === 1) {
            const companies = await getCompaniesForDropdown();

            return res.status(200).json({
                status: "success",
                message: "Companies fetched successfully",
                data: companies
            });
        }

        // ==========================================================
        // FLAG ID 2 - EDIT DESIGNATION
        // ==========================================================

        if (Number(flagId) === 2) {
            const {
                CompanyDesignationId,
                CompanyId,
                DesignationName,
                DesignationCode,
                IsDisabled,
                UpdateByUserName,
                CanBeReportingManager
            } = req.body;

            // ------------------------------------------------------
            // VALIDATE COMPANY DESIGNATION ID
            // ------------------------------------------------------

            if (
                CompanyDesignationId === undefined ||
                CompanyDesignationId === null ||
                String(CompanyDesignationId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId is required"
                });
            }

            const designationId = Number(CompanyDesignationId);

            if (
                !Number.isInteger(designationId) ||
                designationId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message:
                        "CompanyDesignationId must be a valid positive integer"
                });
            }

            // ------------------------------------------------------
            // VALIDATE COMPANY ID
            // ------------------------------------------------------

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                String(CompanyId).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            const companyId = Number(CompanyId);

            if (!Number.isInteger(companyId) || companyId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId must be a valid positive integer"
                });
            }

            // ------------------------------------------------------
            // VALIDATE DESIGNATION NAME
            // ------------------------------------------------------

            if (
                typeof DesignationName !== "string" ||
                DesignationName.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationName is required and must be a string"
                });
            }

            const designationName = DesignationName.trim();

            if (designationName.length > 150) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationName must not exceed 150 characters"
                });
            }

            // ------------------------------------------------------
            // VALIDATE DESIGNATION CODE
            // ------------------------------------------------------

            if (
                typeof DesignationCode !== "string" ||
                DesignationCode.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode is required and must be a string"
                });
            }

            const designationCode = DesignationCode.trim();

            if (designationCode.length > 150) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode must not exceed 150 characters"
                });
            }

            // ------------------------------------------------------
            // VALIDATE IS DISABLED
            // Supports boolean values and form-data strings
            // ------------------------------------------------------

            let isDisabled;

            if (typeof IsDisabled === "boolean") {
                isDisabled = IsDisabled;
            } else if (IsDisabled === "true") {
                isDisabled = true;
            } else if (IsDisabled === "false") {
                isDisabled = false;
            } else {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

            // ------------------------------------------------------
            // VALIDATE UPDATED BY USER NAME
            // ------------------------------------------------------

            if (
                typeof UpdateByUserName !== "string" ||
                UpdateByUserName.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "UpdateByUserName is required"
                });
            }

            const updatedBy = UpdateByUserName.trim();

            // ------------------------------------------------------
            // VALIDATE CAN BE REPORTING MANAGER
            // Optional if not supplied
            // ------------------------------------------------------

            let canBeReportingManager;

            if (
                CanBeReportingManager === undefined ||
                CanBeReportingManager === null ||
                CanBeReportingManager === ""
            ) {
                canBeReportingManager = undefined;
            } else if (typeof CanBeReportingManager === "boolean") {
                canBeReportingManager = CanBeReportingManager;
            } else if (CanBeReportingManager === "true") {
                canBeReportingManager = true;
            } else if (CanBeReportingManager === "false") {
                canBeReportingManager = false;
            } else {
                return res.status(400).json({
                    status: "error",
                    message: "CanBeReportingManager must be true or false"
                });
            }

            // ------------------------------------------------------
            // CHECK COMPANY EXISTS
            // ------------------------------------------------------

            const companyData = await checkCompanyExists(companyId);

            if (!companyData || companyData.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid or inactive CompanyId"
                });
            }

            // ------------------------------------------------------
            // CHECK DUPLICATE DESIGNATION
            // Exclude current designation record
            // ------------------------------------------------------

            const existingDesignation =
                await checkDesignationExistsForUpdate(
                    companyId,
                    designationName,
                    designationCode,
                    designationId
                );

            if (
                existingDesignation &&
                existingDesignation.length > 0
            ) {
                const duplicateName = existingDesignation.some(
                    (item) =>
                        item.DesignationName &&
                        item.DesignationName.trim().toLowerCase() ===
                            designationName.toLowerCase()
                );

                const duplicateCode = existingDesignation.some(
                    (item) =>
                        item.DesignationCode &&
                        item.DesignationCode.trim().toLowerCase() ===
                            designationCode.toLowerCase()
                );

                if (duplicateName) {
                    return res.status(409).json({
                        status: "error",
                        message:
                            "Designation name already exists for this company"
                    });
                }

                if (duplicateCode) {
                    return res.status(409).json({
                        status: "error",
                        message:
                            "Designation code already exists for this company"
                    });
                }
            }

            // ------------------------------------------------------
            // UPDATE DESIGNATION
            // ------------------------------------------------------

            const updateData = {
                CompanyDesignationId: designationId,
                CompanyId: companyId,
                DesignationName: designationName,
                DesignationCode: designationCode,
                IsDisabled: isDisabled,
                UpdateByUserName: updatedBy
            };

            // Preserve the existing value if the optional field
            // was not provided. The model must support this behavior.
            if (canBeReportingManager !== undefined) {
                updateData.CanBeReportingManager =
                    canBeReportingManager;
            }

            const result = await editDesignation(updateData);

            // ------------------------------------------------------
            // CHECK UPDATE RESULT
            // ------------------------------------------------------

            if (
                result === 0 ||
                result === null ||
                result === undefined
            ) {
                return res.status(404).json({
                    status: "error",
                    message: "Designation not found or no record updated"
                });
            }

            // ------------------------------------------------------
            // SUCCESS
            // ------------------------------------------------------

            return res.status(200).json({
                status: "success",
                message: "Designation updated successfully",
                data: result
            });
        }

        // ==========================================================
        // INVALID FLAG ID
        // ==========================================================

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId. Use 1 or 2"
        });

    } catch (error) {
        console.error("Error editing designation:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to edit designation",
            error: error.message
        });
    }
};




// TOGGLE DESIGNATION STATUS

export const toggleDesignationStatus = async (req, res) => {

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


        // FLAG ID 4 - TOGGLE DESIGNATION STATUS

        if (parseInt(flagId) === 4) {

            const {
                CompanyDesignationId,
                IsDisabled,
                UpdateByUserName
            } = req.body;


            // VALIDATE COMPANY DESIGNATION ID

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


            if (
                !Number.isInteger(Number(CompanyDesignationId)) ||
                Number(CompanyDesignationId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId must be a valid positive integer"
                });
            }


            // VALIDATE IS DISABLED
    
            if (typeof IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // VALIDATE UPDATED BY USER NAME

            if (
                UpdateByUserName === undefined ||
                UpdateByUserName === null ||
                UpdateByUserName === "" ||
                typeof UpdateByUserName !== "string" ||
                UpdateByUserName.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdateByUserName is required"
                });
            }


            // UPDATE DESIGNATION STATUS
            
            const designationData = await toggleDesignationStatuses({
                CompanyDesignationId: Number(CompanyDesignationId),
                IsDisabled,
                UpdateByUserName: UpdateByUserName.trim()
            });


        
            // DESIGNATION DOES NOT EXIST
            
            if (!designationData) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }

           
            // SUCCESS
           
            return res.status(200).json({
                status: "success",
                message: "Designation status updated successfully"
            });
        }


        // INVALID FLAG ID
       
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        // console.error("Error toggling designation status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update designation status",
            error: error.message
        });
    }
};


// DELETE DESIGNATION


export const deleteDesignationController = async (req, res) => {

    const {
        flagId,
        CompanyDesignationId
    } = req.body;

    try {

        // FLAG ID 1 - DELETE DESIGNATION
      

        if (parseInt(flagId) === 1) {

            // VALIDATE ID

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


            if (
                !Number.isInteger(Number(CompanyDesignationId)) ||
                Number(CompanyDesignationId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyDesignationId must be a valid positive integer"
                });
            }


            // DELETE

            const result = await deleteDesignation(Number(CompanyDesignationId));

            // NOT FOUND

            if (result === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }


            // SUCCESS

            return res.status(200).json({
                status: "success",
                message: "Designation deleted successfully",
                data: result
            });
        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        // console.error("Error deleting designation:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to delete designation",
            error: error.message
        });
    }
};