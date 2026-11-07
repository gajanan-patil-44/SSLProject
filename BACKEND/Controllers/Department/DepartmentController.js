import {
    getAllDepartments,
    checkDepartmentCodeExists,
    checkDepartmentCodeExistsForUpdate,
    addDepartmentModel,
    updateDepartmentModel,
    toggleDepartmentStatusModel,
    fetchcompany,
    fetchDepartmentDown,
    InsertCompanyDepartments,
    checkCompanyExists,
    checkDepartmentExists,
    checkCompanyDepartmentExists,
    fetchCompanyDepartmentView,
    getCompanyDepartmentById,
    checkCompanyDepartmentExistsForUpdate,
    updateCompanyDepartment,
    toggleCompanyDepartmentStatus
} from "../../Models/Department/DepartmentModel.js";


// GET ALL DEPARTMENTS
export const getDepartments = async (req, res) => {
    const { flagId } = req.body;

    try {
        if (flagId === undefined || flagId === null || flagId === "") {
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

        // FlagId 1 = Get All Departments
        if (Number(flagId) === 1) {
            const rows = await getAllDepartments();

            return res.status(200).json({
                status: "success",
                message: "Departments fetched successfully",
                data: rows
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch departments",
            error: error.message
        });
    }
};
// ADD DEPARTMENT

export const addDepartment = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (flagId === undefined || flagId === null || flagId === "") {
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

        // FlagId 2 = Add Department

        if (Number(flagId) === 2) {

            const departmentData = req.body;

            // Department Name Validation

            if (
                !departmentData.DepartmentName ||
                String(departmentData.DepartmentName).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentName is required"
                });
            }

            // Department Code Validation

            if (
                !departmentData.DepartmentCode ||
                String(departmentData.DepartmentCode).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentCode is required"
                });
            }

            // Created By Validation

            if (
                !departmentData.CreatedByUserName ||
                String(departmentData.CreatedByUserName).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }

            // Trim Values

            const departmentName = String(departmentData.DepartmentName).trim();
            const departmentCode = String(departmentData.DepartmentCode).trim();
            const createdByUserName = String(departmentData.CreatedByUserName).trim();

            // Length Validation

            if (departmentName.length > 150) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentName cannot exceed 150 characters"
                });
            }

            if (departmentCode.length > 150) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentCode cannot exceed 150 characters"
                });
            }

            // Duplicate Department Code Check

            const existingDepartment = await checkDepartmentCodeExists(departmentCode);

            if (existingDepartment.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "Department code already exists"
                });
            }

            // Add Department

            const department = await addDepartmentModel({
                DepartmentName: departmentName,
                DepartmentCode: departmentCode,
                CreatedByUserName: createdByUserName
            });

            return res.status(201).json({
                status: "success",
                message: "Department added successfully",
                data: department
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to add department",
            error: error.message
        });
    }
};
// UPDATE DEPARTMENT

export const updateDepartment = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID VALIDATION

        if (flagId === undefined || flagId === null || flagId === "") {
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

        // FlagId 3 = Update Department

        if (Number(flagId) === 3) {

            const departmentData = req.body;

            // DEPARTMENT ID VALIDATION

            if (
                departmentData.DepartmentId === undefined ||
                departmentData.DepartmentId === null ||
                departmentData.DepartmentId === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentId is required"
                });
            }

            const departmentId = Number(departmentData.DepartmentId);

            if (
                !Number.isInteger(departmentId) ||
                departmentId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentId must be a valid positive number"
                });
            }

            // DEPARTMENT NAME VALIDATION

            if (
                !departmentData.DepartmentName ||
                String(departmentData.DepartmentName).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentName is required"
                });
            }

            // DEPARTMENT CODE VALIDATION

            if (
                !departmentData.DepartmentCode ||
                String(departmentData.DepartmentCode).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentCode is required"
                });
            }

            // UPDATED BY VALIDATION

            if (
                !departmentData.UpdatedByUserName ||
                String(departmentData.UpdatedByUserName).trim() === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }

            // TRIM VALUES

            const departmentName = String(
                departmentData.DepartmentName
            ).trim();

            const departmentCode = String(
                departmentData.DepartmentCode
            ).trim();

            const updatedByUserName = String(
                departmentData.UpdatedByUserName
            ).trim();

            // LENGTH VALIDATION

            if (departmentName.length > 150) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentName cannot exceed 150 characters"
                });
            }

            if (departmentCode.length > 150) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentCode cannot exceed 150 characters"
                });
            }

            // CHECK DUPLICATE DEPARTMENT CODE
            // EXCLUDE CURRENT DEPARTMENT

            const existingDepartments =
                await checkDepartmentCodeExistsForUpdate(
                    departmentCode,
                    departmentId
                );

            if (existingDepartments.length > 0) {
                return res.status(409).json({
                    status: "error",
                    message: "Department code already exists"
                });
            }

            // UPDATE DEPARTMENT

            const department = await updateDepartmentModel({

                DepartmentId: departmentId,
                DepartmentName: departmentName,
                DepartmentCode: departmentCode,
                UpdatedByUserName: updatedByUserName

            });

            // RECORD NOT FOUND

            if (department === 0) {
                return res.status(404).json({
                    status: "error",
                    message: "Department not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Department updated successfully"
            });
        }

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to update department",
            error: error.message
        });
    }
};
// TOGGLE DEPARTMENT STATUS
export const toggleDepartmentStatus = async (req, res) => {

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

        // FLAG ID 4 = TOGGLE DEPARTMENT STATUS

        if (Number(flagId) === 4) {

            const {
                DepartmentId,
                IsDisabled,
                UpdatedByUserName
            } = req.body;

            // DEPARTMENT ID VALIDATION

            if (
                DepartmentId === undefined ||
                DepartmentId === null ||
                DepartmentId === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentId is required"
                });
            }

            const departmentId = Number(DepartmentId);

            if (
                !Number.isInteger(departmentId) ||
                departmentId <= 0
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "DepartmentId must be a valid positive integer"
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

            // UPDATE DEPARTMENT STATUS

            const department = await toggleDepartmentStatusModel({

                DepartmentId: departmentId,
                IsDisabled,
                UpdatedByUserName: UpdatedByUserName.trim()

            });

            // DEPARTMENT NOT FOUND

            if (!department) {
                return res.status(404).json({
                    status: "error",
                    message: "Department not found"
                });
            }

            // SUCCESS RESPONSE

            return res.status(200).json({
                status: "success",
                message: "Department status updated successfully",
                data: department
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
            message: "Failed to update department status",
            error: error.message
        });
    }
};


