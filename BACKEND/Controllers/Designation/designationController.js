import {
    getAllDesignations,
    getCompaniesForDropdown,
    checkCompanyExists,
    addDesignation,
    checkDesignationExistsForUpdate,
    editDesignation,
    toggleDesignationStatuses,
    deleteDesignation,
    fetchcompany,
    fetchDeisgnationDpwn,
    InsertCompanyDesignations,
    checkDesignationExists,
    checkCompanyDesignationExists,
    fecthCompanyDesignatioView,
    getCompanyDesignationById,
    checkCompanyDesignationExistsForUpdate,
    updateCompanyDesignation,
    toggleCompanyDesignationStatus
} from "../../Models/DesignationModels.js";


// GET ALL DESIGNATIONS

export const getDesignation = async (req, res) => {

    const { flagId } = req.body;

    try {

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

        if (Number(FlagId) !== 1) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId"
            });
        }

        const loggedInCompanyId = req.user?.CompanyId;

        if (loggedInCompanyId === undefined) {
            return res.status(401).json({
                status: "error",
                message: "User authentication information is missing"
            });
        }

        const companies = await getCompaniesForDropdown(loggedInCompanyId);

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
export const add_designationController = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID 2 - ADD DESIGNATION
        if (parseInt(flagId) === 2) {

            const {
                DesignationName,
                DesignationCode,
                DesignationDescription,
                IsDisabled,
                CreatedByUserName
            } = req.body;


            // VALIDATE DESIGNATION NAME

            if (
                typeof DesignationName !== "string" ||
                DesignationName.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationName is required"
                });
            }

            if (DesignationName.trim().length > 150) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationName must not exceed 150 characters"
                });
            }


            // VALIDATE DESIGNATION CODE (SMALLINT)

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


            // VALIDATE IS DISABLED

            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }


            // VALIDATE CREATED BY USER NAME

            if (
                typeof CreatedByUserName !== "string" ||
                CreatedByUserName.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }


            // ADD DESIGNATION

            const designation = await addDesignation({

                DesignationName: DesignationName.trim(),

                DesignationCode: Number(DesignationCode),

                DesignationDescription:
                    DesignationDescription?.trim() || null,

                IsDisabled: IsDisabled,

                CreatedByUserName: CreatedByUserName.trim()

            });


            return res.status(201).json({

                status: "success",
                message: "Designation added successfully",
                data: designation

            });

        }


        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId."
        });

    } catch (error) {

        if (error.code === "23505") {
            return res.status(409).json({
                status: "error",
                message: "Designation name or code already exists"
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to add designation",
            error: error.message
        });
    }
};
// EDIT DESIGNATION
export const editDesignationController = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID 2 - EDIT DESIGNATION

        if (parseInt(flagId) === 2) {

            const {
                DesignationId,
                DesignationName,
                DesignationCode,
                DesignationDescription,
                IsDisabled,
                UpdatedByUserName
            } = req.body;


            // VALIDATE DESIGNATION ID

            if (
                DesignationId === undefined ||
                DesignationId === null ||
                DesignationId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationId is required"
                });
            }


            if (
                !Number.isInteger(Number(DesignationId)) ||
                Number(DesignationId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationId must be a valid positive integer"
                });
            }


            // VALIDATE DESIGNATION NAME

            if (
                typeof DesignationName !== "string" ||
                DesignationName.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName is required"
                });
            }


            const designationNameRegex = /^[A-Za-z\s]+$/;

            if (!designationNameRegex.test(DesignationName.trim())) {

                return res.status(400).json({
                    status: "error",
                    message: "Designation name should contain only alphabets and spaces"
                });
            }


            if (DesignationName.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationName must not exceed 150 characters"
                });
            }


            // VALIDATE DESIGNATION CODE

            if (
                typeof DesignationCode !== "string" ||
                DesignationCode.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode is required"
                });
            }


            if (DesignationCode.trim().length > 150) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationCode must not exceed 150 characters"
                });
            }


            // VALIDATE DESIGNATION DESCRIPTION

            if (
                DesignationDescription !== undefined &&
                DesignationDescription !== null &&
                typeof DesignationDescription !== "string"
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DesignationDescription must be a string"
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
                typeof UpdatedByUserName !== "string" ||
                UpdatedByUserName.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }


            // CHECK DUPLICATE DESIGNATION

            const existingDesignation = await checkDesignationExistsForUpdate(
                DesignationName.trim(),
                DesignationCode.trim(),
                Number(DesignationId)
            );


            if (existingDesignation.length > 0) {

                const duplicate = existingDesignation[0];


                if (
                    duplicate.DesignationName.trim().toLowerCase() ===
                    DesignationName.trim().toLowerCase()
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Designation name already exists"
                    });
                }


                if (
                    duplicate.DesignationCode &&
                    duplicate.DesignationCode.trim().toLowerCase() ===
                    DesignationCode.trim().toLowerCase()
                ) {

                    return res.status(409).json({
                        status: "error",
                        message: "Designation code already exists"
                    });
                }
            }


            // PATCH UPDATE DESIGNATION

            const result = await editDesignation({

                DesignationId: Number(DesignationId),

                DesignationName: DesignationName.trim(),

                DesignationCode: DesignationCode.trim(),

                DesignationDescription:
                    DesignationDescription?.trim() || null,

                IsDisabled,

                UpdatedByUserName: UpdatedByUserName.trim()

            });


            // NOT FOUND

            if (!result) {

                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }


            // SUCCESS

            return res.status(200).json({
                status: "success",
                message: "Designation updated successfully",
                data: result
            });

        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId"
        });

    } catch (error) {

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

        // FLAG ID VALIDATION

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

        // FLAG ID 4 = TOGGLE DESIGNATION STATUS

        if (Number(flagId) === 4) {

            const {
                DesignationId,
                IsDisabled,
                UpdatedByUserName
            } = req.body;

            // DESIGNATION ID VALIDATION

            if (
                DesignationId === undefined ||
                DesignationId === null ||
                DesignationId === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationId is required"
                });
            }

            const designationId = Number(DesignationId);

            if (
                !Number.isInteger(designationId) ||
                designationId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DesignationId must be a valid positive integer"
                });
            }

            // STATUS VALIDATION

            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });
            }

            // UPDATED USER VALIDATION

            if (
                typeof UpdatedByUserName !== "string" ||
                UpdatedByUserName.trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }

            // UPDATE DESIGNATION STATUS

            const designationData = await toggleDesignationStatuses({

                DesignationId: designationId,
                IsDisabled,
                UpdatedByUserName: UpdatedByUserName.trim()

            });

            // DESIGNATION NOT FOUND

            if (!designationData) {
                return res.status(404).json({
                    status: "error",
                    message: "Designation not found"
                });
            }

            // SUCCESS RESPONSE

            return res.status(200).json({
                status: "success",
                message: "Designation status updated successfully",
                data: designationData
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
export const companyDesignationDpdwn =async(req,res)=>{
    const {flagId} = req.body
    try {
        let result
        if(parseInt(flagId)===1){
            result = await fetchcompany()
        }else if(parseInt(flagId)===2){
            result = await fetchDeisgnationDpwn()
        } else{
            return res.status(404).json({status:false, message:"FlagdId is Required"})
        }
        return res.status(200).json({status:true, message:"The companyDesignationDropDown fetched successfully.", result})
    } catch (error) {
        return res.status(500).json({status:false, message:"Internal Server Error"})
    }
}
export const insertCompanyDesignation = async (req, res) => {

    const { flagId } = req.body;

    try {

        // VALIDATE FLAG ID

        if (
            flagId === undefined ||
            flagId === null ||
            flagId === ""
        ) {

            return res.status(400).json({
                status: false,
                message: "flagId is required"
            });
        }


        // FLAG ID 1 - INSERT COMPANY DESIGNATION

        if (parseInt(flagId) === 1) {

            const {
                CompanyId,
                DesignationId,
                DesignationLevel,
                CanBeReportingManager,
                CreatedByUserName
            } = req.body;


            // VALIDATE COMPANY ID

            if (
                CompanyId === undefined ||
                CompanyId === null ||
                CompanyId === ""
            ) {

                return res.status(400).json({
                    status: false,
                    message: "CompanyId is required"
                });
            }

            if (
                !Number.isInteger(Number(CompanyId)) ||
                Number(CompanyId) <= 0 ||
                Number(CompanyId) > 32767
            ) {

                return res.status(400).json({
                    status: false,
                    message: "CompanyId must be a valid positive SMALLINT"
                });
            }


            // VALIDATE DESIGNATION ID

            if (
                DesignationId === undefined ||
                DesignationId === null ||
                DesignationId === ""
            ) {

                return res.status(400).json({
                    status: false,
                    message: "DesignationId is required"
                });
            }

            if (
                !Number.isInteger(Number(DesignationId)) ||
                Number(DesignationId) <= 0 ||
                Number(DesignationId) > 32767
            ) {

                return res.status(400).json({
                    status: false,
                    message: "DesignationId must be a valid positive SMALLINT"
                });
            }


            // VALIDATE DESIGNATION LEVEL

            if (
                DesignationLevel === undefined ||
                DesignationLevel === null ||
                DesignationLevel === ""
            ) {

                return res.status(400).json({
                    status: false,
                    message: "DesignationLevel is required"
                });
            }

            if (
                !Number.isInteger(Number(DesignationLevel)) ||
                Number(DesignationLevel) < 0 ||
                Number(DesignationLevel) > 32767
            ) {

                return res.status(400).json({
                    status: false,
                    message: "DesignationLevel must be a valid SMALLINT"
                });
            }


            // VALIDATE CAN BE REPORTING MANAGER

            if (typeof CanBeReportingManager !== "boolean") {

                return res.status(400).json({
                    status: false,
                    message: "CanBeReportingManager must be true or false"
                });
            }


            // VALIDATE CREATED BY USER NAME

            if (
                typeof CreatedByUserName !== "string" ||
                CreatedByUserName.trim() === ""
            ) {

                return res.status(400).json({
                    status: false,
                    message: "CreatedByUserName is required"
                });
            }


            // CHECK COMPANY EXISTS

            const companyData = await checkCompanyExists(
                Number(CompanyId)
            );

            if (!companyData) {

                return res.status(404).json({
                    status: false,
                    message: "Company not found"
                });
            }


            // CHECK DESIGNATION EXISTS

            const designationData = await checkDesignationExists(
                Number(DesignationId)
            );

            if (!designationData) {

                return res.status(404).json({
                    status: false,
                    message: "Designation not found"
                });
            }


            // CHECK DUPLICATE COMPANY DESIGNATION

            const existingData = await checkCompanyDesignationExists(
                Number(CompanyId),
                Number(DesignationId)
            );

            if (existingData) {

                return res.status(409).json({
                    status: false,
                    message: "This designation is already assigned to this company"
                });
            }


            // INSERT COMPANY DESIGNATION

            const result = await InsertCompanyDesignations({

                CompanyId: Number(CompanyId),

                DesignationId: Number(DesignationId),

                DesignationLevel: Number(DesignationLevel),

                CanBeReportingManager,

                CreatedByUserName: CreatedByUserName.trim()

            });


            // SUCCESS

            return res.status(201).json({
                status: true,
                message: "Company designation inserted successfully",
                data: result
            });

        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: false,
            message: "Failed to insert company designation",
            error: error.message
        });
    }
};

export const fetchCompanyDesignationView = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        // VALIDATE FLAG ID

        if (
            flagId === undefined ||
            flagId === null ||
            flagId === ""
        ) {

            return res.status(400).json({
                status: false,
                message: "flagId is required"
            });
        }


        // FLAG ID 1 - FETCH COMPANY DESIGNATION VIEW

        if (parseInt(flagId) === 1) {


            // VALIDATE COMPANY ID IF PROVIDED

            if (
                CompanyId !== undefined &&
                CompanyId !== null &&
                CompanyId !== ""
            ) {

                if (
                    !Number.isInteger(Number(CompanyId)) ||
                    Number(CompanyId) <= 0 ||
                    Number(CompanyId) > 32767
                ) {

                    return res.status(400).json({
                        status: false,
                        message: "CompanyId must be a valid positive integer"
                    });
                }

            }


            // FETCH COMPANY DESIGNATION VIEW

            const result = await fecthCompanyDesignatioView(
                CompanyId === undefined ||
                CompanyId === null ||
                CompanyId === ""
                    ? null
                    : Number(CompanyId)
            );


            // NO RECORDS FOUND

            if (result.length === 0) {

                return res.status(404).json({
                    status: false,
                    message: "No company designation records found",
                    data: []
                });
            }


            // SUCCESS

            return res.status(200).json({
                status: true,
                message: "Company designation view fetched successfully",
                data: result
            });

        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: false,
            message: "Failed to fetch company designation view",
            error: error.message
        });
    }
};


