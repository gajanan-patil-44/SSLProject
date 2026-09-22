import { getAllUserDetails,editUserdetails } from "../../Models/userEditDetails/UserEdit.js";

import {getAllGenders, getAllMaritalStatuses, getAllDesignations, getAllCompanies, getAllReportingManagers, getAllCompanyProducts, getAllProjects, getAllRoles, toggleUserStatuses} from "../../Models/userEditDetails/UserEdit.js";



export const getAllUserDetailsController = async (req, res) => {
    const { flagId } = req.body
    try {
        if (Number(flagId) !== 1) {
            return res.status(400).json({ status: false, message: "Please Enter Valid FlagId" })
        }
        const result = await getAllUserDetails();
        return res.status(200).json({
            status: true,
            message: "UserDetails Fetched Successfully",
            data: result
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export const editUserdetailsController     = async (req, res) => {

    const {
        UserId,
        flagId,
        employeeId,
        firstName,
        middleName,
        lastName,
        phoneNumber,
        dateOfBirth,
        genderId,
        maritalStatusId,
        designationId,
        email,
        loginName,
        altPhoneNumber,
        dateOfJoining,
        updatedByUserName
    } = req.body;

    try {


        if (Number(flagId) !== 2) {

            return res.status(400).json({
                status: false,
                message: "Please Enter Valid FlagId"
            });

        }


        if (!UserId) {

            return res.status(400).json({
                status: false,
                message: "UserId is required"
            });

        }

        const result = await editUserdetails({

            UserId,

            employeeId,
            firstName,
            middleName,
            lastName,
            phoneNumber,
            dateOfBirth,
            genderId,
            maritalStatusId,
            designationId,
            email,
            loginName,
            altPhoneNumber,
            dateOfJoining,
            updatedByUserName

        });


        if (!result) {

            return res.status(404).json({
                status: false,
                message: "User not found"
            });

        }

        return res.status(200).json({
            status: true,
            message: "User Details Updated Successfully",
            data: result
        });

    } catch (error) {

        console.error("Edit User Details Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });

    }
};



// ======================================================
// GET GENDER
// ======================================================

export const getGender = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            const rows = await getAllGenders();

            return res.status(200).json({
                status: "success",
                message: "Genders fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch genders",
            error: error.message
        });
    }
};



// ======================================================
// GET MARITAL STATUS
// ======================================================

export const getMaritalStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            const rows = await getAllMaritalStatuses();

            return res.status(200).json({
                status: "success",
                message: "Marital statuses fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch marital statuses",
            error: error.message
        });
    }
};


// ======================================================
// GET DESIGNATION
// ======================================================

export const getDesignation = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllDesignations(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Designations fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch designations",
            error: error.message
        });
    }
};


// ======================================================
// GET COMPANY
// ======================================================

export const getCompany = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            const rows = await getAllCompanies();

            return res.status(200).json({
                status: "success",
                message: "Companies fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};


// ======================================================
// GET REPORTING MANAGER
// ======================================================

export const getReportingManager = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllReportingManagers(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Reporting managers fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch reporting managers",
            error: error.message
        });
    }
};


// ======================================================
// GET COMPANY PRODUCT
// ======================================================

export const getCompanyProduct = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllCompanyProducts(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Company products fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch company products",
            error: error.message
        });
    }
};


// ======================================================
// GET PROJECT
// ======================================================

export const getProject = async (req, res) => {

    const { flagId, CompanyProductId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyProductId) {
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
                    message: "Invalid CompanyProductId"
                });
            }

            const rows = await getAllProjects(CompanyProductId);

            return res.status(200).json({
                status: "success",
                message: "Projects fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};


// ======================================================
// GET ROLE
// ======================================================

export const getRole = async (req, res) => {

    const { flagId, CompanyId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (parseInt(flagId) == 1) {

            if (!CompanyId) {
                return res.status(400).json({
                    status: "error",
                    message: "CompanyId is required"
                });
            }

            if (!Number.isInteger(Number(CompanyId)) || Number(CompanyId) <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyId"
                });
            }

            const rows = await getAllRoles(CompanyId);

            return res.status(200).json({
                status: "success",
                message: "Roles fetched successfully",
                data: rows
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });
        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch roles",
            error: error.message
        });
    }
};


export const toggleUserStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (!flagId) {
            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        // flagId 4 = Toggle User Status
        if (parseInt(flagId) === 1) {

            const userData = req.body;
            const user = await toggleUserStatuses(userData);

            // User does not exist
            if (!user) {

                return res.status(404).json({
                    status: "error",
                    message: "User not found"
                });
            }

            // User status successfully toggled
            return res.status(200).json({
                status: "success",
                message: "User status updated successfully"
            });
        }

        // Invalid flagId
        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        // console.error("Error toggling user status:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update user status",
            error: error.message
        });
    }
};