export const companyDepartmentDpdwn = async (req, res) => {

    const { flagId } = req.body;

    try {

        let result;

        if (parseInt(flagId) === 1) {
            result = await fetchcompany();

        } else if (parseInt(flagId) === 2) {
            result = await fetchDepartmentDown();

        } else {
            return res.status(404).json({
                status: false,
                message: "FlagId is Required"
            });
        }

        return res.status(200).json({
            status: true,
            message: "The companyDepartmentDropDown fetched successfully.",
            result
        });

    } catch (error) {

        console.error("Company Department Dropdown Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
};


// ==========================================================
// INSERT COMPANY DEPARTMENT
// FlagId 1
// ==========================================================

export const insertCompanyDepartment = async (req, res) => {

    const { flagId } = req.body;

    try {

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

        if (parseInt(flagId) === 1) {

            const {
                CompanyId,
                DepartmentId,
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


            // VALIDATE DEPARTMENT ID

            if (
                DepartmentId === undefined ||
                DepartmentId === null ||
                DepartmentId === ""
            ) {
                return res.status(400).json({
                    status: false,
                    message: "DepartmentId is required"
                });
            }

            if (
                !Number.isInteger(Number(DepartmentId)) ||
                Number(DepartmentId) <= 0 ||
                Number(DepartmentId) > 32767
            ) {
                return res.status(400).json({
                    status: false,
                    message: "DepartmentId must be a valid positive SMALLINT"
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


            // CHECK DEPARTMENT EXISTS

            const departmentData = await checkDepartmentExists(
                Number(DepartmentId)
            );

            if (!departmentData) {
                return res.status(404).json({
                    status: false,
                    message: "Department not found"
                });
            }


            // CHECK DUPLICATE COMPANY DEPARTMENT

            const existingData = await checkCompanyDepartmentExists(
                Number(CompanyId),
                Number(DepartmentId)
            );

            if (existingData) {
                return res.status(409).json({
                    status: false,
                    message: "This department is already assigned to this company"
                });
            }


            // INSERT COMPANY DEPARTMENT

            const result = await InsertCompanyDepartments({

                CompanyId: Number(CompanyId),

                DepartmentId: Number(DepartmentId),

                CreatedByUserName: CreatedByUserName.trim()

            });


            return res.status(201).json({
                status: true,
                message: "Company department inserted successfully",
                data: result
            });
        }


        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Insert Company Department Error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to insert company department",
            error: error.message
        });
    }
};


// ==========================================================
// FETCH COMPANY DEPARTMENT VIEW
// FlagId 1
// ==========================================================

export const fetchCompanyDepartmentViewController = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

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


            // FETCH COMPANY DEPARTMENT VIEW

            const result = await fetchCompanyDepartmentView(
                CompanyId === undefined ||
                CompanyId === null ||
                CompanyId === ""
                    ? null
                    : Number(CompanyId)
            );


            if (result.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "No company department records found",
                    data: []
                });
            }


            return res.status(200).json({
                status: true,
                message: "Company department view fetched successfully",
                data: result
            });
        }


        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Fetch Company Department View Error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to fetch company department view",
            error: error.message
        });
    }
};


