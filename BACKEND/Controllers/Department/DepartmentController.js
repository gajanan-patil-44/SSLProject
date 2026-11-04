import {
    getAllDepartments,
    checkDepartmentCompanyExists,
    checkDepartmentCodeExists,
    checkDepartmentCodeExistsForUpdate,
    addDepartmentModel,
    updateDepartmentModel,
    toggleDepartmentStatusModel
} from "../../Models/Department/DepartmentModel.js";


// GET ALL DEPARTMENTS

export const getDepartments = async (req, res) => {

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


        // flagId 1 = Get All Departments

        if (parseInt(flagId) === 1) {

            const rows = await getAllDepartments();

            return res.status(200).json({
                status: "success",
                message: "Departments fetched successfully",
                data: rows
            });
        }


        // INVALID flagId

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


        // flagId 2 = Add Department

        if (parseInt(flagId) === 2) {

            const departmentData = req.body;


            // COMPANY ID VALIDATION

            if (
                departmentData.CompanyId === undefined ||
                departmentData.CompanyId === null ||
                departmentData.CompanyId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }


            if (
                !Number.isInteger(Number(departmentData.CompanyId)) ||
                Number(departmentData.CompanyId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId must be a valid positive number"
                });
            }


            // REQUIRED FIELD VALIDATION

            if (
                departmentData.DepartmentName === undefined ||
                departmentData.DepartmentName === null ||
                String(departmentData.DepartmentName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DepartmentName is required"
                });
            }


            if (
                departmentData.DepartmentCode === undefined ||
                departmentData.DepartmentCode === null ||
                String(departmentData.DepartmentCode).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DepartmentCode is required"
                });
            }


            if (
                departmentData.CreatedByUserName === undefined ||
                departmentData.CreatedByUserName === null ||
                String(departmentData.CreatedByUserName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }


            // LENGTH VALIDATION
            // Database varchar = 150

            const departmentName = String(departmentData.DepartmentName).trim();
            const departmentCode = String(departmentData.DepartmentCode).trim();


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


            // CHECK WHETHER COMPANY EXISTS

            const existingCompany = await checkDepartmentCompanyExists(
                Number(departmentData.CompanyId)
            );


            if (existingCompany.length === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Company not found"
                });
            }


            // CHECK DUPLICATE DEPARTMENT CODE

            const existingDepartment = await checkDepartmentCodeExists(departmentCode);

            if (existingDepartment.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Department code already exists"
                });
            }


            // ADD DEPARTMENT

            const department = await addDepartmentModel({

                ...departmentData,

                CompanyId: Number(departmentData.CompanyId),
                DepartmentName: departmentName,
                DepartmentCode: departmentCode

            });


            return res.status(201).json({
                status: "success",
                message: "Department added successfully",
                data: department
            });
        }


        // INVALID flagId

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


        // flagId 3 = Update Department

        if (parseInt(flagId) === 3) {

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


            if (
                !Number.isInteger(Number(departmentData.DepartmentId)) ||
                Number(departmentData.DepartmentId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DepartmentId must be a valid positive number"
                });
            }


            // COMPANY ID VALIDATION

            if (
                departmentData.CompanyId === undefined ||
                departmentData.CompanyId === null ||
                departmentData.CompanyId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }


            if (
                !Number.isInteger(Number(departmentData.CompanyId)) ||
                Number(departmentData.CompanyId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyId must be a valid positive number"
                });
            }


            // REQUIRED FIELD VALIDATION

            if (
                departmentData.DepartmentName === undefined ||
                departmentData.DepartmentName === null ||
                String(departmentData.DepartmentName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DepartmentName is required"
                });
            }


            if (
                departmentData.DepartmentCode === undefined ||
                departmentData.DepartmentCode === null ||
                String(departmentData.DepartmentCode).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DepartmentCode is required"
                });
            }


            if (
                departmentData.UpdatedByUserName === undefined ||
                departmentData.UpdatedByUserName === null ||
                String(departmentData.UpdatedByUserName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }


            const departmentName = String(departmentData.DepartmentName).trim();
            const departmentCode = String(departmentData.DepartmentCode).trim();


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


            // CHECK WHETHER COMPANY EXISTS

            const existingCompany = await checkDepartmentCompanyExists(
                Number(departmentData.CompanyId)
            );


            if (existingCompany.length === 0) {

                return res.status(404).json({
                    status: "error",
                    message: "Company not found"
                });
            }


            // CHECK DUPLICATE DEPARTMENT CODE
            // EXCLUDE CURRENT DEPARTMENT

            const existingDepartments = await checkDepartmentCodeExistsForUpdate(
                departmentCode,
                Number(departmentData.DepartmentId)
            );


            if (existingDepartments.length > 0) {

                return res.status(409).json({
                    status: "error",
                    message: "Department code already exists"
                });
            }


            // UPDATE DEPARTMENT

            const department = await updateDepartmentModel({

                ...departmentData,

                DepartmentId: Number(departmentData.DepartmentId),
                CompanyId: Number(departmentData.CompanyId),
                DepartmentName: departmentName,
                DepartmentCode: departmentCode

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


        // INVALID flagId

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


        // flagId 4 = Toggle Department Status

        if (parseInt(flagId) === 4) {

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


            if (
                !Number.isInteger(Number(departmentData.DepartmentId)) ||
                Number(departmentData.DepartmentId) <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "DepartmentId must be a valid positive number"
                });
            }


            // STATUS VALIDATION

            if (typeof departmentData.IsDisabled !== "boolean") {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be either true or false"
                });
            }


            // UPDATED USER VALIDATION

            if (
                departmentData.UpdatedByUserName === undefined ||
                departmentData.UpdatedByUserName === null ||
                String(departmentData.UpdatedByUserName).trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "UpdatedByUserName is required"
                });
            }


            // TOGGLE DEPARTMENT STATUS

            const department = await toggleDepartmentStatusModel({

                ...departmentData,

                DepartmentId: Number(departmentData.DepartmentId)

            });


            // DEPARTMENT DOES NOT EXIST

            if (!department) {

                return res.status(404).json({
                    status: "error",
                    message: "Department not found"
                });
            }


            return res.status(200).json({
                status: "success",
                message: "Department status updated successfully",
                data: department
            });
        }


        // INVALID flagId

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