export const editCompanyDesignation = async (req, res) => {

    const { flagId, CompanyDesignationId, ...updateData } = req.body;

    try {

        // FLAG ID 2 - EDIT COMPANY DESIGNATION
        if (parseInt(flagId) === 2) {

            // Validate CompanyDesignationId
            if (
                !Number.isInteger(Number(CompanyDesignationId)) ||
                Number(CompanyDesignationId) <= 0
            ) {
                return res.status(400).json({
                    status: false,
                    message: "Valid CompanyDesignationId is required"
                });
            }

            // At least one field must be provided
            const allowedFields = [
                "CompanyId",
                "DesignationId",
                "DesignationLevel",
                "CanBeReportingManager",
                "IsDisabled",
                "UpdateByUserName"
            ];

            const fieldsToUpdate = Object.keys(updateData).filter(
                field => allowedFields.includes(field)
            );

            if (fieldsToUpdate.length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "At least one field is required to update"
                });
            }

            // UpdateByUserName is mandatory for audit
            if (
                !updateData.UpdateByUserName ||
                typeof updateData.UpdateByUserName !== "string" ||
                !updateData.UpdateByUserName.trim()
            ) {
                return res.status(400).json({
                    status: false,
                    message: "UpdateByUserName is required"
                });
            }

            // Check existing record
            const existingRecord = await getCompanyDesignationById(
                Number(CompanyDesignationId)
            );

            if (!existingRecord) {
                return res.status(404).json({
                    status: false,
                    message: "Company designation record not found"
                });
            }

            // Merge existing values with the received PATCH fields
            const finalCompanyId = Object.prototype.hasOwnProperty.call(
                updateData, "CompanyId"
            )
                ? updateData.CompanyId
                : existingRecord.CompanyId;

            const finalDesignationId = Object.prototype.hasOwnProperty.call(
                updateData, "DesignationId"
            )
                ? updateData.DesignationId
                : existingRecord.DesignationId;

            // Validate CompanyId (nullable column)
            if (finalCompanyId !== null) {

                if (
                    !Number.isInteger(Number(finalCompanyId)) ||
                    Number(finalCompanyId) <= 0 ||
                    Number(finalCompanyId) > 32767
                ) {
                    return res.status(400).json({
                        status: false,
                        message: "CompanyId must be a valid positive smallint or null"
                    });
                }

                const companyExists = await checkCompanyExists(
                    Number(finalCompanyId)
                );

                if (!companyExists) {
                    return res.status(404).json({
                        status: false,
                        message: "Company not found or disabled"
                    });
                }
            }

            // Validate DesignationId
            if (
                !Number.isInteger(Number(finalDesignationId)) ||
                Number(finalDesignationId) <= 0 ||
                Number(finalDesignationId) > 32767
            ) {
                return res.status(400).json({
                    status: false,
                    message: "Valid DesignationId is required"
                });
            }

            const designationExists = await checkDesignationExists(
                Number(finalDesignationId)
            );

            if (!designationExists) {
                return res.status(404).json({
                    status: false,
                    message: "Designation not found or disabled"
                });
            }

            // Validate DesignationLevel if supplied
            if (Object.prototype.hasOwnProperty.call(updateData, "DesignationLevel")) {

                const level = updateData.DesignationLevel;

                if (
                    level !== null &&
                    (
                        !Number.isInteger(Number(level)) ||
                        Number(level) < 0 ||
                        Number(level) > 32767
                    )
                ) {
                    return res.status(400).json({
                        status: false,
                        message: "DesignationLevel must be a valid smallint or null"
                    });
                }
            }

            // Validate CanBeReportingManager
            if (
                Object.prototype.hasOwnProperty.call(updateData, "CanBeReportingManager") &&
                typeof updateData.CanBeReportingManager !== "boolean"
            ) {
                return res.status(400).json({
                    status: false,
                    message: "CanBeReportingManager must be true or false"
                });
            }

            // Validate IsDisabled
            if (
                Object.prototype.hasOwnProperty.call(updateData, "IsDisabled") &&
                typeof updateData.IsDisabled !== "boolean"
            ) {
                return res.status(400).json({
                    status: false,
                    message: "IsDisabled must be true or false"
                });
            }

            // Check duplicate company-designation mapping
            const duplicate = await checkCompanyDesignationExistsForUpdate(
                finalCompanyId === null ? null : Number(finalCompanyId),
                Number(finalDesignationId),
                Number(CompanyDesignationId)
            );

            if (duplicate) {
                return res.status(409).json({
                    status: false,
                    message: "This designation is already mapped to the selected company"
                });
            }

            // Prepare update data
            const finalUpdateData = {};

            for (const field of fieldsToUpdate) {
                finalUpdateData[field] = updateData[field];
            }

            if (Object.prototype.hasOwnProperty.call(finalUpdateData, "CompanyId")) {
                finalUpdateData.CompanyId =
                    finalUpdateData.CompanyId === null
                        ? null
                        : Number(finalUpdateData.CompanyId);
            }

            if (Object.prototype.hasOwnProperty.call(finalUpdateData, "DesignationId")) {
                finalUpdateData.DesignationId = Number(finalUpdateData.DesignationId);
            }

            if (Object.prototype.hasOwnProperty.call(finalUpdateData, "DesignationLevel")) {
                finalUpdateData.DesignationLevel =
                    finalUpdateData.DesignationLevel === null
                        ? null
                        : Number(finalUpdateData.DesignationLevel);
            }

            const result = await updateCompanyDesignation(
                Number(CompanyDesignationId),
                finalUpdateData
            );

            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Company designation record not found"
                });
            }

            return res.status(200).json({
                status: true,
                message: "Company designation updated successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {
        console.error("Edit Company Designation Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};







export const toggleCompanyDesignationController = async (req, res) => {

    const {
        flagId,
        CompanyDesignationId,
        IsDisabled,
        UpdateByUserName
    } = req.body;

    try {

        // FLAG ID 3 - ACTIVATE / DEACTIVATE COMPANY DESIGNATION
        if (parseInt(flagId) === 3) {

            // Validate CompanyDesignationId
            if (
                !Number.isInteger(Number(CompanyDesignationId)) ||
                Number(CompanyDesignationId) <= 0
            ) {
                return res.status(400).json({
                    status: false,
                    message: "Valid CompanyDesignationId is required"
                });
            }

            // Validate IsDisabled
            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: false,
                    message: "IsDisabled must be true or false"
                });
            }

            // Validate UpdateByUserName
            if (
                !UpdateByUserName ||
                typeof UpdateByUserName !== "string" ||
                !UpdateByUserName.trim()
            ) {
                return res.status(400).json({
                    status: false,
                    message: "UpdateByUserName is required"
                });
            }

            const result = await toggleCompanyDesignationStatus(
                Number(CompanyDesignationId),
                IsDisabled,
                UpdateByUserName.trim()
            );

            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Company designation record not found"
                });
            }

            return res.status(200).json({
                status: true,
                message: IsDisabled
                    ? "Company designation deactivated successfully"
                    : "Company designation activated successfully",
                data: result
            });
        }

        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Toggle Company Designation Status Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};