// ==========================================================
// EDIT COMPANY DEPARTMENT
// FlagId 2
// ==========================================================

export const editCompanyDepartment = async (req, res) => {

    const {
        flagId,
        ComapnyDepartmentId,
        ...updateData
    } = req.body;

    try {

        if (parseInt(flagId) === 2) {

            // VALIDATE ComapnyDepartmentId

            if (
                !Number.isInteger(Number(ComapnyDepartmentId)) ||
                Number(ComapnyDepartmentId) <= 0
            ) {
                return res.status(400).json({
                    status: false,
                    message: "Valid ComapnyDepartmentId is required"
                });
            }


            // ALLOWED FIELDS

            const allowedFields = [
                "CompanyId",
                "DepartmentId",
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


            // VALIDATE UPDATE USER NAME

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


            // CHECK EXISTING RECORD

            const existingRecord = await getCompanyDepartmentById(
                Number(ComapnyDepartmentId)
            );

            if (!existingRecord) {
                return res.status(404).json({
                    status: false,
                    message: "Company department record not found"
                });
            }


            // MERGE EXISTING VALUES WITH PATCH FIELDS

            const finalCompanyId = Object.prototype.hasOwnProperty.call(
                updateData, "CompanyId"
            )
                ? updateData.CompanyId
                : existingRecord.CompanyId;

            const finalDepartmentId = Object.prototype.hasOwnProperty.call(
                updateData, "DepartmentId"
            )
                ? updateData.DepartmentId
                : existingRecord.DepartmentId;


            // VALIDATE COMPANY ID

            if (
                !Number.isInteger(Number(finalCompanyId)) ||
                Number(finalCompanyId) <= 0 ||
                Number(finalCompanyId) > 32767
            ) {
                return res.status(400).json({
                    status: false,
                    message: "CompanyId must be a valid positive SMALLINT"
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


            // VALIDATE DEPARTMENT ID

            if (
                !Number.isInteger(Number(finalDepartmentId)) ||
                Number(finalDepartmentId) <= 0 ||
                Number(finalDepartmentId) > 32767
            ) {
                return res.status(400).json({
                    status: false,
                    message: "DepartmentId must be a valid positive SMALLINT"
                });
            }

            const departmentExists = await checkDepartmentExists(
                Number(finalDepartmentId)
            );

            if (!departmentExists) {
                return res.status(404).json({
                    status: false,
                    message: "Department not found or disabled"
                });
            }


            // CHECK DUPLICATE COMPANY DEPARTMENT

            const duplicate = await checkCompanyDepartmentExistsForUpdate(
                Number(finalCompanyId),
                Number(finalDepartmentId),
                Number(ComapnyDepartmentId)
            );

            if (duplicate) {
                return res.status(409).json({
                    status: false,
                    message: "This department is already mapped to the selected company"
                });
            }


            // PREPARE UPDATE DATA

            const finalUpdateData = {};

            for (const field of fieldsToUpdate) {
                finalUpdateData[field] = updateData[field];
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    finalUpdateData, "CompanyId"
                )
            ) {
                finalUpdateData.CompanyId = Number(finalUpdateData.CompanyId);
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    finalUpdateData, "DepartmentId"
                )
            ) {
                finalUpdateData.DepartmentId = Number(finalUpdateData.DepartmentId);
            }


            const result = await updateCompanyDepartment(
                Number(ComapnyDepartmentId),
                finalUpdateData
            );

            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Company department record not found"
                });
            }


            return res.status(200).json({
                status: true,
                message: "Company department updated successfully",
                data: result
            });
        }


        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Edit Company Department Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


// ==========================================================
// TOGGLE COMPANY DEPARTMENT STATUS
// FlagId 3
// ==========================================================

export const toggleCompanyDepartmentController = async (req, res) => {

    const {
        flagId,
        ComapnyDepartmentId,
        IsDisabled,
        UpdateByUserName
    } = req.body;

    try {

        if (parseInt(flagId) === 3) {

            // VALIDATE ComapnyDepartmentId

            if (
                !Number.isInteger(Number(ComapnyDepartmentId)) ||
                Number(ComapnyDepartmentId) <= 0
            ) {
                return res.status(400).json({
                    status: false,
                    message: "Valid ComapnyDepartmentId is required"
                });
            }


            // VALIDATE IsDisabled

            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    status: false,
                    message: "IsDisabled must be true or false"
                });
            }


            // VALIDATE UPDATE USER NAME

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


            const result = await toggleCompanyDepartmentStatus(
                Number(ComapnyDepartmentId),
                IsDisabled,
                UpdateByUserName.trim()
            );


            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Company department record not found"
                });
            }


            return res.status(200).json({
                status: true,
                message: IsDisabled
                    ? "Company department deactivated successfully"
                    : "Company department activated successfully",
                data: result
            });
        }


        return res.status(400).json({
            status: false,
            message: "Invalid flagId"
        });

    } catch (error) {

        console.error("Toggle Company Department Status Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
